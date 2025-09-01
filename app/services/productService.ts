import { logger } from '../../utils/logger';
import {
    CreateProductRequest,
    PaginatedResponse,
    PaginationParams,
    ProductFilters,
    ProductResponse,
    UpdateProductRequest,
} from '../types/api';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

export class ProductService extends BaseService {
    private static instance: ProductService;

    constructor() {
        super(getServiceConfig('product'));
    }

    static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }

    /**
     * Get paginated list of products with filters
     */
    static async getProducts(
        filters: ProductFilters = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<ProductResponse>> {
        const service = ProductService.getInstance();

        logger.business('Fetching products', 'ProductService', { filters, pagination });

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
            'getProducts',
            () => service.getPaginated<ProductResponse>('/products', params, {
                context: 'ProductService.getProducts',
            })
        );
    }

    /**
     * Get single product by ID
     */
    static async getProduct(id: string): Promise<ProductResponse> {
        const service = ProductService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Fetching product: ${id}`, 'ProductService', { productId: id });

        return service.measurePerformance(
            'getProduct',
            () => service.get<ProductResponse>(`/products/${id}`, undefined, {
                context: 'ProductService.getProduct',
            })
        );
    }

    /**
     * Create new product
     */
    static async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
        const service = ProductService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, ['name', 'description', 'price', 'category', 'quantity']);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Creating product', 'ProductService', { productName: data.name });

        return service.measurePerformance(
            'createProduct',
            () => service.post<ProductResponse>('/products', sanitizedData, {
                context: 'ProductService.createProduct',
                timeout: 20000, // Longer timeout for file uploads
            })
        );
    }

    /**
     * Update existing product
     */
    static async updateProduct(
        id: string,
        data: UpdateProductRequest
    ): Promise<ProductResponse> {
        const service = ProductService.getInstance();

        service.validateRequired({ id }, ['id']);

        const sanitizedData = service.sanitizeData({ ...data, id } as Record<string, unknown>);
        logger.business(`Updating product: ${id}`, 'ProductService', { productId: id });

        return service.measurePerformance(
            'updateProduct',
            () => service.put<ProductResponse>(`/products/${id}`, sanitizedData, {
                context: 'ProductService.updateProduct',
                timeout: 20000,
            })
        );
    }

    /**
     * Delete product
     */
    static async deleteProduct(id: string): Promise<void> {
        const service = ProductService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Deleting product: ${id}`, 'ProductService', { productId: id });

        return service.measurePerformance(
            'deleteProduct',
            () => service.delete<void>(`/products/${id}`, {
                context: 'ProductService.deleteProduct',
            })
        );
    }

    /**
     * Get featured products
     */
    static async getFeaturedProducts(limit: number = 8): Promise<ProductResponse[]> {
        logger.business('Fetching featured products', 'ProductService', { limit });

        const response = await ProductService.getProducts(
            { featured: true },
            { limit, page: 1 }
        );

        return response.data || [];
    }

    /**
     * Get new products
     */
    static async getNewProducts(limit: number = 8): Promise<ProductResponse[]> {
        logger.business('Fetching new products', 'ProductService', { limit });

        const response = await ProductService.getProducts(
            { new: true },
            { limit, page: 1, sortBy: 'createdAt', sortOrder: 'desc' }
        );

        return response.data || [];
    }

    /**
     * Get sale products
     */
    static async getSaleProducts(limit: number = 8): Promise<ProductResponse[]> {
        logger.business('Fetching sale products', 'ProductService', { limit });

        const response = await ProductService.getProducts(
            { sale: true },
            { limit, page: 1 }
        );

        return response.data || [];
    }

    /**
     * Search products
     */
    static async searchProducts(
        query: string,
        filters: Omit<ProductFilters, 'search'> = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<ProductResponse>> {
        logger.business('Searching products', 'ProductService', { query, filters });

        return ProductService.getProducts(
            { ...filters, search: query },
            pagination
        );
    }

    /**
     * Get products by category
     */
    static async getProductsByCategory(
        categoryId: string,
        filters: Omit<ProductFilters, 'category'> = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<ProductResponse>> {
        const service = ProductService.getInstance();
        service.validateRequired({ categoryId }, ['categoryId']);

        logger.business('Fetching products by category', 'ProductService', {
            categoryId,
            filters
        });

        return ProductService.getProducts(
            { ...filters, category: categoryId },
            pagination
        );
    }

    /**
     * Get related products (same category, excluding current product)
     */
    static async getRelatedProducts(
        productId: string,
        categoryId: string,
        limit: number = 4
    ): Promise<ProductResponse[]> {
        const service = ProductService.getInstance();
        service.validateRequired({ productId, categoryId }, ['productId', 'categoryId']);

        logger.business('Fetching related products', 'ProductService', {
            productId,
            categoryId,
            limit
        });

        try {
            const response = await ProductService.getProducts(
                { category: categoryId },
                { limit: limit + 1, page: 1 } // Get one extra to filter out current product
            );

            // Filter out the current product
            const relatedProducts = (response.data || [])
                .filter(product => product._id !== productId)
                .slice(0, limit);

            return relatedProducts;
        } catch (error) {
            logger.error('Failed to fetch related products', 'ProductService', {
                productId,
                categoryId,
            }, error as Error);
            return []; // Return empty array on error
        }
    }

    /**
     * Batch get products by IDs
     */
    static async getProductsByIds(productIds: string[]): Promise<ProductResponse[]> {
        const service = ProductService.getInstance();
        service.validateRequired({ productIds }, ['productIds']);

        if (productIds.length === 0) {
            return [];
        }

        logger.business('Fetching products by IDs', 'ProductService', {
            count: productIds.length
        });

        const response = await ProductService.getProducts(
            { productIds },
            { limit: productIds.length }
        );

        return response.data || [];
    }

    /**
     * Check product availability
     */
    static async checkAvailability(productId: string): Promise<boolean> {
        try {
            const product = await ProductService.getProduct(productId);
            return product.active && product.quantity > 0 && product.status === 'active';
        } catch {
            return false;
        }
    }

    /**
     * Update product stock after purchase
     */
    static async updateStock(productId: string, quantityPurchased: number): Promise<void> {
        try {
            const product = await ProductService.getProduct(productId);
            const newQuantity = Math.max(0, product.quantity - quantityPurchased);

            await ProductService.updateProduct(productId, {
                id: productId,
                quantity: newQuantity,
            });

            logger.business(`Stock updated for product: ${productId}`, 'ProductService', {
                productId,
                oldQuantity: product.quantity,
                newQuantity,
                quantityPurchased,
            });
        } catch (error) {
            logger.error(`Failed to update stock for product: ${productId}`, 'ProductService', {
                productId,
                quantityPurchased,
            }, error as Error);
            throw error;
        }
    }

    /**
     * Get product statistics (admin dashboard)
     */
    static async getProductStats(): Promise<{
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        productsByCategory: Record<string, number>;
    }> {
        logger.business('Fetching product statistics', 'ProductService');

        try {
            // Get all products
            const response = await ProductService.getProducts({}, { limit: 1000 });
            const products = response.data || [];

            // Calculate statistics
            const totalProducts = products.length;
            const activeProducts = products.filter(product => product.active && product.status === 'active').length;
            const lowStockProducts = products.filter(product => product.quantity > 0 && product.quantity <= 10).length;
            const outOfStockProducts = products.filter(product => product.quantity === 0).length;

            // Products by category
            const productsByCategory: Record<string, number> = {};
            products.forEach(product => {
                const categoryName = product.category?.name || 'Uncategorized';
                productsByCategory[categoryName] = (productsByCategory[categoryName] || 0) + 1;
            });

            return {
                totalProducts,
                activeProducts,
                lowStockProducts,
                outOfStockProducts,
                productsByCategory,
            };
        } catch (error) {
            logger.error('Failed to fetch product statistics', 'ProductService', {}, error as Error);
            throw error;
        }
    }
} 