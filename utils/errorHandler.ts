import { logger } from './logger';

export enum ErrorCode {
    // Authentication errors
    AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
    AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
    AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
    AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
    AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
    AUTH_USER_INACTIVE = 'AUTH_USER_INACTIVE',

    // Validation errors
    VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
    VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
    VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',
    VALIDATION_DUPLICATE_VALUE = 'VALIDATION_DUPLICATE_VALUE',

    // Resource errors
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
    RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
    RESOURCE_GONE = 'RESOURCE_GONE',

    // Business logic errors
    BUSINESS_INSUFFICIENT_STOCK = 'BUSINESS_INSUFFICIENT_STOCK',
    BUSINESS_INVALID_OPERATION = 'BUSINESS_INVALID_OPERATION',
    BUSINESS_QUOTA_EXCEEDED = 'BUSINESS_QUOTA_EXCEEDED',
    BUSINESS_PAYMENT_FAILED = 'BUSINESS_PAYMENT_FAILED',

    // System errors
    SYSTEM_DATABASE_ERROR = 'SYSTEM_DATABASE_ERROR',
    SYSTEM_EXTERNAL_SERVICE_ERROR = 'SYSTEM_EXTERNAL_SERVICE_ERROR',
    SYSTEM_CONFIGURATION_ERROR = 'SYSTEM_CONFIGURATION_ERROR',
    SYSTEM_RATE_LIMIT_EXCEEDED = 'SYSTEM_RATE_LIMIT_EXCEEDED',

    // Generic errors
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    FORBIDDEN = 'FORBIDDEN',
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    statusCode: number;
    timestamp: string;
    requestId?: string;
    stack?: string;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;
    public readonly timestamp: string;
    public readonly requestId?: string;

    constructor(
        code: ErrorCode,
        message: string,
        statusCode: number = 500,
        details?: Record<string, unknown>,
        requestId?: string
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.requestId = requestId;

        // Maintain proper stack trace
        Error.captureStackTrace(this, AppError);
    }

    toJSON(): ApiError {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            requestId: this.requestId,
            stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
        };
    }
}

export class ValidationAppError extends AppError {
    public readonly validationErrors: ValidationError[];

    constructor(
        message: string,
        validationErrors: ValidationError[],
        requestId?: string
    ) {
        super(ErrorCode.VALIDATION_INVALID_FORMAT, message, 400, { validationErrors }, requestId);
        this.validationErrors = validationErrors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed', requestId?: string) {
        super(ErrorCode.AUTH_INVALID_CREDENTIALS, message, 401, undefined, requestId);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions', requestId?: string) {
        super(ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS, message, 403, undefined, requestId);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string, requestId?: string) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(ErrorCode.RESOURCE_NOT_FOUND, message, 404, { resource, identifier }, requestId);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
        super(ErrorCode.RESOURCE_CONFLICT, message, 409, details, requestId);
    }
}

export class BusinessLogicError extends AppError {
    constructor(code: ErrorCode, message: string, details?: Record<string, unknown>, requestId?: string) {
        super(code, message, 422, details, requestId);
    }
}

export class SystemError extends AppError {
    constructor(code: ErrorCode, message: string, details?: Record<string, unknown>, requestId?: string) {
        super(code, message, 500, details, requestId);
    }
}

export class ErrorHandler {
    /**
     * Normalize any error to a consistent AppError format
     */
    static normalize(error: unknown, requestId?: string): AppError {
        // Already an AppError
        if (error instanceof AppError) {
            return error;
        }

        // Standard Error
        if (error instanceof Error) {
            // Check for specific error types
            if (error.name === 'ValidationError') {
                return this.handleValidationError(error, requestId);
            }

            if (error.name === 'CastError') {
                return this.handleCastError(error, requestId);
            }

            if (error.name === 'MongoError' || error.name === 'MongoServerError') {
                return this.handleMongoError(error, requestId);
            }

            if (error.name === 'JsonWebTokenError') {
                return new AuthenticationError('Invalid token', requestId);
            }

            if (error.name === 'TokenExpiredError') {
                return new AppError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Token expired', 401, undefined, requestId);
            }

            // Generic error
            return new AppError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                error.message || 'Internal server error',
                500,
                { originalError: error.name },
                requestId
            );
        }

        // String error
        if (typeof error === 'string') {
            return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 500, undefined, requestId);
        }

        // Unknown error type
        return new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'An unknown error occurred',
            500,
            { originalError: String(error) },
            requestId
        );
    }

    /**
     * Handle Mongoose validation errors
     */
    private static handleValidationError(error: Error, requestId?: string): ValidationAppError {
        const validationErrors: ValidationError[] = [];

        // Extract validation errors from Mongoose error
        if ('errors' in error && typeof error.errors === 'object' && error.errors) {
            Object.entries(error.errors).forEach(([field, err]) => {
                if (err && typeof err === 'object' && 'message' in err) {
                    validationErrors.push({
                        field,
                        message: String(err.message),
                        value: 'value' in err ? err.value : undefined,
                    });
                }
            });
        }

        return new ValidationAppError(
            'Validation failed',
            validationErrors,
            requestId
        );
    }

    /**
     * Handle Mongoose cast errors
     */
    private static handleCastError(error: Error, requestId?: string): AppError {
        const message = error.message.includes('ObjectId')
            ? 'Invalid ID format'
            : 'Invalid data format';

        return new AppError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            message,
            400,
            { originalError: error.message },
            requestId
        );
    }

    /**
     * Handle MongoDB errors
     */
    private static handleMongoError(error: Error, requestId?: string): AppError {
        // Duplicate key error
        if ('code' in error && error.code === 11000) {
            const field = this.extractDuplicateField(error.message);
            return new ConflictError(
                `${field} already exists`,
                { field, originalError: error.message },
                requestId
            );
        }

        // Connection error
        if (error.message.includes('connection') || error.message.includes('timeout')) {
            return new SystemError(
                ErrorCode.SYSTEM_DATABASE_ERROR,
                'Database connection error',
                { originalError: error.message },
                requestId
            );
        }

        // Generic database error
        return new SystemError(
            ErrorCode.SYSTEM_DATABASE_ERROR,
            'Database operation failed',
            { originalError: error.message },
            requestId
        );
    }

    /**
     * Extract field name from MongoDB duplicate key error
     */
    private static extractDuplicateField(message: string): string {
        const match = message.match(/index: (\w+)_/);
        return match ? match[1] : 'field';
    }

    /**
     * Log error with appropriate level
     */
    static logError(error: AppError, context?: string, metadata?: Record<string, unknown>): void {
        const logMetadata = {
            code: error.code,
            statusCode: error.statusCode,
            requestId: error.requestId,
            details: error.details,
            ...metadata,
        };

        if (error.statusCode >= 500) {
            logger.error(error.message, context, logMetadata, error);
        } else if (error.statusCode >= 400) {
            logger.warn(error.message, context, logMetadata);
        } else {
            logger.info(error.message, context, logMetadata);
        }
    }

    /**
     * Create standardized error responses for API
     */
    static createErrorResponse(error: unknown, requestId?: string) {
        const normalizedError = this.normalize(error, requestId);
        this.logError(normalizedError);

        return {
            success: false,
            error: normalizedError.toJSON(),
            timestamp: normalizedError.timestamp,
            requestId: normalizedError.requestId,
        };
    }

    /**
     * Wrap async functions with error handling
     */
    static async withErrorHandling<T>(
        fn: () => Promise<T>,
        context?: string,
        requestId?: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            const normalizedError = this.normalize(error, requestId);
            this.logError(normalizedError, context);
            throw normalizedError;
        }
    }
}

// Convenience functions for common error scenarios
export const throwNotFound = (resource: string, identifier?: string, requestId?: string): never => {
    throw new NotFoundError(resource, identifier, requestId);
};

export const throwValidation = (message: string, errors: ValidationError[], requestId?: string): never => {
    throw new ValidationAppError(message, errors, requestId);
};

export const throwUnauthorized = (message?: string, requestId?: string): never => {
    throw new AuthenticationError(message, requestId);
};

export const throwForbidden = (message?: string, requestId?: string): never => {
    throw new AuthorizationError(message, requestId);
};

export const throwConflict = (message: string, details?: Record<string, unknown>, requestId?: string): never => {
    throw new ConflictError(message, details, requestId);
};

export const throwBusinessError = (code: ErrorCode, message: string, details?: Record<string, unknown>, requestId?: string): never => {
    throw new BusinessLogicError(code, message, details, requestId);
};

export const throwSystemError = (code: ErrorCode, message: string, details?: Record<string, unknown>, requestId?: string): never => {
    throw new SystemError(code, message, details, requestId);
}; 