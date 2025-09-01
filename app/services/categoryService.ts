import { logger } from '../../utils/logger';
import {
    CategoryFilters,
    CategoryResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from '../types/api';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

export class CategoryService extends BaseService {
    private static instance: CategoryService;

    constructor() {
        super(getServiceConfig('category'));
    }

    static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }

    /**
     * Get all categories with filters
     */
    static async getCategories(
        filters: CategoryFilters = {}
    ): Promise<CategoryResponse[]> {
        const service = CategoryService.getInstance();

        logger.business('Fetching categories', 'CategoryService', { filters });

        // Convert and clean parameters
        const rawParams: Record<string, string | number | boolean> = {};

        // Add filters, converting booleans to strings and filtering undefined
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                rawParams[key] = typeof value === 'boolean' ? value.toString() : value;
            }
        });

        const params = service.sanitizeData(rawParams);

        return service.measurePerformance(
            'getCategories',
            () => service.get<CategoryResponse[]>('/categories', params, {
                context: 'CategoryService.getCategories',
            })
        );
    }

    /**
     * Get single category by ID
     */
    static async getCategory(id: string): Promise<CategoryResponse> {
        const service = CategoryService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Fetching category: ${id}`, 'CategoryService', { categoryId: id });

        return service.measurePerformance(
            'getCategory',
            () => service.get<CategoryResponse>(`/categories/${id}`, undefined, {
                context: 'CategoryService.getCategory',
            })
        );
    }

    /**
     * Create new category
     */
    static async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
        const service = CategoryService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, ['name']);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Creating category', 'CategoryService', { categoryName: data.name });

        return service.measurePerformance(
            'createCategory',
            () => service.post<CategoryResponse>('/categories', sanitizedData, {
                context: 'CategoryService.createCategory',
                timeout: 15000, // Longer timeout for image uploads
            })
        );
    }

    /**
     * Update existing category
     */
    static async updateCategory(
        id: string,
        data: UpdateCategoryRequest
    ): Promise<CategoryResponse> {
        const service = CategoryService.getInstance();

        service.validateRequired({ id }, ['id']);

        const sanitizedData = service.sanitizeData({ ...data, id } as unknown as Record<string, unknown>);
        logger.business(`Updating category: ${id}`, 'CategoryService', { categoryId: id });

        return service.measurePerformance(
            'updateCategory',
            () => service.put<CategoryResponse>(`/categories/${id}`, sanitizedData, {
                context: 'CategoryService.updateCategory',
                timeout: 15000,
            })
        );
    }

    /**
     * Delete category
     */
    static async deleteCategory(id: string): Promise<void> {
        const service = CategoryService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Deleting category: ${id}`, 'CategoryService', { categoryId: id });

        return service.measurePerformance(
            'deleteCategory',
            () => service.delete<void>(`/categories/${id}`, {
                context: 'CategoryService.deleteCategory',
            })
        );
    }

    /**
     * Get active categories only
     */
    static async getActiveCategories(): Promise<CategoryResponse[]> {
        logger.business('Fetching active categories', 'CategoryService');

        return CategoryService.getCategories({ active: true });
    }

    /**
     * Get parent categories only (top-level)
     */
    static async getParentCategories(limit?: number): Promise<CategoryResponse[]> {
        logger.business('Fetching parent categories', 'CategoryService', { limit });

        const filters: CategoryFilters = { parentOnly: true, active: true };

        const categories = await CategoryService.getCategories(filters);

        if (limit) {
            return categories.slice(0, limit);
        }

        return categories;
    }

    /**
     * Get child categories of a parent
     */
    static async getChildCategories(parentId: string): Promise<CategoryResponse[]> {
        const service = CategoryService.getInstance();
        service.validateRequired({ parentId }, ['parentId']);

        logger.business('Fetching child categories', 'CategoryService', { parentId });

        return CategoryService.getCategories({ parent: parentId, active: true });
    }

    /**
     * Get featured categories
     */
    static async getFeaturedCategories(limit: number = 8): Promise<CategoryResponse[]> {
        logger.business('Fetching featured categories', 'CategoryService', { limit });

        // First get active parent categories
        const categories = await CategoryService.getCategories({
            active: true,
            parentOnly: true
        });

        // Filter for featured ones
        const featuredCategories = categories.filter(cat => cat.featured);

        return featuredCategories.slice(0, limit);
    }

    /**
     * Search categories by name
     */
    static async searchCategories(query: string): Promise<CategoryResponse[]> {
        logger.business('Searching categories', 'CategoryService', { query });

        return CategoryService.getCategories({ search: query, active: true });
    }

    /**
     * Get category hierarchy (with children)
     */
    static async getCategoryHierarchy(): Promise<CategoryResponse[]> {
        const service = CategoryService.getInstance();
        logger.business('Fetching category hierarchy', 'CategoryService');

        return service.measurePerformance(
            'getCategoryHierarchy',
            async () => {
                // Get all categories
                const allCategories = await CategoryService.getCategories({ active: true });

                // Build hierarchy
                const parentCategories = allCategories.filter(cat => !cat.parent);

                return parentCategories.map(parent => ({
                    ...parent,
                    children: allCategories.filter(cat =>
                        cat.parent && cat.parent._id === parent._id
                    )
                }));
            }
        );
    }

    /**
     * Get category with product count
     */
    static async getCategoryWithProductCount(id: string): Promise<CategoryResponse> {
        try {
            const category = await CategoryService.getCategory(id);

            // The API should already include productCount, but if not, we could calculate it
            logger.business(`Category product count: ${category.productCount}`, 'CategoryService', {
                categoryId: id,
                productCount: category.productCount
            });

            return category;
        } catch (error) {
            logger.error(`Failed to get category with product count: ${id}`, 'CategoryService', {
                categoryId: id,
            }, error as Error);
            throw error;
        }
    }

    /**
     * Get categories for navigation menu
     */
    static async getNavigationCategories(maxDepth: number = 2): Promise<CategoryResponse[]> {
        logger.business('Fetching navigation categories', 'CategoryService', { maxDepth });

        try {
            if (maxDepth === 1) {
                // Only parent categories
                return CategoryService.getParentCategories();
            } else {
                // Get hierarchy
                return CategoryService.getCategoryHierarchy();
            }
        } catch (error) {
            logger.error('Failed to fetch navigation categories', 'CategoryService', {
                maxDepth,
            }, error as Error);
            return []; // Return empty array on error for navigation
        }
    }

    /**
     * Check if category exists and is active
     */
    static async checkCategoryExists(id: string): Promise<boolean> {
        try {
            const category = await CategoryService.getCategory(id);
            return category.active;
        } catch {
            return false;
        }
    }

    /**
     * Get category by slug
     */
    static async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
        const service = CategoryService.getInstance();
        service.validateRequired({ slug }, ['slug']);

        logger.business(`Fetching category by slug: ${slug}`, 'CategoryService', { slug });

        // Use the categories endpoint with slug filter
        const categories = await CategoryService.getCategories({ active: true });
        const category = categories.find(cat => cat.slug === slug);

        if (!category) {
            throw new Error(`Category with slug '${slug}' not found`);
        }

        return category;
    }

    /**
     * Batch get categories by IDs
     */
    static async getCategoriesByIds(categoryIds: string[]): Promise<CategoryResponse[]> {
        const service = CategoryService.getInstance();
        service.validateRequired({ categoryIds }, ['categoryIds']);

        if (categoryIds.length === 0) {
            return [];
        }

        logger.business('Fetching categories by IDs', 'CategoryService', {
            count: categoryIds.length
        });

        return service.measurePerformance(
            'getCategoriesByIds',
            async () => {
                // For batch requests, we'll get all categories and filter
                const allCategories = await CategoryService.getCategories({ active: true });
                return allCategories.filter(cat => categoryIds.includes(cat._id));
            }
        );
    }
} 