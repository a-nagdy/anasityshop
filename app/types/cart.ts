export type CartItem = {
    product: string;
    name: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    totalPrice: number;
};

export type Cart = {
    items: CartItem[];
    totalPrice: number;
    totalQuantity: number;
};
