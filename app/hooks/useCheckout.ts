'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CheckoutService } from '../services/checkoutService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { CartItem, clearCart } from '../store/slices/cartSlice';
import { CheckoutData, OrderData, OrderTotals } from '../types/checkout';

export interface UseCheckoutReturn {
    // State
    currentStep: number;
    checkoutData: CheckoutData;
    isProcessing: boolean;
    orderId: string | null;
    orderData: OrderData | null;
    totals: OrderTotals;

    // Actions
    setCurrentStep: (step: number) => void;
    updateCheckoutData: (data: Partial<CheckoutData>) => void;
    handleStepComplete: (stepData: Partial<CheckoutData>) => void;
    handlePreviousStep: () => void;
    handlePlaceOrder: (paymentData?: CheckoutData['payment']) => Promise<void>;
    updateShippingData: (data: CheckoutData['shipping']) => Promise<void>;
    updatePaymentData: (data: CheckoutData['payment']) => Promise<void>;
    placeOrder: (paymentData?: CheckoutData['payment']) => Promise<boolean>;

    // Cart data
    items: CartItem[];
    totalPrice: number;
    totalItems: number;
    loading: boolean;
}

export const useCheckout = (): UseCheckoutReturn => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items, totalPrice, totalItems, loading } = useAppSelector(
        (state) => state.cart
    );

    const [currentStep, setCurrentStep] = useState(1);
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        shipping: {
            fullName: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            phone: '',
            notes: '',
        },
        payment: {
            method: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolderName: '',
        },
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [shouldPlaceOrder, setShouldPlaceOrder] = useState(false);

    // Calculate totals
    const totals = CheckoutService.calculateTotals(totalPrice);

    // moved effect below handlePlaceOrder to avoid 'used before declaration'

    // Redirect if cart is empty
    useEffect(() => {
        if (!loading && items.length === 0 && currentStep < 4) {
            toast.error('Your cart is empty. Please add items before checkout.');
            router.push('/');
        }
    }, [items.length, loading, currentStep, router]);

    const updateCheckoutData = (data: Partial<CheckoutData>) => {
        setCheckoutData((prev) => ({
            ...prev,
            ...data,
        }));
    };

    const handleStepComplete = (stepData: Partial<CheckoutData>) => {
        updateCheckoutData(stepData);
        setCurrentStep((prev) => prev + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handlePlaceOrder = useCallback(async (paymentData?: CheckoutData['payment']) => {
        console.log('handlePlaceOrder called with payment method:', paymentData?.method || checkoutData.payment.method);
        setIsProcessing(true);

        try {
            // Use the passed payment data or the current state
            const currentPaymentData = paymentData || checkoutData.payment;

            const orderData: OrderData = {
                items: items.map((item) => ({
                    product: item.product._id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    color: item.color || item.variants?.color || '',
                    size: item.size || item.variants?.size || '',
                    image: item.product.image,
                })),
                shipping: checkoutData.shipping,
                payment: {
                    ...currentPaymentData,
                    status: 'pending',
                    details: {
                        cardType: CheckoutService.getCardType(currentPaymentData.cardNumber || ''),
                        last4: currentPaymentData.cardNumber?.slice(-4) || '',
                    },
                },
                itemsPrice: totals.itemsPrice,
                shippingPrice: totals.shippingPrice,
                taxPrice: totals.taxPrice,
                totalPrice: totals.total,
            };

            const order = await CheckoutService.createOrder(orderData);

            setOrderId(order._id);
            setOrderData({
                items: order.items.map((item) => ({
                    product: item.product._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    color: item.color || '',
                    size: item.size || '',
                    image: item.product.image,
                })),
                shipping: order.shipping,
                payment: {
                    ...order.payment,
                    status: order.payment.status || 'pending',
                    details: {
                        cardType: CheckoutService.getCardType(order.payment.cardNumber || ''),
                        last4: order.payment.cardNumber?.slice(-4) || '',
                    },
                },
                itemsPrice: order.itemsPrice,
                shippingPrice: order.shippingPrice,
                taxPrice: order.taxPrice,
                totalPrice: order.totalPrice,
            });

            // Clear cart after successful order
            dispatch(clearCart());

            // Move to confirmation step
            setCurrentStep(4);

            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to place order'
            );
        } finally {
            setIsProcessing(false);
        }
    }, [checkoutData.payment, checkoutData.shipping, dispatch, items, totals.itemsPrice, totals.shippingPrice, totals.taxPrice, totals.total]);

    // Handle placing order after payment data is updated
    useEffect(() => {
        if (shouldPlaceOrder && checkoutData.payment.method) {
            setShouldPlaceOrder(false);
            handlePlaceOrder(checkoutData.payment);
        }
    }, [checkoutData.payment, shouldPlaceOrder, handlePlaceOrder]);

    const handlePaymentComplete = async (paymentData?: CheckoutData['payment']) => {
        if (paymentData) {
            console.log('Payment data received:', paymentData);
            setCheckoutData((prev) => ({
                ...prev,
                payment: paymentData,
            }));
            setShouldPlaceOrder(true);
        } else {
            await handlePlaceOrder();
        }
    };

    const updateShippingData = useCallback(async (data: CheckoutData['shipping']) => {
        setCheckoutData(prev => ({ ...prev, shipping: data }));
    }, []);

    const updatePaymentData = useCallback(async (data: CheckoutData['payment']) => {
        setCheckoutData(prev => ({ ...prev, payment: data }));
    }, []);

    const placeOrder = useCallback(async (paymentData?: CheckoutData['payment']): Promise<boolean> => {
        if (paymentData) {
            setCheckoutData(prev => ({ ...prev, payment: paymentData }));
        }

        // Use the effect to trigger order placement
        setShouldPlaceOrder(true);

        // Return a promise that resolves when order is placed
        return new Promise((resolve) => {
            const checkOrderStatus = () => {
                if (orderId) {
                    resolve(true);
                } else if (!isProcessing) {
                    resolve(false);
                } else {
                    setTimeout(checkOrderStatus, 100);
                }
            };
            checkOrderStatus();
        });
    }, [orderId, isProcessing]);

    return {
        // State
        currentStep,
        checkoutData,
        isProcessing,
        orderId,
        orderData,
        totals,

        // Actions
        setCurrentStep,
        updateCheckoutData,
        handleStepComplete,
        handlePreviousStep,
        handlePlaceOrder: handlePaymentComplete,
        updateShippingData,
        updatePaymentData,
        placeOrder,

        // Cart data
        items,
        totalPrice,
        totalItems,
        loading,
    };
}; 