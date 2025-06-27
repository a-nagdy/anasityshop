import { CheckoutData, OrderData, OrderTotals, SavedAddress } from '../types/checkout';
import { Order } from '../types/orders';

export class CheckoutService {
    /**
     * Calculate order totals based on cart items
     */
    static calculateTotals(itemsPrice: number): OrderTotals {
        const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
        const taxRate = 0.08; // 8% tax
        const taxPrice = parseFloat((itemsPrice * taxRate).toFixed(2));
        const total = itemsPrice + shippingPrice + taxPrice;

        return {
            itemsPrice,
            shippingPrice,
            taxPrice,
            total,
        };
    }

    /**
     * Create a new order
     */
    static async createOrder(orderData: OrderData): Promise<Order> {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to place order');
        }

        return response.json();
    }

    /**
     * Get order details by ID
     */
    static async getOrderById(orderId: string): Promise<Order> {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        return response.json();
    }

    /**
     * Get saved addresses for the user
     */
    static async getSavedAddresses(): Promise<SavedAddress[]> {
        const response = await fetch('/api/addresses');

        if (!response.ok) {
            throw new Error('Failed to fetch addresses');
        }

        return response.json();
    }

    /**
     * Save a new address
     */
    static async saveAddress(addressData: Partial<SavedAddress>): Promise<SavedAddress> {
        const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(addressData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save address');
        }

        return response.json();
    }

    /**
     * Validate checkout data
     */
    static validateCheckoutData(data: CheckoutData): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        // Validate shipping
        if (!data.shipping.fullName?.trim()) {
            errors['shipping.fullName'] = 'Full name is required';
        }
        if (!data.shipping.address?.trim()) {
            errors['shipping.address'] = 'Address is required';
        }
        if (!data.shipping.city?.trim()) {
            errors['shipping.city'] = 'City is required';
        }
        if (!data.shipping.state?.trim()) {
            errors['shipping.state'] = 'State/Province is required';
        }
        if (!data.shipping.postalCode?.trim()) {
            errors['shipping.postalCode'] = 'Postal code is required';
        }
        if (!data.shipping.country?.trim()) {
            errors['shipping.country'] = 'Country is required';
        }
        if (!data.shipping.phone?.trim()) {
            errors['shipping.phone'] = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(data.shipping.phone)) {
            errors['shipping.phone'] = 'Please enter a valid phone number';
        }

        // Postal code basic validation
        if (data.shipping.postalCode && data.shipping.postalCode.length < 3) {
            errors['shipping.postalCode'] = 'Please enter a valid postal code';
        }

        // Validate payment
        if (!data.payment.method) {
            errors['payment.method'] = 'Please select a payment method';
        }

        if (data.payment.method === 'credit_card') {
            if (!data.payment.cardNumber) {
                errors['payment.cardNumber'] = 'Card number is required';
            } else if (!/^\d{13,19}$/.test(data.payment.cardNumber.replace(/\s/g, ''))) {
                errors['payment.cardNumber'] = 'Please enter a valid card number';
            }

            if (!data.payment.expiryDate) {
                errors['payment.expiryDate'] = 'Expiry date is required';
            } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.payment.expiryDate)) {
                errors['payment.expiryDate'] = 'Please enter a valid expiry date (MM/YY)';
            } else {
                // Check if card is not expired
                const [month, year] = data.payment.expiryDate.split('/');
                const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                const now = new Date();
                now.setDate(1); // Set to first day of current month for comparison
                if (expiryDate < now) {
                    errors['payment.expiryDate'] = 'Card has expired';
                }
            }

            if (!data.payment.cvv) {
                errors['payment.cvv'] = 'CVV is required';
            } else if (!/^\d{3,4}$/.test(data.payment.cvv)) {
                errors['payment.cvv'] = 'Please enter a valid CVV';
            }

            if (!data.payment.cardHolderName?.trim()) {
                errors['payment.cardHolderName'] = 'Cardholder name is required';
            } else if (data.payment.cardHolderName.length < 2) {
                errors['payment.cardHolderName'] = 'Please enter a valid cardholder name';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Get card type from card number
     */
    static getCardType(cardNumber: string): string {
        const number = cardNumber.replace(/\s/g, '');
        const firstDigit = number.charAt(0);
        const firstTwoDigits = number.substring(0, 2);
        const firstFourDigits = number.substring(0, 4);

        if (firstDigit === '4') return 'Visa';
        if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) ||
            (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)) {
            return 'Mastercard';
        }
        if (['34', '37'].includes(firstTwoDigits)) return 'American Express';
        if (firstTwoDigits === '60') return 'Discover';
        if (['30', '36', '38'].includes(firstTwoDigits)) return 'Diners Club';

        return 'Unknown';
    }

    /**
     * Format card number for display
     */
    static formatCardNumber(value: string): string {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    }

    /**
     * Format expiry date for display
     */
    static formatExpiryDate(value: string): string {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    }
} 