"use client";

import {
  ArrowLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { CheckoutService } from "../../services/checkoutService";
import { CheckoutData, OrderTotals } from "../../types/checkout";
import ThemeButton from "../ui/ThemeButton";

interface PaymentStepProps {
  initialData: CheckoutData["payment"];
  shippingData: CheckoutData["shipping"];
  totals: OrderTotals;
  onComplete: (paymentData: CheckoutData["payment"]) => void;
  onBack: () => void;
  isProcessing: boolean;
}

interface LoadingStates {
  validating: boolean;
  submitting: boolean;
}

export default function PaymentStep({
  initialData,
  shippingData,
  totals,
  onComplete,
  onBack,
  isProcessing,
}: PaymentStepProps) {
  const [formData, setFormData] =
    useState<CheckoutData["payment"]>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    validating: false,
    submitting: false,
  });

  const paymentMethods = useMemo(
    () => [
      {
        id: "credit_card",
        name: "Credit Card",
        description: "Pay with Visa, Mastercard, or American Express",
        icon: "💳",
        popular: true,
      },
      {
        id: "paypal",
        name: "PayPal",
        description: "Pay safely with your PayPal account",
        icon: "🅿️",
        popular: false,
      },
      {
        id: "cash_on_delivery",
        name: "Cash on Delivery",
        description: "Pay when your order arrives",
        icon: "💵",
        popular: false,
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        description: "Transfer money directly from your bank",
        icon: "🏦",
        popular: false,
      },
    ],
    []
  );

  const validateForm = useCallback((): boolean => {
    setLoadingStates((prev) => ({ ...prev, validating: true }));

    const mockCheckoutData: CheckoutData = {
      shipping: shippingData,
      payment: formData,
    };

    const validation = CheckoutService.validateCheckoutData(mockCheckoutData);

    // Extract only payment-related errors
    const paymentErrors: Record<string, string> = {};
    Object.entries(validation.errors).forEach(([key, value]) => {
      if (key.startsWith("payment.")) {
        paymentErrors[key.replace("payment.", "")] = value;
      }
    });

    setErrors(paymentErrors);
    setLoadingStates((prev) => ({ ...prev, validating: false }));

    return Object.keys(paymentErrors).length === 0;
  }, [formData, shippingData]);

  const handleInputChange = useCallback(
    (field: keyof CheckoutData["payment"], value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      // Special handling for formatted fields
      if (field === "cardNumber") {
        const formatted = CheckoutService.formatCardNumber(value);
        if (formatted !== value) {
          setFormData((prev) => ({ ...prev, [field]: formatted }));
        }
      } else if (field === "expiryDate") {
        const formatted = CheckoutService.formatExpiryDate(value);
        if (formatted !== value) {
          setFormData((prev) => ({ ...prev, [field]: formatted }));
        }
      }
    },
    [errors]
  );

  const cardType = useMemo(
    () => CheckoutService.getCardType(formData.cardNumber || "").toLowerCase(),
    [formData.cardNumber]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing || loadingStates.submitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, submitting: true }));

    try {
      // Simulate payment processing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      onComplete(formData);
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrors({ general: "Payment processing failed. Please try again." });
    } finally {
      setLoadingStates((prev) => ({ ...prev, submitting: false }));
    }
  };

  const isFormValid = useMemo(() => {
    if (!formData.method) return false;
    if (formData.method === "credit_card") {
      return (
        formData.cardNumber &&
        formData.expiryDate &&
        formData.cvv &&
        formData.cardHolderName
      );
    }
    return true;
  }, [formData]);

  const isSubmitting = loadingStates.submitting || isProcessing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <CreditCardIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Information
        </h2>
      </div>

      {/* Security Badges */}
      <div className="flex items-center gap-4 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
        <div className="text-sm">
          <p className="font-medium text-green-800 dark:text-green-400">
            Your payment is secured with 256-bit SSL encryption
          </p>
          <p className="text-green-600 dark:text-green-500">
            We never store your credit card information
          </p>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-400">
            {errors.general}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-3">
            Select Payment Method *
          </label>
          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.method === method.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => handleInputChange("method", method.id)}
              >
                {method.popular && (
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.method === method.id}
                    onChange={(e) =>
                      handleInputChange("method", e.target.value)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {errors.method && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.method}
            </p>
          )}
        </div>

        {/* Credit Card Details */}
        {formData.method === "credit_card" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Credit Card Information
            </h3>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
                Card Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cardNumber || ""}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cardNumber
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={isSubmitting}
                />
                {cardType && (
                  <div className="absolute right-3 top-2">
                    <div className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {CheckoutService.getCardType(formData.cardNumber || "")}
                    </div>
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={formData.cardHolderName || ""}
                onChange={(e) =>
                  handleInputChange("cardHolderName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cardHolderName
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.cardHolderName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cardHolderName}
                </p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={formData.expiryDate || ""}
                  onChange={(e) =>
                    handleInputChange("expiryDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.expiryDate
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="MM/YY"
                  maxLength={5}
                  disabled={isSubmitting}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  value={formData.cvv || ""}
                  onChange={(e) =>
                    handleInputChange("cvv", e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cvv
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="123"
                  maxLength={4}
                  disabled={isSubmitting}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">
                ${totals.itemsPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-900 dark:text-white">
                {totals.shippingPrice === 0
                  ? "Free"
                  : `$${totals.shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-white">
                ${totals.taxPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">
                ${totals.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ThemeButton
            type="button"
            variant="secondary"
            onClick={onBack}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Shipping
          </ThemeButton>

          <ThemeButton
            type="submit"
            variant="primary"
            className="flex items-center justify-center gap-2 flex-1"
            disabled={!isFormValid || isSubmitting || loadingStates.validating}
            glow
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-4 h-4" />
                Complete Order - ${totals.total.toFixed(2)}
              </>
            )}
          </ThemeButton>
        </div>

        {/* Trust Indicators */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Secured by industry-standard encryption
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 SSL Secured</span>
            <span>💳 PCI Compliant</span>
            <span>🛡️ Data Protected</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
