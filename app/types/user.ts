export type User = {
    _id: string;
    name: string;
    email: string;
    password: string;
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
}
