import { logger } from '../../utils/logger';
import {
    CreateOrderRequest,
    OrderFilters,
    OrderResponse,
    OrderTrackingResponse,
    PaginatedResponse,
    PaginationParams,
    UpdateOrderRequest,
} from '../types/api';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

export class OrderService extends BaseService {
    private static instance: OrderService;

    constructor() {
        super(getServiceConfig('order'));
    }

    static getInstance(): OrderService {
        if (!OrderService.instance) {
            OrderService.instance = new OrderService();
        }
        return OrderService.instance;
    }

    /**
     * Get paginated list of orders with filters
     */
    static async getOrders(
        filters: OrderFilters = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<OrderResponse>> {
        const service = OrderService.getInstance();

        logger.business('Fetching orders', 'OrderService', { filters, pagination });

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
            'getOrders',
            () => service.getPaginated<OrderResponse>('/orders', params, {
                context: 'OrderService.getOrders',
            })
        );
    }

    /**
     * Get single order by ID
     */
    static async getOrder(id: string): Promise<OrderResponse> {
        const service = OrderService.getInstance();

        service.validateRequired({ id }, ['id']);
        logger.business(`Fetching order: ${id}`, 'OrderService', { orderId: id });

        return service.measurePerformance(
            'getOrder',
            () => service.get<OrderResponse>(`/orders/${id}`, undefined, {
                context: 'OrderService.getOrder',
            })
        );
    }

    /**
     * Create new order
     */
    static async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
        const service = OrderService.getInstance();

        service.validateRequired(data as unknown as Record<string, unknown>, [
            'items',
            'shipping',
            'payment',
            'itemsPrice',
            'totalPrice'
        ]);

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Creating order', 'OrderService', {
            itemCount: data.items.length,
            totalPrice: data.totalPrice
        });

        return service.measurePerformance(
            'createOrder',
            () => service.post<OrderResponse>('/orders', sanitizedData, {
                context: 'OrderService.createOrder',
                timeout: 30000, // Extra long timeout for order creation
            })
        );
    }

    /**
     * Update order status or details
     */
    static async updateOrder(
        id: string,
        data: UpdateOrderRequest
    ): Promise<OrderResponse> {
        const service = OrderService.getInstance();

        service.validateRequired({ id }, ['id']);

        const sanitizedData = service.sanitizeData({ ...data, id } as unknown as Record<string, unknown>);
        logger.business(`Updating order: ${id}`, 'OrderService', {
            orderId: id,
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateOrder',
            () => service.put<OrderResponse>(`/orders/${id}`, sanitizedData, {
                context: 'OrderService.updateOrder',
            })
        );
    }

    /**
     * Update order status specifically
     */
    static async updateOrderStatus(
        id: string,
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    ): Promise<OrderResponse> {
        logger.business(`Updating order status: ${id} to ${status}`, 'OrderService', {
            orderId: id,
            newStatus: status
        });

        return OrderService.updateOrder(id, { status });
    }

    /**
     * Cancel order
     */
    static async cancelOrder(id: string): Promise<OrderResponse> {
        logger.business(`Cancelling order: ${id}`, 'OrderService', { orderId: id });

        return OrderService.updateOrderStatus(id, 'cancelled');
    }

    /**
     * Mark order as paid
     */
    static async markOrderAsPaid(id: string, paidAt?: string): Promise<OrderResponse> {
        logger.business(`Marking order as paid: ${id}`, 'OrderService', { orderId: id });

        return OrderService.updateOrder(id, {
            isPaid: true,
            paidAt: paidAt || new Date().toISOString()
        });
    }

    /**
     * Mark order as delivered
     */
    static async markOrderAsDelivered(id: string, deliveredAt?: string): Promise<OrderResponse> {
        logger.business(`Marking order as delivered: ${id}`, 'OrderService', { orderId: id });

        return OrderService.updateOrder(id, {
            status: 'delivered',
            deliveredAt: deliveredAt || new Date().toISOString()
        });
    }

    /**
     * Add tracking number to order
     */
    static async addTrackingNumber(id: string, trackingNumber: string): Promise<OrderResponse> {
        const service = OrderService.getInstance();
        service.validateRequired({ trackingNumber }, ['trackingNumber']);

        logger.business(`Adding tracking number to order: ${id}`, 'OrderService', {
            orderId: id,
            trackingNumber
        });

        return OrderService.updateOrder(id, { trackingNumber });
    }

    /**
     * Get order history for a user
     */
    static async getOrderHistory(
        userId: string,
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<OrderResponse>> {
        const service = OrderService.getInstance();
        service.validateRequired({ userId }, ['userId']);

        logger.business(`Fetching order history for user: ${userId}`, 'OrderService', {
            userId,
            pagination
        });

        return OrderService.getOrders(
            { user: userId },
            { ...pagination, sortBy: 'createdAt', sortOrder: 'desc' }
        );
    }

    /**
     * Track order by order number
     */
    static async trackOrder(orderNumber: string): Promise<OrderTrackingResponse> {
        const service = OrderService.getInstance();
        service.validateRequired({ orderNumber }, ['orderNumber']);

        logger.business(`Tracking order: ${orderNumber}`, 'OrderService', { orderNumber });

        return service.measurePerformance(
            'trackOrder',
            () => service.get<OrderTrackingResponse>(`/orders/track/${orderNumber}`, undefined, {
                context: 'OrderService.trackOrder',
            })
        );
    }

    /**
     * Get recent orders (for dashboard/admin)
     */
    static async getRecentOrders(limit: number = 10): Promise<OrderResponse[]> {
        logger.business('Fetching recent orders', 'OrderService', { limit });

        const response = await OrderService.getOrders(
            {},
            { limit, page: 1, sortBy: 'createdAt', sortOrder: 'desc' }
        );

        return response.data || [];
    }

    /**
     * Get orders by status
     */
    static async getOrdersByStatus(
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<OrderResponse>> {
        logger.business(`Fetching orders by status: ${status}`, 'OrderService', {
            status,
            pagination
        });

        return OrderService.getOrders({ status }, pagination);
    }

    /**
     * Get pending orders (need processing)
     */
    static async getPendingOrders(limit?: number): Promise<OrderResponse[]> {
        logger.business('Fetching pending orders', 'OrderService', { limit });

        const response = await OrderService.getOrdersByStatus(
            'pending',
            { limit, page: 1, sortBy: 'createdAt', sortOrder: 'asc' }
        );

        return response.data || [];
    }

    /**
     * Get orders that need shipping
     */
    static async getOrdersToShip(limit?: number): Promise<OrderResponse[]> {
        logger.business('Fetching orders to ship', 'OrderService', { limit });

        const response = await OrderService.getOrdersByStatus(
            'processing',
            { limit, page: 1, sortBy: 'createdAt', sortOrder: 'asc' }
        );

        return response.data || [];
    }

    /**
     * Search orders by order number or customer info
     */
    static async searchOrders(
        query: string,
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<OrderResponse>> {
        const service = OrderService.getInstance();
        service.validateRequired({ query }, ['query']);

        logger.business('Searching orders', 'OrderService', { query, pagination });

        // For now, we'll use the general search endpoint
        // In a real implementation, you might have a dedicated search endpoint
        return OrderService.getOrders({}, {
            ...pagination,
            // Add search query to params - the API should handle this
        });
    }

    /**
     * Get order statistics
     */
    static async getOrderStats(dateRange?: { from: string; to: string }): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        statusBreakdown: Record<string, number>;
    }> {
        logger.business('Fetching order statistics', 'OrderService', { dateRange });

        try {
            const filters: OrderFilters = {};
            if (dateRange) {
                filters.startDate = dateRange.from;
                filters.endDate = dateRange.to;
            }

            // Get all orders for the period
            const response = await OrderService.getOrders(filters, { limit: 1000 });
            const orders = response.data || [];

            // Calculate statistics
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Status breakdown
            const statusBreakdown: Record<string, number> = {};
            orders.forEach(order => {
                statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
            });

            return {
                totalOrders,
                totalRevenue,
                averageOrderValue,
                statusBreakdown,
            };
        } catch (error) {
            logger.error('Failed to fetch order statistics', 'OrderService', {
                dateRange
            }, error as Error);
            throw error;
        }
    }

    /**
     * Validate order before creation (business logic)
     */
    static async validateOrder(orderData: CreateOrderRequest): Promise<{
        valid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        try {
            // Basic validation
            if (!orderData.items || orderData.items.length === 0) {
                errors.push('Order must contain at least one item');
            }

            if (!orderData.shipping || !orderData.shipping.address) {
                errors.push('Shipping address is required');
            }

            if (!orderData.payment || !orderData.payment.method) {
                errors.push('Payment method is required');
            }

            if (orderData.totalPrice <= 0) {
                errors.push('Order total must be greater than 0');
            }

            // Validate items availability (would need ProductService)
            for (const item of orderData.items) {
                if (item.quantity <= 0) {
                    errors.push(`Invalid quantity for product ${item.product}`);
                }
            }

            logger.business('Order validation completed', 'OrderService', {
                valid: errors.length === 0,
                errorCount: errors.length,
            });

            return {
                valid: errors.length === 0,
                errors,
            };
        } catch (error) {
            logger.error('Order validation failed', 'OrderService', {}, error as Error);
            return {
                valid: false,
                errors: ['Validation failed due to system error'],
            };
        }
    }

    /**
     * Calculate order totals (utility method)
     */
    static calculateOrderTotals(items: CreateOrderRequest['items'], shippingCost: number = 0, taxRate: number = 0.08): {
        itemsPrice: number;
        shippingPrice: number;
        taxPrice: number;
        totalPrice: number;
    } {
        const itemsPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingPrice = shippingCost;
        const taxPrice = parseFloat((itemsPrice * taxRate).toFixed(2));
        const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

        logger.debug('Order totals calculated', 'OrderService', {
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        });

        return {
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        };
    }
} 