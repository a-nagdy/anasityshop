"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import OrderConfirmation from "../../components/checkout/OrderConfirmation";
import PaymentStep from "../../components/checkout/PaymentStep";
import ShippingStep from "../../components/checkout/ShippingStep";
import { LoadingSpinner } from "../../components/ui";
import { useCheckout } from "../../hooks/useCheckout";
import { useAppSelector } from "../../store/hooks";

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Redux cart state (for totalItems display)
  const { totalItems } = useAppSelector((state) => state.cart);

  // Custom checkout hook
  const {
    // State
    checkoutData,
    isProcessing,
    orderId,
    orderData,
    totals,

    // Actions
    updateShippingData,
    updatePaymentData,
    placeOrder,

    // Cart data
    items,
  } = useCheckout();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderId) {
      toast.error("Your cart is empty");
      router.push("/");
    }
  }, [items.length, orderId, router]);

  // Show loading if we're still checking cart state
  if (!orderId && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleShippingComplete = async (
    shippingData: typeof checkoutData.shipping
  ) => {
    try {
      await updateShippingData(shippingData);
      setCurrentStep(2);
      toast.success("Shipping information saved!");
    } catch (error) {
      console.error("Error updating shipping:", error);
      toast.error("Failed to save shipping information");
    }
  };

  const handlePaymentComplete = async (
    paymentData: typeof checkoutData.payment
  ) => {
    try {
      await updatePaymentData(paymentData);

      // Place order immediately after payment data is updated
      const success = await placeOrder(paymentData);
      if (success) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    }
  };

  const handleBackToShipping = () => {
    setCurrentStep(1);
  };

  const handleBackToCart = () => {
    router.push("/cart");
  };

  // Show order confirmation if order was placed successfully
  if (orderId && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <OrderConfirmation
            orderId={orderId}
            checkoutData={checkoutData}
            totals={totals}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your purchase in just a few steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <CheckoutSteps currentStep={currentStep} />

        {/* Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <ShippingStep
              initialData={checkoutData.shipping}
              onComplete={handleShippingComplete}
              onBack={handleBackToCart}
            />
          )}

          {currentStep === 2 && (
            <PaymentStep
              initialData={checkoutData.payment}
              shippingData={checkoutData.shipping}
              totals={totals}
              onComplete={handlePaymentComplete}
              onBack={handleBackToShipping}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep < 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 lg:mt-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemKey}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12">
                      <Image
                        src={item.product.image || "/images/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                        width={12}
                        height={12}
                      />
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        $
                        {(
                          item.product.discountPrice || item.product.price
                        ).toFixed(2)}{" "}
                        each
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${totals.itemsPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {totals.shippingPrice === 0
                        ? "Free"
                        : `$${totals.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${totals.taxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>🔒</span>
                  <span>Your information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
