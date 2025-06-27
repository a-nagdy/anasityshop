"use client";

import {
  CheckCircleIcon,
  PrinterIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckoutService } from "../../services/checkoutService";
import { CheckoutData, OrderTotals } from "../../types/checkout";
import ThemeButton from "../ui/ThemeButton";

interface OrderConfirmationProps {
  orderId: string;
  checkoutData: CheckoutData;
  totals: OrderTotals;
}

interface LoadingStates {
  fetchingOrder: boolean;
  sharing: boolean;
}

export default function OrderConfirmation({
  orderId,
  checkoutData,
  totals,
}: OrderConfirmationProps) {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingOrder: false,
    sharing: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch order details to get order number - FIXED: using useEffect instead of useState
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      setLoadingStates((prev) => ({ ...prev, fetchingOrder: true }));
      setError(null);

      try {
        const order = await CheckoutService.getOrderById(orderId);
        setOrderNumber(order.orderNumber || "");
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Failed to load order details");
        toast.error("Could not load order information");
      } finally {
        setLoadingStates((prev) => ({ ...prev, fetchingOrder: false }));
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print order");
    }
  };

  const handleShare = async () => {
    setLoadingStates((prev) => ({ ...prev, sharing: true }));

    try {
      const shareData = {
        title: "Order Confirmation",
        text: `Order ${orderNumber} confirmed! Total: $${totals.total.toFixed(
          2
        )}`,
        url: window.location.href,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        toast.success("Order details shared successfully!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Order ${orderNumber} confirmed! Total: $${totals.total.toFixed(
            2
          )}\n${window.location.href}`
        );
        toast.success("Order details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled sharing, no need to show error
        return;
      }
      toast.error("Failed to share order details");
    } finally {
      setLoadingStates((prev) => ({ ...prev, sharing: false }));
    }
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    const daysToAdd = totals.shippingPrice === 0 ? 3 : 7;
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading state while fetching order details
  if (loadingStates.fetchingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if order fetch failed
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <span className="text-red-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <ThemeButton variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </ThemeButton>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Thank you for your purchase. We&apos;ll send you a confirmation email
          shortly.
        </p>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Order Details
            </h2>
            {orderNumber && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Order #{orderNumber}
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <ThemeButton
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
              disabled={loadingStates.sharing}
            >
              <PrinterIcon className="w-4 h-4" />
              Print
            </ThemeButton>
            <ThemeButton
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
              disabled={loadingStates.sharing}
            >
              {loadingStates.sharing ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ShareIcon className="w-4 h-4" />
              )}
              {loadingStates.sharing ? "Sharing..." : "Share"}
            </ThemeButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${totals.itemsPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
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
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">
                {checkoutData.shipping.fullName}
              </p>
              <p>{checkoutData.shipping.address}</p>
              <p>
                {checkoutData.shipping.city}, {checkoutData.shipping.state}{" "}
                {checkoutData.shipping.postalCode}
              </p>
              <p>{checkoutData.shipping.country}</p>
              <p className="mt-2">📞 {checkoutData.shipping.phone}</p>
              {checkoutData.shipping.notes && (
                <p className="mt-2 italic">
                  Note: {checkoutData.shipping.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Payment Method
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {checkoutData.payment.method === "credit_card" && "💳"}
              {checkoutData.payment.method === "paypal" && "🅿️"}
              {checkoutData.payment.method === "cash_on_delivery" && "💵"}
              {checkoutData.payment.method === "bank_transfer" && "🏦"}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {checkoutData.payment.method === "credit_card" && "Credit Card"}
                {checkoutData.payment.method === "paypal" && "PayPal"}
                {checkoutData.payment.method === "cash_on_delivery" &&
                  "Cash on Delivery"}
                {checkoutData.payment.method === "bank_transfer" &&
                  "Bank Transfer"}
              </p>
              {checkoutData.payment.method === "credit_card" &&
                checkoutData.payment.cardNumber && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    **** **** **** {checkoutData.payment.cardNumber.slice(-4)}
                  </p>
                )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delivery Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-xl">🚚</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Estimated Delivery
            </h3>
            <p className="text-blue-800 dark:text-blue-400 mb-2">
              {getEstimatedDelivery()}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {totals.shippingPrice === 0
                ? "Free shipping - Your order will be delivered within 3-5 business days"
                : "Standard shipping - Your order will be delivered within 5-7 business days"}
            </p>
            {checkoutData.payment.method === "cash_on_delivery" && (
              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  💰 <strong>Cash on Delivery:</strong> Please have exact change
                  ready (${totals.total.toFixed(2)}) when your order arrives.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          What&apos;s Next?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Order Confirmation Email
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We&apos;ll send you a detailed confirmation email within the
                next few minutes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Processing & Shipping
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your order will be processed and shipped within 1-2 business
                days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-purple-600 text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Tracking Information
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Once shipped, you&apos;ll receive tracking details to monitor
                your delivery.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/orders">
          <ThemeButton
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Track Your Orders
          </ThemeButton>
        </Link>
        <Link href="/">
          <ThemeButton
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            glow
          >
            Continue Shopping
          </ThemeButton>
        </Link>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"
      >
        <p>
          Need help with your order?{" "}
          <Link
            href="/contact"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contact our support team
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
