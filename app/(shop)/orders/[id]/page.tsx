"use client";

// import { useTheme } from "@/app/components/ThemeProvider"; // Disabled - using static theme
import { OrderService } from "@/app/services/orderService";
import { OrderResponse } from "@/app/types/api";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await OrderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again later.");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <FiClock className="w-5 h-5" />;
      case "processing":
        return <FiPackage className="w-5 h-5" />;
      case "shipped":
        return <FiTruck className="w-5 h-5" />;
      case "delivered":
        return <FiShoppingBag className="w-5 h-5" />;
      case "cancelled":
        return <FiClock className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
          <p className="mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all"
            >
              Try Again
            </button>
            <Link href="/profile">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                Back to Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="mb-4">
            The order you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Link href="/profile">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
              Back to Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-primary rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Order Status</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>Ordered on {formatDate(order.createdAt)}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-1">
                    <FiTruck className="w-4 h-4" />
                    <span>Tracking: {order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                Shipping Information
              </h2>
              <div className="space-y-2">
                <p className="font-medium">{order.shipping.fullName}</p>
                <p>{order.shipping.address}</p>
                <p>
                  {order.shipping.city}, {order.shipping.state}{" "}
                  {order.shipping.postalCode}
                </p>
                <p>{order.shipping.country}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone: {order.shipping.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items ({order.items.length})</span>
                  <span>${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {order.shippingPrice === 0
                      ? "Free"
                      : `$${order.shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="capitalize">
                    {order.payment.method.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.payment.status
                    )}`}
                  >
                    {order.payment.status.charAt(0).toUpperCase() +
                      order.payment.status.slice(1)}
                  </span>
                </div>
                {order.payment.details &&
                  Object.keys(order.payment.details).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium mb-2">Payment Details</h3>
                      {Object.entries(order.payment.details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                boxShadow: "var(--theme-glow)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <Link href="/products">
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
                    Continue Shopping
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-primary rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    View All Orders
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
