import { Payment } from "./checkout";

import { Shipping } from "./checkout";


export interface Order {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    items: OrderItem[];
    shipping: Shipping;
    payment: Payment;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    status: string;
    isPaid: boolean;
    paidAt: string;
    isDelivered: boolean;
    deliveredAt: string;
    trackingNumber: string;
    notes: string;
    createdAt: string;
}


interface OrderItem {
    product: {
        _id: string;
        name: string;
        image: string;
    };
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    color: string;
    size: string;
    image: string;
}