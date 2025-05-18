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
  transactionId: string;
  status: string;
  details: PaymentDetails;
}