"use client";

import { Shipping } from "@/app/types/checkout";
import { CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CartSummary from "../../components/checkout/CartSummary";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import OrderConfirmation from "../../components/checkout/OrderConfirmation";
import PaymentStep from "../../components/checkout/PaymentStep";
import ShippingStep from "../../components/checkout/ShippingStep";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart, fetchCart } from "../../store/slices/cartSlice";

export interface CheckoutData {
  shipping: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    notes?: string;
  };
  payment: {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalPrice, totalItems, loading } = useAppSelector(
    (state) => state.cart
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shipping: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      notes: "",
    },
    payment: {
      method: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
    },
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    payment: {
      method: string;
      status: string;
      details: Record<string, unknown>;
    };
  } | null>(null);
  const [shouldPlaceOrder, setShouldPlaceOrder] = useState(false);

  // Fetch cart data on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle placing order after payment data is updated
  useEffect(() => {
    if (shouldPlaceOrder && checkoutData.payment.method) {
      setShouldPlaceOrder(false);
      handlePlaceOrder();
    }
  }, [checkoutData.payment.method, shouldPlaceOrder]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0 && currentStep < 4) {
      toast.error("Your cart is empty. Please add items before checkout.");
      router.push("/");
    }
  }, [items.length, loading, currentStep, router]);

  const steps = [
    { number: 1, title: "Cart Review", description: "Review your items" },
    { number: 2, title: "Shipping", description: "Delivery information" },
    { number: 3, title: "Payment", description: "Payment details" },
    { number: 4, title: "Confirmation", description: "Order placed" },
  ];

  const calculateTotals = () => {
    const itemsPrice = totalPrice;
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
  };

  const handleStepComplete = (stepData: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({
      ...prev,
      ...stepData,
    }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePlaceOrder = async () => {
    console.log(
      "handlePlaceOrder called with payment method:",
      checkoutData.payment.method
    );
    setIsProcessing(true);

    try {
      const totals = calculateTotals();

      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          color: item.color || item.variants?.color || "",
          size: item.size || item.variants?.size || "",
          image: item.product.image,
        })),
        shipping: checkoutData.shipping,
        payment: {
          method: checkoutData.payment.method,
          status: "pending",
          details: {
            cardType: getCardType(checkoutData.payment.cardNumber || ""),
            last4: checkoutData.payment.cardNumber?.slice(-4) || "",
          },
        },
        itemsPrice: totals.itemsPrice,
        shippingPrice: totals.shippingPrice,
        taxPrice: totals.taxPrice,
        totalPrice: totals.total,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to place order");
      }

      const order = await response.json();
      setOrderId(order._id);
      setOrderData({
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        taxPrice: order.taxPrice,
        totalPrice: order.totalPrice,
        payment: order.payment,
      });

      // Clear cart after successful order
      dispatch(clearCart());

      // Move to confirmation step
      setCurrentStep(4);

      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === "4") return "Visa";
    if (firstDigit === "5") return "Mastercard";
    if (firstDigit === "3") return "American Express";
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Checkout
            </h1>
          </div>
          <CheckoutSteps steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="cart-review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CartSummary
                    items={items}
                    onContinue={() => setCurrentStep(2)}
                    onBack={() => router.push("/")}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShippingStep
                    initialData={checkoutData.shipping}
                    onComplete={(shippingData: Shipping) =>
                      handleStepComplete({ shipping: shippingData })
                    }
                    onBack={handlePreviousStep}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentStep
                    initialData={checkoutData.payment}
                    shippingData={checkoutData.shipping}
                    totals={calculateTotals()}
                    onComplete={(paymentData) => {
                      console.log("Payment data received:", paymentData);
                      setCheckoutData((prev) => ({
                        ...prev,
                        payment: paymentData,
                      }));
                      setShouldPlaceOrder(true);
                    }}
                    onBack={handlePreviousStep}
                    isProcessing={isProcessing}
                  />
                </motion.div>
              )}

              {currentStep === 4 && orderId && orderData && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <OrderConfirmation
                    orderId={orderId}
                    checkoutData={{
                      ...checkoutData,
                      payment: {
                        ...checkoutData.payment,
                        method: orderData.payment.method,
                      },
                    }}
                    totals={{
                      itemsPrice: orderData.itemsPrice,
                      shippingPrice: orderData.shippingPrice,
                      taxPrice: orderData.taxPrice,
                      total: orderData.totalPrice,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Order Summary */}
          {currentStep < 4 && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.cartItemKey} className="flex gap-3">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        $
                        {(
                          item.totalPrice || item.price * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${calculateTotals().itemsPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {calculateTotals().shippingPrice === 0
                        ? "Free"
                        : `$${calculateTotals().shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${calculateTotals().taxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ${calculateTotals().total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {calculateTotals().shippingPrice === 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-400">
                        You qualify for free shipping!
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
