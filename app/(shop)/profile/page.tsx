"use client";

import { useTheme } from "@/app/components/ThemeProvider";
import { OrderService } from "@/app/services/orderService";
import { UserService } from "@/app/services/userService";
import { OrderResponse, UserResponse } from "@/app/types/api";
import { User } from "@/app/types/user";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiClock,
  FiEdit,
  FiEye,
  FiHeart,
  FiLogOut,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function Profile() {
  const themeSettings = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  console.log("themeSettings", themeSettings);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData: UserResponse = await UserService.getProfile();
        setUser(userData.user);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again later.");
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="mb-4">Please log in to view your profile</p>
          <Link href="/login">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
              Log In
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
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div
              className="rounded-lg shadow-md p-6 mb-6"
              style={{
                backgroundColor: themeSettings.surfaceColor || "white",
                boxShadow: `0 4px 12px ${themeSettings.shadowColor}`,
              }}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary bg-opacity-10">
                      <FiUser size={40} className="text-primary" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>

              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 transition-all ${
                        activeTab === "profile"
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <FiUser />
                      <span>Profile Information</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 transition-all ${
                        activeTab === "orders"
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <FiShoppingBag />
                      <span>My Orders</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 transition-all ${
                        activeTab === "wishlist"
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <FiHeart />
                      <span>Wishlist</span>
                    </button>
                  </li>

                  <li>
                    <button className="w-full text-left px-4 py-2 rounded-md flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: themeSettings.surfaceColor || "white",
                boxShadow: `0 4px 12px ${themeSettings.shadowColor}`,
              }}
            >
              {activeTab === "profile" && <ProfileTab user={user} />}

              {activeTab === "orders" && <OrdersTab />}

              {activeTab === "wishlist" && <WishlistTab />}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileTab({ user }: { user: User }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Profile Information</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
          <FiEdit size={16} />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              First Name
            </h3>
            <p className="font-medium">{user.firstName}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              Email Address
            </h3>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              Last Name
            </h3>
            <p className="font-medium">{user.lastName}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              Phone Number
            </h3>
            <p className="font-medium">{user.phone || "Not provided"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Account Security</h3>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
          Change Password
        </button>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getOrders();
        setOrders(response.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
        <div className="text-center py-12">
          <FiShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            When you place orders, they will appear here
          </p>
          <Link href="/products">
            <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">
                    Order #{order.orderNumber}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">$</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiShoppingBag className="w-4 h-4" />
                    <span>
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/orders/${order._id}`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    <FiEye className="w-4 h-4" />
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-4 overflow-x-auto">
                {order.items.slice(0, 3).map(
                  (
                    item: {
                      product: { name: string; image?: string };
                      quantity: number;
                    },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="flex-shrink-0 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  )
                )}
                {order.items.length > 3 && (
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-sm text-gray-500">
                      +{order.items.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WishlistTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>
      <div className="text-center py-12">
        <FiHeart size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2">Wishlist Coming Soon</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We&apos;re working on adding wishlist functionality. You&apos;ll be
          able to save your favorite items and come back to them later.
        </p>
        <Link href="/products">
          <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-all">
            Explore Products
          </button>
        </Link>
      </div>
    </div>
  );
}
