"use client";

import {
  ArrowLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { CheckoutData } from "../../(shop)/checkout/page";
import ThemeButton from "../ui/ThemeButton";

interface PaymentStepProps {
  initialData: CheckoutData["payment"];
  shippingData: CheckoutData["shipping"];
  totals: {
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    total: number;
  };
  onComplete: (paymentData: CheckoutData["payment"]) => void;
  onBack: () => void;
  isProcessing: boolean;
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

  const paymentMethods = [
    {
      id: "credit_card",
      name: "Credit Card",
      description: "Pay with Visa, Mastercard, or American Express",
      icon: "💳",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay safely with your PayPal account",
      icon: "🅿️",
    },
    {
      id: "cash_on_delivery",
      name: "Cash on Delivery",
      description: "Pay when your order arrives",
      icon: "💵",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Transfer money directly from your bank",
      icon: "🏦",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.method) {
      newErrors.method = "Please select a payment method";
    }

    if (formData.method === "credit_card") {
      if (!formData.cardNumber) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid card number";
      }

      if (!formData.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }

      if (!formData.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }

      if (!formData.cardHolderName) {
        newErrors.cardHolderName = "Cardholder name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof CheckoutData["payment"],
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onComplete(formData);
  };

  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === "4") return "visa";
    if (firstDigit === "5") return "mastercard";
    if (firstDigit === "3") return "amex";
    return "";
  };

  const cardType = getCardType(formData.cardNumber || "");

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Payment Method *
          </label>
          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.method === method.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => handleInputChange("method", method.id)}
              >
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
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
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
            className="space-y-4"
          >
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Card Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cardNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cardNumber
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {cardType && (
                  <div className="absolute right-3 top-2">
                    <Image
                      src={`/images/cards/${cardType}.png`}
                      alt={cardType}
                      width={24}
                      height={16}
                      className="h-6 w-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={formData.expiryDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "expiryDate",
                      formatExpiryDate(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.expiryDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Name as it appears on card"
              />
              {errors.cardHolderName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cardHolderName}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h3>

          {/* Shipping Address */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Shipping Address
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shippingData.fullName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shippingData.address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shippingData.city}, {shippingData.state}{" "}
              {shippingData.postalCode}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shippingData.country}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {shippingData.phone}
            </p>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">
                ${totals.itemsPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-900 dark:text-white">
                {totals.shippingPrice === 0
                  ? "Free"
                  : `$${totals.shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
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

        {/* Security Notice */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-400">
              Your payment information is encrypted and secure
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <ThemeButton
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Shipping
          </ThemeButton>

          <ThemeButton
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isProcessing}
            glow
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Order...
              </>
            ) : (
              <>🔒 Place Order - ${totals.total.toFixed(2)}</>
            )}
          </ThemeButton>
        </div>
      </form>
    </motion.div>
  );
}
