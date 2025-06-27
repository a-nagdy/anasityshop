export interface Shipping {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  notes?: string;
  deliveryDate?: string;
  method?: string;
}

export interface PaymentDetails {
  cardNumber?: string;
  cardType?: string;
  last4?: string;
  transactionId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: string;
}

export interface Payment {
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  transactionId?: string;
  status?: string;
  details?: PaymentDetails;
}

export interface CheckoutData {
  shipping: Shipping;
  payment: Payment;
}

export interface OrderTotals {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  total: number;
}

export interface OrderData {
  items: OrderItem[];
  shipping: Shipping;
  payment: Payment & { status: string; details: Record<string, unknown> };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  color?: string;
  size?: string;
  image?: string;
}

export interface SavedAddress {
  _id: string;
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}