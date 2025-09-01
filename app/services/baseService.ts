import { AppError, ErrorCode, ErrorHandler } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import {
    PaginatedResponse,
    RequestContext
} from '../types/api';

export interface HttpClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
}

export interface RequestOptions {
    timeout?: number;
    retries?: number;
    skipErrorLogging?: boolean;
    context?: string;
}

// API Response interfaces for documentation purposes
// These match the actual API response patterns found in the codebase

export class BaseService {
    protected baseURL: string;
    protected defaultTimeout: number;
    protected defaultHeaders: Record<string, string>;
    protected maxRetries: number;
    protected retryDelay: number;

    constructor(config: HttpClientConfig = {}) {
        this.baseURL = config.baseURL || '';
        this.defaultTimeout = config.timeout || 10000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
        this.maxRetries = config.retries || 3;
        this.retryDelay = config.retryDelay || 1000;
    }

    /**
     * Generate a unique request ID for tracking
     */
    protected generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create request context for logging and error tracking
     */
    protected createRequestContext(requestId?: string): RequestContext {
        return {
            requestId: requestId || this.generateRequestId(),
            timestamp: new Date().toISOString(),
            ip: 'server', // Will be overridden in actual requests
            userAgent: 'internal-service',
        };
    }

    /**
     * Sleep utility for retry delays
     */
    protected async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Make HTTP request with retry logic and error handling
     */
    protected async makeRequest<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        url: string,
        data?: unknown,
        options: RequestOptions = {}
    ): Promise<T> {
        const requestId = this.generateRequestId();
        const context = options.context || this.constructor.name;
        const maxRetries = options.retries ?? this.maxRetries;
        const timeout = options.timeout ?? this.defaultTimeout;

        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const startTime = Date.now();

            try {
                logger.apiRequest(method, url, { requestId, attempt, data });

                const response = await this.executeRequest<T>(method, url, data, {
                    timeout,
                    headers: this.defaultHeaders,
                });

                const duration = Date.now() - startTime;
                logger.apiResponse(method, url, 200, duration, { requestId });

                return response;

            } catch (error) {
                const duration = Date.now() - startTime;
                lastError = error instanceof Error ? error : new Error(String(error));

                // Log the error
                if (!options.skipErrorLogging) {
                    logger.apiResponse(method, url, 500, duration, {
                        requestId,
                        attempt,
                        error: lastError.message
                    });
                }

                // Don't retry on certain error types
                if (this.shouldNotRetry(lastError) || attempt === maxRetries) {
                    break;
                }

                // Wait before retrying
                if (attempt < maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
                    logger.debug(`Retrying request in ${delay}ms`, context, { requestId, attempt });
                    await this.sleep(delay);
                }
            }
        }

        // All retries failed, throw the last error
        const normalizedError = ErrorHandler.normalize(lastError, requestId);
        if (!options.skipErrorLogging) {
            ErrorHandler.logError(normalizedError, context);
        }
        throw normalizedError;
    }

    /**
     * Execute the actual HTTP request (to be implemented by subclasses or overridden)
     */
    protected async executeRequest<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        url: string,
        data?: unknown,
        config?: { timeout: number; headers: Record<string, string> }
    ): Promise<T> {
        const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

        const requestOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers || this.defaultHeaders,
            },
            signal: AbortSignal.timeout(config?.timeout || this.defaultTimeout),
        };

        if (data && method !== 'GET') {
            requestOptions.body = JSON.stringify(data);
        }

        let lastError: Error;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const startTime = Date.now();

                const response = await fetch(fullUrl, requestOptions);

                const duration = Date.now() - startTime;
                this.logRequest(method, url, response.status, duration, attempt);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}`);
                }

                const responseData = await response.json();

                // Handle different API response patterns based on my analysis:

                // 1. Products API: { success: true, data: { products: [...], pagination: {...} } }
                if (responseData.success && responseData.data && responseData.data.products) {
                    return {
                        data: responseData.data.products,
                        pagination: responseData.data.pagination
                    } as T;
                }

                // 2. Categories API: { categories: [...] } (no success property)
                if (responseData.categories && Array.isArray(responseData.categories)) {
                    return responseData.categories as T;
                }

                // 3. Orders API: { orders: [...], pagination: {...} }
                if (responseData.orders && Array.isArray(responseData.orders)) {
                    return {
                        data: responseData.orders,
                        pagination: responseData.pagination
                    } as T;
                }

                // 4. Auth API: { success: true, data: { user: {...}, token: "..." }, message: "..." }
                if (responseData.success && responseData.data && (responseData.data.user || responseData.data.token)) {
                    return responseData.data as T;
                }

                // 5. Stats API: { success: true, data: {...}, message: "..." }
                if (responseData.success && responseData.data && !Array.isArray(responseData.data)) {
                    return responseData.data as T;
                }

                // 6. Standard success response: { success: true, data: T }
                if (responseData.success && responseData.data) {
                    return responseData.data as T;
                }

                // 7. Direct data response (fallback for APIs that don't use wrapper)
                if (!responseData.success && !responseData.error && !responseData.message) {
                    return responseData as T;
                }

                // 8. Error response: { success: false, message: "...", errors?: {...} }
                if (responseData.success === false) {
                    throw new Error(responseData.message || 'API request failed');
                }

                // Default: return as-is
                return responseData as T;

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                if (attempt < this.maxRetries) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
                    await this.sleep(delay);
                    continue;
                }
            }
        }

        throw lastError!;
    }

    /**
     * Determine if an error should not be retried
     */
    protected shouldNotRetry(error: Error): boolean {
        // Don't retry client errors (4xx) except for rate limiting
        if (error instanceof AppError) {
            return error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429;
        }

        // Don't retry authentication errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return true;
        }

        // Don't retry validation errors
        if (error.name === 'ValidationError') {
            return true;
        }

        return false;
    }

    /**
     * GET request wrapper
     */
    protected async get<T>(
        url: string,
        params?: Record<string, string | number | boolean>,
        options?: RequestOptions
    ): Promise<T> {
        const queryString = params ? this.buildQueryString(params) : '';
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return this.makeRequest<T>('GET', fullUrl, undefined, options);
    }

    /**
     * POST request wrapper
     */
    protected async post<T>(
        url: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.makeRequest<T>('POST', url, data, options);
    }

    /**
     * PUT request wrapper
     */
    protected async put<T>(
        url: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.makeRequest<T>('PUT', url, data, options);
    }

    /**
     * DELETE request wrapper
     */
    protected async delete<T>(
        url: string,
        options?: RequestOptions
    ): Promise<T> {
        return this.makeRequest<T>('DELETE', url, undefined, options);
    }

    /**
     * PATCH request wrapper
     */
    protected async patch<T>(
        url: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.makeRequest<T>('PATCH', url, data, options);
    }

    /**
     * Build query string from parameters
     */
    protected buildQueryString(params: Record<string, string | number | boolean>): string {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        return searchParams.toString();
    }

    /**
     * Handle paginated responses
     */
    protected async getPaginated<T>(
        url: string,
        params: Record<string, string | number | boolean> = {},
        options?: RequestOptions
    ): Promise<PaginatedResponse<T>> {
        return this.get<PaginatedResponse<T>>(url, params, options);
    }

    /**
     * Validate required parameters
     */
    protected validateRequired(params: Record<string, unknown>, required: string[]): void {
        const missing = required.filter(key =>
            params[key] === undefined || params[key] === null || params[key] === ''
        );

        if (missing.length > 0) {
            throw new AppError(
                ErrorCode.VALIDATION_REQUIRED_FIELD,
                `Missing required parameters: ${missing.join(', ')}`,
                400,
                { missingFields: missing }
            );
        }
    }

    /**
     * Sanitize and validate data before sending
     */
    protected sanitizeData<T extends Record<string, unknown>>(data: T): T {
        const sanitized = { ...data };

        // Remove undefined values
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === undefined) {
                delete sanitized[key];
            }
        });

        return sanitized;
    }

    /**
     * Performance measurement wrapper
     */
    protected async measurePerformance<T>(
        operation: string,
        fn: () => Promise<T>,
        context?: string
    ): Promise<T> {
        const label = `${this.constructor.name}.${operation}`;
        const startTime = Date.now();

        try {
            logger.time(label);
            const result = await fn();
            const duration = Date.now() - startTime;

            logger.debug(`${operation} completed`, context || this.constructor.name, {
                duration,
                operation
            });

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`${operation} failed`, context || this.constructor.name, {
                duration,
                operation
            }, error as Error);
            throw error;
        } finally {
            logger.timeEnd(label);
        }
    }

    /**
     * Batch processing utility
     */
    protected async processBatch<T, R>(
        items: T[],
        processor: (item: T) => Promise<R>,
        batchSize: number = 10,
        delayBetweenBatches: number = 100
    ): Promise<R[]> {
        const results: R[] = [];

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);

            // Add delay between batches to prevent overwhelming the system
            if (i + batchSize < items.length && delayBetweenBatches > 0) {
                await this.sleep(delayBetweenBatches);
            }
        }

        return results;
    }

    private logRequest(method: string, url: string, status: number, duration: number, attempt: number) {
        logger.apiResponse(method, url, status, duration, {
            requestId: this.generateRequestId(),
            attempt,
        });
    }
} 