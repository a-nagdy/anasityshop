/**
 * Service Configuration
 * Handles different environments and base URLs
 */

export interface ServiceConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    apiVersion: string;
}

/**
 * Get the appropriate base URL based on environment
 */
function getBaseURL(): string {
    // For server-side rendering (SSR)
    if (typeof window === 'undefined') {
        // Server-side: use full URL
        return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    // Client-side: use relative URLs (empty string means relative to current domain)
    return '';
}

/**
 * Get API base URL with version
 */
function getApiBaseURL(): string {
    const baseURL = getBaseURL();

    // For current setup, we use /api directly
    // In future, you might want /api/v1, /api/v2, etc.
    return baseURL ? `${baseURL}/api` : '/api';
}

/**
 * Default service configuration
 */
export const defaultServiceConfig: ServiceConfig = {
    baseURL: getApiBaseURL(),
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
    apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
};

/**
 * Service-specific configurations
 */
export const serviceConfigs = {
    auth: {
        ...defaultServiceConfig,
        timeout: 10000, // Shorter timeout for auth operations
        retries: 2, // Fewer retries for auth
    },

    order: {
        ...defaultServiceConfig,
        timeout: 30000, // Longer timeout for order operations
        retries: 3,
    },

    product: {
        ...defaultServiceConfig,
        timeout: 15000,
        retries: 3,
    },

    category: {
        ...defaultServiceConfig,
        timeout: 10000,
        retries: 3,
    },

    user: {
        ...defaultServiceConfig,
        timeout: 15000,
        retries: 3,
    },

    upload: {
        ...defaultServiceConfig,
        timeout: 60000, // Very long timeout for file uploads
        retries: 2,
    },

    settings: {
        ...defaultServiceConfig,
        timeout: 10000,
        retries: 3,
    },
};

/**
 * Environment-specific configurations
 */
export const environmentConfig = {
    development: {
        enableLogging: true,
        enableRetries: true,
        enableMetrics: true,
    },

    production: {
        enableLogging: false, // Reduce logging in production
        enableRetries: true,
        enableMetrics: true,
    },

    test: {
        enableLogging: false,
        enableRetries: false, // Faster tests
        enableMetrics: false,
    },
};

/**
 * Get current environment configuration
 */
export function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return environmentConfig[env as keyof typeof environmentConfig] || environmentConfig.development;
}

/**
 * Utility to build full API URL
 */
export function buildApiUrl(endpoint: string): string {
    const baseURL = getApiBaseURL();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    return baseURL ? `${baseURL}/${cleanEndpoint}` : `/${cleanEndpoint}`;
}

/**
 * Check if we're running on server-side
 */
export function isServerSide(): boolean {
    return typeof window === 'undefined';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Get service configuration by name
 */
export function getServiceConfig(serviceName: keyof typeof serviceConfigs): ServiceConfig {
    return serviceConfigs[serviceName] || defaultServiceConfig;
}
