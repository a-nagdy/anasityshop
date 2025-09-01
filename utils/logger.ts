export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;
    private isDevelopment: boolean;

    private constructor() {
        this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatMessage(entry: LogEntry): string {
        const timestamp = entry.timestamp;
        const level = LogLevel[entry.level];
        const context = entry.context ? `[${entry.context}]` : '';
        const metadata = entry.metadata ? `\n${JSON.stringify(entry.metadata, null, 2)}` : '';
        const error = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : '';

        return `${timestamp} ${level} ${context} ${entry.message}${metadata}${error}`;
    }

    private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>, error?: Error): void {
        if (level > this.logLevel) return;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            metadata,
            error,
        };

        const formattedMessage = this.formatMessage(entry);

        // In development, use console methods for better DevTools experience
        if (this.isDevelopment) {
            switch (level) {
                case LogLevel.ERROR:
                    console.error(formattedMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(formattedMessage);
                    break;
                case LogLevel.INFO:
                    console.info(formattedMessage);
                    break;
                case LogLevel.DEBUG:
                    console.debug(formattedMessage);
                    break;
            }
        } else {
            // In production, use structured logging
            console.log(JSON.stringify(entry));
        }
    }

    error(message: string, context?: string, metadata?: Record<string, unknown>, error?: Error): void {
        this.log(LogLevel.ERROR, message, context, metadata, error);
    }

    warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context, metadata);
    }

    info(message: string, context?: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context, metadata);
    }

    debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context, metadata);
    }

    // Performance logging
    time(label: string): void {
        if (this.isDevelopment) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }

    // API request logging
    apiRequest(method: string, url: string, metadata?: Record<string, unknown>): void {
        this.debug(`API ${method} ${url}`, 'API', metadata);
    }

    apiResponse(method: string, url: string, status: number, duration: number, metadata?: Record<string, unknown>): void {
        const message = `API ${method} ${url} - ${status} (${duration}ms)`;
        if (status >= 400) {
            this.error(message, 'API', metadata);
        } else if (status >= 300) {
            this.warn(message, 'API', metadata);
        } else {
            this.info(message, 'API', metadata);
        }
    }

    // Database logging
    dbQuery(operation: string, collection: string, duration?: number, metadata?: Record<string, unknown>): void {
        const message = `DB ${operation} on ${collection}${duration ? ` (${duration}ms)` : ''}`;
        this.debug(message, 'DATABASE', metadata);
    }

    dbError(operation: string, collection: string, error: Error, metadata?: Record<string, unknown>): void {
        const message = `DB ${operation} on ${collection} failed`;
        this.error(message, 'DATABASE', metadata, error);
    }

    // Authentication logging
    authEvent(event: string, userId?: string, metadata?: Record<string, unknown>): void {
        this.info(`Auth: ${event}`, 'AUTH', { userId, ...metadata });
    }

    authError(event: string, error: Error, metadata?: Record<string, unknown>): void {
        this.error(`Auth: ${event} failed`, 'AUTH', metadata, error);
    }

    // Business logic logging
    business(event: string, context?: string, metadata?: Record<string, unknown>): void {
        this.info(event, context || 'BUSINESS', metadata);
    }

    businessError(event: string, error: Error, context?: string, metadata?: Record<string, unknown>): void {
        this.error(event, context || 'BUSINESS', metadata, error);
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports for common patterns
export const logApiRequest = (method: string, url: string, metadata?: Record<string, unknown>) =>
    logger.apiRequest(method, url, metadata);

export const logApiResponse = (method: string, url: string, status: number, duration: number, metadata?: Record<string, unknown>) =>
    logger.apiResponse(method, url, status, duration, metadata);

export const logDbQuery = (operation: string, collection: string, duration?: number, metadata?: Record<string, unknown>) =>
    logger.dbQuery(operation, collection, duration, metadata);

export const logDbError = (operation: string, collection: string, error: Error, metadata?: Record<string, unknown>) =>
    logger.dbError(operation, collection, error, metadata);

export const logAuthEvent = (event: string, userId?: string, metadata?: Record<string, unknown>) =>
    logger.authEvent(event, userId, metadata);

export const logAuthError = (event: string, error: Error, metadata?: Record<string, unknown>) =>
    logger.authError(event, error, metadata);

export const logBusiness = (event: string, context?: string, metadata?: Record<string, unknown>) =>
    logger.business(event, context, metadata);

export const logBusinessError = (event: string, error: Error, context?: string, metadata?: Record<string, unknown>) =>
    logger.businessError(event, error, context, metadata);

// Performance measurement decorator
export function measurePerformance(target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
        const start = Date.now();
        const label = `${(target as { constructor: { name: string } }).constructor.name}.${propertyName}`;

        try {
            logger.time(label);
            const result = await originalMethod.apply(this, args);
            const duration = Date.now() - start;
            logger.debug(`${label} completed`, 'PERFORMANCE', { duration, args: args.length });
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            logger.error(`${label} failed`, 'PERFORMANCE', { duration, args: args.length }, error as Error);
            throw error;
        } finally {
            logger.timeEnd(label);
        }
    };

    return descriptor;
} 