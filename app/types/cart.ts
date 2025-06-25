import mongoose from "mongoose";

// Product interface for populated cart items
export interface PopulatedProduct {
    _id: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    active: boolean;
    status: string;
    slug: string;
}

// Cart item interface matching the Mongoose schema
export interface CartItem {
    product: mongoose.Types.ObjectId | PopulatedProduct;
    quantity: number;
    price: number;
    totalPrice: number;
    color?: string;
    size?: string;
    // Mongoose document methods
    toObject?(): Record<string, unknown>;
}

// Full cart interface
export interface Cart {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    // Mongoose document methods
    save(): Promise<this>;
    toObject(): Record<string, unknown>;
}

// Cart item with enhanced data for responses
export interface EnhancedCartItem extends CartItem {
    currentPrice: number;
    inStock: boolean;
    availableQuantity: number;
}

// Cart response interface
export interface CartResponse extends Omit<Cart, 'items'> {
    items: EnhancedCartItem[];
    summary: {
        subtotal: number;
        totalItems: number;
    };
}
