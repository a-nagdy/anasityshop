import { logger } from '../../utils/logger';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
} from '../types/api';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

export class AuthService extends BaseService {
    private static instance: AuthService;

    constructor() {
        super(getServiceConfig('auth'));
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Login user with credentials
     */
    static async login(credentials: LoginRequest): Promise<AuthResponse> {
        const service = AuthService.getInstance();

        service.validateRequired(credentials as unknown as Record<string, unknown>, [
            'email',
            'password'
        ]);

        const sanitizedData = service.sanitizeData(credentials as unknown as Record<string, unknown>);
        logger.business('User login attempt', 'AuthService', {
            email: credentials.email
        });

        return service.measurePerformance(
            'login',
            () => service.post<AuthResponse>('/auth/login', sanitizedData, {
                context: 'AuthService.login',
                timeout: 10000,
            })
        );
    }

    /**
     * Register new user
     */
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        const service = AuthService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'name',
            'email',
            'password'
        ]);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('User registration attempt', 'AuthService', {
            email: data.email,
            name: data.name
        });

        return service.measurePerformance(
            'register',
            () => service.post<AuthResponse>('/auth/register', sanitizedData, {
                context: 'AuthService.register',
                timeout: 15000, // Longer timeout for registration
            })
        );
    }

    /**
     * Logout current user
     */
    static async logout(): Promise<void> {
        const service = AuthService.getInstance();

        logger.business('User logout', 'AuthService');

        return service.measurePerformance(
            'logout',
            () => service.post<void>('/auth/logout', {}, {
                context: 'AuthService.logout',
            })
        );
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(): Promise<AuthResponse> {
        const service = AuthService.getInstance();

        logger.business('Token refresh attempt', 'AuthService');

        return service.measurePerformance(
            'refreshToken',
            () => service.post<AuthResponse>('/auth/refresh', {}, {
                context: 'AuthService.refreshToken',
            })
        );
    }

    /**
     * Get current authenticated user
     */
    static async getCurrentUser(): Promise<UserResponse> {
        const service = AuthService.getInstance();

        logger.business('Fetching current user', 'AuthService');

        return service.measurePerformance(
            'getCurrentUser',
            () => service.get<UserResponse>('/auth/me', undefined, {
                context: 'AuthService.getCurrentUser',
            })
        );
    }

    /**
     * Change user password
     */
    static async changePassword(data: ChangePasswordRequest): Promise<void> {
        const service = AuthService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'currentPassword',
            'newPassword'
        ]);

        // Additional validation for password change
        if (data.newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }

        if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
            throw new Error('New password and confirmation do not match');
        }

        const sanitizedData = service.sanitizeData({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });

        logger.business('Password change attempt', 'AuthService');

        return service.measurePerformance(
            'changePassword',
            () => service.put<void>('/auth/change-password', sanitizedData, {
                context: 'AuthService.changePassword',
            })
        );
    }

    /**
     * Request password reset
     */
    static async requestPasswordReset(email: string): Promise<void> {
        const service = AuthService.getInstance();

        service.validateRequired({ email }, ['email']);

        const sanitizedData = service.sanitizeData({ email });
        logger.business('Password reset request', 'AuthService', { email });

        return service.measurePerformance(
            'requestPasswordReset',
            () => service.post<void>('/auth/forgot-password', sanitizedData, {
                context: 'AuthService.requestPasswordReset',
            })
        );
    }

    /**
     * Reset password with token
     */
    static async resetPassword(data: ResetPasswordRequest): Promise<void> {
        const service = AuthService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'token',
            'newPassword'
        ]);

        // Additional validation
        if (data.newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }

        if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
            throw new Error('New password and confirmation do not match');
        }

        const sanitizedData = service.sanitizeData({
            token: data.token,
            newPassword: data.newPassword,
        });

        logger.business('Password reset with token', 'AuthService');

        return service.measurePerformance(
            'resetPassword',
            () => service.post<void>('/auth/reset-password', sanitizedData, {
                context: 'AuthService.resetPassword',
                timeout: 10000,
            })
        );
    }

    /**
     * Verify email address
     */
    static async verifyEmail(token: string): Promise<void> {
        const service = AuthService.getInstance();

        service.validateRequired({ token }, ['token']);

        const sanitizedData = service.sanitizeData({ token });
        logger.business('Email verification attempt', 'AuthService');

        return service.measurePerformance(
            'verifyEmail',
            () => service.post<void>('/auth/verify-email', sanitizedData, {
                context: 'AuthService.verifyEmail',
            })
        );
    }

    /**
     * Resend email verification
     */
    static async resendEmailVerification(): Promise<void> {
        const service = AuthService.getInstance();

        logger.business('Resending email verification', 'AuthService');

        return service.measurePerformance(
            'resendEmailVerification',
            () => service.post<void>('/auth/resend-verification', {}, {
                context: 'AuthService.resendEmailVerification',
            })
        );
    }

    /**
     * Check if user is authenticated (client-side utility)
     */
    static isAuthenticated(): boolean {
        try {
            // Check for token in localStorage or cookies
            const token = localStorage.getItem('authToken') ||
                document.cookie.split('; ')
                    .find(row => row.startsWith('authToken='))
                    ?.split('=')[1];

            if (!token) return false;

            // Basic token validation (you might want more sophisticated validation)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            return !isExpired;
        } catch {
            return false;
        }
    }

    /**
     * Get stored auth token (client-side utility)
     */
    static getAuthToken(): string | null {
        try {
            return localStorage.getItem('authToken') ||
                document.cookie.split('; ')
                    .find(row => row.startsWith('authToken='))
                    ?.split('=')[1] || null;
        } catch {
            return null;
        }
    }

    /**
     * Store auth token (client-side utility)
     */
    static setAuthToken(token: string, expiresIn?: number): void {
        try {
            // Store in localStorage
            localStorage.setItem('authToken', token);

            // Also store in cookie if expiration is provided
            if (expiresIn) {
                const expirationDate = new Date(Date.now() + expiresIn * 1000);
                document.cookie = `authToken=${token}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;
            }

            logger.debug('Auth token stored', 'AuthService');
        } catch (error) {
            logger.error('Failed to store auth token', 'AuthService', {}, error as Error);
        }
    }

    /**
     * Remove auth token (client-side utility)
     */
    static removeAuthToken(): void {
        try {
            // Remove from localStorage
            localStorage.removeItem('authToken');

            // Remove from cookies
            document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            logger.debug('Auth token removed', 'AuthService');
        } catch (error) {
            logger.error('Failed to remove auth token', 'AuthService', {}, error as Error);
        }
    }

    /**
     * Get user role from token (client-side utility)
     */
    static getUserRole(): string | null {
        try {
            const token = AuthService.getAuthToken();
            if (!token) return null;

            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || null;
        } catch {
            return null;
        }
    }

    /**
     * Check if user has specific role
     */
    static hasRole(role: string): boolean {
        const userRole = AuthService.getUserRole();
        return userRole === role;
    }

    /**
     * Check if user is admin
     */
    static isAdmin(): boolean {
        return AuthService.hasRole('admin') || AuthService.hasRole('super_admin');
    }

    /**
     * Validate password strength
     */
    static validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
        strength: 'weak' | 'medium' | 'strong';
    } {
        const errors: string[] = [];
        let score = 0;

        // Length check
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        } else if (password.length >= 8) {
            score += 1;
        }

        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Common password patterns
        if (password.toLowerCase().includes('password')) {
            errors.push('Password should not contain the word "password"');
            score -= 1;
        }

        if (/^(.)\1+$/.test(password)) {
            errors.push('Password should not be all the same character');
            score -= 1;
        }

        // Determine strength
        let strength: 'weak' | 'medium' | 'strong' = 'weak';
        if (score >= 4) strength = 'strong';
        else if (score >= 2) strength = 'medium';

        return {
            isValid: errors.length === 0 && password.length >= 6,
            errors,
            strength,
        };
    }

    /**
     * Login with social provider (OAuth)
     */
    static async loginWithProvider(provider: 'google' | 'facebook' | 'github'): Promise<void> {
        logger.business(`Social login attempt with ${provider}`, 'AuthService', { provider });

        // Redirect to OAuth provider
        window.location.href = `/auth/${provider}`;
    }

    /**
     * Handle OAuth callback
     */
    static async handleOAuthCallback(code: string, provider: string): Promise<AuthResponse> {
        const service = AuthService.getInstance();

        service.validateRequired({ code, provider }, ['code', 'provider']);

        const sanitizedData = service.sanitizeData({ code, provider });
        logger.business(`OAuth callback for ${provider}`, 'AuthService', { provider });

        return service.measurePerformance(
            'handleOAuthCallback',
            () => service.post<AuthResponse>(`/auth/${provider}/callback`, sanitizedData, {
                context: 'AuthService.handleOAuthCallback',
                timeout: 15000,
            })
        );
    }
}

// Additional types for AuthService
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword?: string;
} 