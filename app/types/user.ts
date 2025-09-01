import { Shipping } from "./checkout";

export type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: Shipping;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isAddressVerified: boolean;
    isPaymentVerified: boolean;
    isOrderVerified: boolean;
    isProductVerified: boolean;
    isCustomer: boolean;
    isAdmin: boolean;
    permissions: string[];
}
