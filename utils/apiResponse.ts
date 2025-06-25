interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    meta?: Record<string, unknown>;
}

export class ApiResponseHelper {
    static success<T>(data: T, message?: string, pagination?: ApiResponse['pagination']): ApiResponse<T> {
        return {
            success: true,
            data,
            message,
            pagination
        };
    }

    static error(message: string, errors?: Record<string, string>): ApiResponse {
        return {
            success: false,
            message,
            errors
        };
    }

    static validationError(errors: Record<string, string>): ApiResponse {
        return {
            success: false,
            message: 'Validation failed',
            errors
        };
    }

    static notFound(resource: string = 'Resource'): ApiResponse {
        return {
            success: false,
            message: `${resource} not found`
        };
    }

    static serverError(message: string = 'Internal server error'): ApiResponse {
        return {
            success: false,
            message
        };
    }
} 