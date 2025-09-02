"use client";

import { useTheme } from "@/app/components/ThemeProvider";
import { UserService } from "@/app/services/userService";
import { UserResponse } from "@/app/types/api";
import { User } from "@/app/types/user";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiEdit,
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
                    <button
                      onClick={() => setActiveTab("theme")}
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 transition-all ${
                        activeTab === "theme"
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <span>Theme Settings</span>
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

function WishlistTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>
      <div className="text-center py-12">
        <FiHeart size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Save items you love to your wishlist
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
