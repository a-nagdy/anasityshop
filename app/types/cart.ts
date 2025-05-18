import mongoose from "mongoose";

export type CartItem = {
    product: {
        _id: mongoose.Types.ObjectId;
        name: string;
        image: string;
    };
    name: string;
    quantity: number;
    price: number;
    total: number;
    color: string;
    size: string;
    image: string;
};


export type Cart = {
    items: CartItem[];
    totalPrice: number;
    totalQuantity: number;
};
