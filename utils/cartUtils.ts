/**
 * Cart utility functions for handling cart item keys and operations
 */

export interface CartItemVariants {
    color?: string | null;
    size?: string | null;
}

/**
 * Generates a unique key for a cart item based on product ID and variants
 * @param productId - The product ID
 * @param variants - Object containing color and size variants
 * @returns Unique cart item key
 */
export const generateCartItemKey = (
    productId: string,
    variants?: CartItemVariants
): string => {
    const variantParts: string[] = [];

    // Only add variants if they have meaningful values
    if (variants?.color && variants.color.trim()) {
        variantParts.push(`color:${variants.color.trim()}`);
    }

    if (variants?.size && variants.size.trim()) {
        variantParts.push(`size:${variants.size.trim()}`);
    }

    return variantParts.length > 0
        ? `${productId}|${variantParts.join('|')}`
        : productId;
};

/**
 * Parses a cart item key to extract product ID and variants
 * @param cartItemKey - The cart item key to parse
 * @returns Object containing productId and variants
 */
export const parseCartItemKey = (cartItemKey: string): {
    productId: string;
    variants: CartItemVariants;
} => {
    const parts = cartItemKey.split('|');
    const productId = parts[0];
    const variants: CartItemVariants = {};

    // Parse variant parts
    for (let i = 1; i < parts.length; i++) {
        const [key, value] = parts[i].split(':');
        if (key === 'color') variants.color = value;
        if (key === 'size') variants.size = value;
    }

    return { productId, variants };
};

/**
 * Normalizes variants by converting empty strings to null
 * @param variants - Raw variants object
 * @returns Normalized variants
 */
export const normalizeVariants = (variants?: {
    color?: string;
    size?: string;
}): CartItemVariants => {
    return {
        color: variants?.color?.trim() || null,
        size: variants?.size?.trim() || null,
    };
};

/**
 * Creates a cart item object with proper key generation
 * @param productId - Product ID
 * @param quantity - Quantity
 * @param price - Item price
 * @param variants - Variants (color, size)
 * @returns Cart item object
 */
export const createCartItem = (
    productId: string,
    quantity: number,
    price: number,
    variants?: CartItemVariants
) => {
    const normalizedVariants = normalizeVariants(variants as { color?: string; size?: string; } | undefined);
    const cartItemKey = generateCartItemKey(productId, normalizedVariants);

    return {
        cartItemKey,
        product: productId,
        quantity,
        variants: normalizedVariants,
        // Legacy fields for backward compatibility
        color: normalizedVariants.color || '',
        size: normalizedVariants.size || '',
        price,
        totalPrice: price * quantity,
    };
}; 