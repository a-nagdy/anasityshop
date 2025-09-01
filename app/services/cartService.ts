import { logger } from '../../utils/logger';
import { BaseService } from './baseService';

// Cart interfaces matching the existing Redux structure
export interface CartProduct {
    _id: string;
    name: string;
    image: string;
    price: number;
    discountPrice?: number;
    status: string;
    quantity: number;
    slug?: string;
}

export interface CartItemVariants {
    color?: string | null;
    size?: string | null;
}

export interface CartItem {
    _id?: string;
    cartItemKey: string;
    product: CartProduct;
    quantity: number;
    variants?: CartItemVariants;
    // Legacy fields for backward compatibility
    color?: string;
    size?: string;
    price: number;
    totalPrice: number;
}

export interface CartData {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    lastUpdated: string;
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
}

export interface UpdateCartItemRequest {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
}

export interface RemoveFromCartRequest {
    productId: string;
    color?: string;
    size?: string;
}

export class CartService extends BaseService {
    private static instance: CartService;

    constructor() {
        super();
    }

    static getInstance(): CartService {
        if (!CartService.instance) {
            CartService.instance = new CartService();
        }
        return CartService.instance;
    }

    /**
     * Fetch current cart from server
     */
    static async getCart(): Promise<CartData> {
        const service = CartService.getInstance();

        logger.business('Fetching cart data', 'CartService');

        return service.measurePerformance(
            'getCart',
            () => service.get<CartData>('/api/cart', undefined, {
                context: 'CartService.getCart',
            })
        );
    }

    /**
     * Add item to cart
     */
    static async addToCart(request: AddToCartRequest): Promise<CartData> {
        const service = CartService.getInstance();

        service.validateRequired(request as unknown as Record<string, unknown>, ['productId', 'quantity']);

        if (request.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        logger.business(`Adding product to cart: ${request.productId}`, 'CartService', {
            productId: request.productId,
            quantity: request.quantity,
            color: request.color,
            size: request.size
        });

        const payload = service.sanitizeData(request as unknown as Record<string, unknown>);

        return service.measurePerformance(
            'addToCart',
            () => service.post<CartData>('/api/cart', payload, {
                context: 'CartService.addToCart',
            })
        );
    }

    /**
     * Update cart item quantity and variants
     */
    static async updateCartItem(request: UpdateCartItemRequest): Promise<CartData> {
        const service = CartService.getInstance();

        service.validateRequired(request as unknown as Record<string, unknown>, ['productId', 'quantity']);

        if (request.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        logger.business(`Updating cart item: ${request.productId}`, 'CartService', {
            productId: request.productId,
            quantity: request.quantity,
            color: request.color,
            size: request.size
        });

        const payload = {
            quantity: request.quantity,
            color: request.color || '',
            size: request.size || '',
        };

        return service.measurePerformance(
            'updateCartItem',
            () => service.put<CartData>(`/api/cart/${request.productId}`, payload, {
                context: 'CartService.updateCartItem',
            })
        );
    }

    /**
     * Remove item from cart
     */
    static async removeFromCart(request: RemoveFromCartRequest): Promise<void> {
        const service = CartService.getInstance();

        service.validateRequired(request as unknown as Record<string, unknown>, ['productId']);

        logger.business(`Removing product from cart: ${request.productId}`, 'CartService', {
            productId: request.productId,
            color: request.color,
            size: request.size
        });

        // Build query parameters for variants
        const params: Record<string, string> = {};
        if (request.color) params.color = request.color;
        if (request.size) params.size = request.size;

        return service.measurePerformance(
            'removeFromCart',
            () => service.delete<void>(`/api/cart/${request.productId}`, {
                context: 'CartService.removeFromCart',
            })
        );
    }

    /**
     * Clear entire cart
     */
    static async clearCart(): Promise<void> {
        const service = CartService.getInstance();

        logger.business('Clearing entire cart', 'CartService');

        return service.measurePerformance(
            'clearCart',
            () => service.delete<void>('/api/cart', {
                context: 'CartService.clearCart',
            })
        );
    }

    /**
     * Get cart item count (for quick access)
     */
    static async getCartCount(): Promise<number> {
        const service = CartService.getInstance();

        logger.business('Getting cart item count', 'CartService');

        try {
            const cartData = await service.measurePerformance(
                'getCartCount',
                () => service.get<CartData>('/api/cart', undefined, {
                    context: 'CartService.getCartCount',
                })
            );

            return cartData.totalItems || 0;
        } catch (error) {
            logger.error('Failed to get cart count', 'CartService', {}, error as Error);
            return 0; // Return 0 on error to prevent UI issues
        }
    }

    /**
     * Calculate cart totals (utility function)
     */
    static calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
            const itemPrice = item.product.discountPrice || item.product.price;
            return sum + (itemPrice * item.quantity);
        }, 0);

        return { totalItems, totalPrice };
    }

    /**
     * Validate cart item data
     */
    static validateCartItem(item: Partial<CartItem>): boolean {
        if (!item.product?._id || !item.quantity || item.quantity <= 0) {
            return false;
        }

        if (!item.product.name || !item.product.price) {
            return false;
        }

        return true;
    }

    /**
     * Generate cart item key for tracking
     */
    static generateCartItemKey(productId: string, variants?: CartItemVariants): string {
        const color = variants?.color || '';
        const size = variants?.size || '';
        return `${productId}_${color}_${size}`;
    }
} 