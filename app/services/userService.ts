import { logger } from '../../utils/logger';
import {
    CreateUserRequest,
    PaginatedResponse,
    PaginationParams,
    UpdateUserRequest,
    UserFilters,
    UserResponse,
} from '../types/api';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

export class UserService extends BaseService {
    private static instance: UserService;

    constructor() {
        super(getServiceConfig('user'));
    }

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Get current user profile
     */
    static async getProfile(): Promise<UserResponse> {
        const service = UserService.getInstance();

        logger.business('Fetching user profile', 'UserService');

        return service.measurePerformance(
            'getProfile',
            () => service.get<UserResponse>('/auth/me', undefined, {
                context: 'UserService.getProfile',
            })
        );
    }

    /**
     * Update user profile
     */
    static async updateProfile(data: UpdateUserRequest): Promise<UserResponse> {
        const service = UserService.getInstance();

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Updating user profile', 'UserService', {
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateProfile',
            () => service.put<UserResponse>('/auth/me', sanitizedData, {
                context: 'UserService.updateProfile',
            })
        );
    }

    /**
     * Get all users (admin only)
     */
    static async getUsers(
        filters: UserFilters = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<UserResponse>> {
        const service = UserService.getInstance();

        logger.business('Fetching users', 'UserService', { filters, pagination });

        // Convert and clean parameters
        const rawParams: Record<string, string | number | boolean> = {
            ...pagination,
        };

        // Add filters, converting booleans to strings and filtering undefined
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                rawParams[key] = typeof value === 'boolean' ? value.toString() : value;
            }
        });

        const params = service.sanitizeData(rawParams);

        return service.measurePerformance(
            'getUsers',
            () => service.getPaginated<UserResponse>('/customers', params, {
                context: 'UserService.getUsers',
            })
        );
    }

    /**
     * Get single user by ID (admin only)
     */
    static async getUser(id: string): Promise<UserResponse> {
        const service = UserService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Fetching user: ${id}`, 'UserService', { userId: id });

        return service.measurePerformance(
            'getUser',
            () => service.get<UserResponse>(`/customers/${id}`, undefined, {
                context: 'UserService.getUser',
            })
        );
    }

    /**
     * Create new user (admin only)
     */
    static async createUser(data: CreateUserRequest): Promise<UserResponse> {
        const service = UserService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'name',
            'email',
            'password'
        ]);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Creating user', 'UserService', {
            email: data.email,
            role: data.role || 'customer'
        });

        return service.measurePerformance(
            'createUser',
            () => service.post<UserResponse>('/customers', sanitizedData, {
                context: 'UserService.createUser',
            })
        );
    }

    /**
     * Update user (admin only)
     */
    static async updateUser(
        id: string,
        data: UpdateUserRequest
    ): Promise<UserResponse> {
        const service = UserService.getInstance();

        service.validateRequired({ id }, ['id']);

        const sanitizedData = service.sanitizeData({ ...data, id } as unknown as Record<string, unknown>);
        logger.business(`Updating user: ${id}`, 'UserService', {
            userId: id,
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateUser',
            () => service.put<UserResponse>(`/customers/${id}`, sanitizedData, {
                context: 'UserService.updateUser',
            })
        );
    }

    /**
     * Delete user (admin only)
     */
    static async deleteUser(id: string): Promise<void> {
        const service = UserService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Deleting user: ${id}`, 'UserService', { userId: id });

        return service.measurePerformance(
            'deleteUser',
            () => service.delete<void>(`/customers/${id}`, {
                context: 'UserService.deleteUser',
            })
        );
    }

    /**
     * Get user addresses
     */
    static async getAddresses(): Promise<AddressResponse[]> {
        const service = UserService.getInstance();

        logger.business('Fetching user addresses', 'UserService');

        return service.measurePerformance(
            'getAddresses',
            () => service.get<AddressResponse[]>('/addresses', undefined, {
                context: 'UserService.getAddresses',
            })
        );
    }

    /**
     * Add new address
     */
    static async addAddress(data: CreateAddressRequest): Promise<AddressResponse> {
        const service = UserService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'fullName',
            'address',
            'city',
            'state',
            'postalCode',
            'country'
        ]);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Adding user address', 'UserService', {
            city: data.city,
            country: data.country
        });

        return service.measurePerformance(
            'addAddress',
            () => service.post<AddressResponse>('/addresses', sanitizedData, {
                context: 'UserService.addAddress',
            })
        );
    }

    /**
     * Update address
     */
    static async updateAddress(
        id: string,
        data: UpdateAddressRequest
    ): Promise<AddressResponse> {
        const service = UserService.getInstance();

        service.validateRequired({ id }, ['id']);

        const sanitizedData = service.sanitizeData({ ...data, id } as unknown as Record<string, unknown>);
        logger.business(`Updating address: ${id}`, 'UserService', {
            addressId: id,
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateAddress',
            () => service.put<AddressResponse>(`/addresses/${id}`, sanitizedData, {
                context: 'UserService.updateAddress',
            })
        );
    }

    /**
     * Delete address
     */
    static async deleteAddress(id: string): Promise<void> {
        const service = UserService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Deleting address: ${id}`, 'UserService', { addressId: id });

        return service.measurePerformance(
            'deleteAddress',
            () => service.delete<void>(`/addresses/${id}`, {
                context: 'UserService.deleteAddress',
            })
        );
    }

    /**
     * Change user password
     */
    static async changePassword(data: ChangePasswordRequest): Promise<void> {
        const service = UserService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'currentPassword',
            'newPassword'
        ]);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Changing user password', 'UserService');

        return service.measurePerformance(
            'changePassword',
            () => service.put<void>('/auth/change-password', sanitizedData, {
                context: 'UserService.changePassword',
            })
        );
    }

    /**
     * Get active customers (admin dashboard)
     */
    static async getActiveCustomers(limit?: number): Promise<UserResponse[]> {
        logger.business('Fetching active customers', 'UserService', { limit });

        const response = await UserService.getUsers(
            { active: true, role: 'customer' },
            { limit, page: 1, sortBy: 'lastLogin', sortOrder: 'desc' }
        );

        return response.data || [];
    }

    /**
     * Get recent customers (admin dashboard)
     */
    static async getRecentCustomers(limit: number = 10): Promise<UserResponse[]> {
        logger.business('Fetching recent customers', 'UserService', { limit });

        const response = await UserService.getUsers(
            { role: 'customer' },
            { limit, page: 1, sortBy: 'createdAt', sortOrder: 'desc' }
        );

        return response.data || [];
    }

    /**
     * Search users
     */
    static async searchUsers(
        query: string,
        filters: Omit<UserFilters, 'search'> = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<UserResponse>> {
        const service = UserService.getInstance();
        service.validateRequired({ query }, ['query']);

        logger.business('Searching users', 'UserService', { query, filters });

        return UserService.getUsers(
            { ...filters, search: query },
            pagination
        );
    }

    /**
     * Get user statistics (admin dashboard)
     */
    static async getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisMonth: number;
        usersByRole: Record<string, number>;
    }> {
        logger.business('Fetching user statistics', 'UserService');

        try {
            // Get all users
            const allUsersResponse = await UserService.getUsers({}, { limit: 1000 });
            const allUsers = allUsersResponse.data || [];

            // Calculate statistics
            const totalUsers = allUsers.length;
            const activeUsers = allUsers.filter(user => user.active).length;

            // New users this month
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const newUsersThisMonth = allUsers.filter(user =>
                new Date(user.createdAt) >= thisMonth
            ).length;

            // Users by role
            const usersByRole: Record<string, number> = {};
            allUsers.forEach(user => {
                usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
            });

            return {
                totalUsers,
                activeUsers,
                newUsersThisMonth,
                usersByRole,
            };
        } catch (error) {
            logger.error('Failed to fetch user statistics', 'UserService', {}, error as Error);
            throw error;
        }
    }

    /**
     * Deactivate user account
     */
    static async deactivateUser(id: string): Promise<UserResponse> {
        logger.business(`Deactivating user: ${id}`, 'UserService', { userId: id });

        return UserService.updateUser(id, { active: false });
    }

    /**
     * Activate user account
     */
    static async activateUser(id: string): Promise<UserResponse> {
        logger.business(`Activating user: ${id}`, 'UserService', { userId: id });

        return UserService.updateUser(id, { active: true });
    }

    /**
     * Check if user exists by email
     */
    static async checkUserExists(email: string): Promise<boolean> {
        const service = UserService.getInstance();
        service.validateRequired({ email }, ['email']);

        try {
            const response = await UserService.searchUsers(email, {}, { limit: 1 });
            return (response.data || []).length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Get user by email
     */
    static async getUserByEmail(email: string): Promise<UserResponse | null> {
        const service = UserService.getInstance();
        service.validateRequired({ email }, ['email']);

        logger.business(`Fetching user by email: ${email}`, 'UserService', { email });

        try {
            const response = await UserService.searchUsers(email, {}, { limit: 1 });
            const users = response.data || [];
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            logger.error(`Failed to fetch user by email: ${email}`, 'UserService', {
                email
            }, error as Error);
            return null;
        }
    }
}

// Address types (add to api.ts if not already there)
export interface AddressResponse {
    _id: string;
    user: string;
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressRequest {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
    id?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
} 