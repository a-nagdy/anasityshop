"use client";

import { Order } from "@/app/types/orders";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { FaBoxOpen, FaReceipt, FaTruck, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { id } = use(params);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      await fetchOrder();
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async (isPaid: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPaid }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      await fetchOrder();
      toast.success("Payment status updated successfully");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryUpdate = async (isDelivered: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDelivered }),
      });

      if (!response.ok) {
        throw new Error("Failed to update delivery status");
      }

      await fetchOrder();
      toast.success("Delivery status updated successfully");
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Order not found
        </h2>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaReceipt className="text-blue-500" />
            Order <span className="text-blue-600">#{order.orderNumber}</span>
          </h1>
          <div className="mt-2 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Payment: {order.isPaid ? "Paid" : "Unpaid"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.isDelivered
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              Delivery: {order.isDelivered ? "Delivered" : "Pending"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              Order Status: {order.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow"
        >
          Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Main Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Order Status & Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <FaBoxOpen className="text-blue-400" /> Order Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-3"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Status
                  </label>
                  <button
                    onClick={() => handlePaymentUpdate(!order.isPaid)}
                    disabled={updating}
                    className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      order.isPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery Status
                  </label>
                  <button
                    onClick={() => handleDeliveryUpdate(!order.isDelivered)}
                    disabled={updating}
                    className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      order.isDelivered
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.isDelivered ? "Delivered" : "Pending"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <FaBoxOpen className="text-blue-400" /> Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">{item.product.name}</td>
                      <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <FaUser className="text-blue-400" /> Customer
            </h2>
            <div className="space-y-2">
              <div className="font-medium">
                {order.user.firstName} {order.user.lastName}
              </div>
              <div className="text-sm text-gray-500">{order.user.email}</div>
              <div className="text-sm text-gray-500">
                {order.shipping?.phone || "N/A"}
              </div>
            </div>
          </div>
          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <FaTruck className="text-blue-400" /> Shipping
            </h2>
            <div className="space-y-2 text-sm">
              <div>{order.shipping?.address}</div>
              <div>
                {order.shipping?.city}, {order.shipping?.state}{" "}
                {order.shipping?.postalCode}
              </div>
              <div>{order.shipping?.country}</div>
              <div className="mt-2 font-medium">
                {order.shipping?.method || "Standard Shipping"}
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <FaReceipt className="text-blue-400" /> Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {order.notes}
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
    );
}
