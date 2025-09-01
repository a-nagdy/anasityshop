"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// Import our new services
import { OrderService } from "../../services/orderService";
import { ProductService } from "../../services/productService";
import { UserService } from "../../services/userService";
import RecentOrdersTable from "../components/RecentOrdersTable";
import SalesChart from "../components/SalesChart";
import StatCard from "../components/StatCard";

// Define proper types for dashboard data
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

interface OrderStatusData {
  delivered: number;
  processing: number;
  pending: number;
  cancelled: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusData, setStatusData] = useState<OrderStatusData>({
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use our service layer with Promise.all for parallel requests
        const [orderStats, productStats, userStats] = await Promise.all([
          OrderService.getOrderStats(),
          ProductService.getProductStats(),
          UserService.getUserStats(),
        ]);

        // Calculate order status percentages
        const totalOrders = orderStats.totalOrders;
        const statusPercentages: OrderStatusData = {
          delivered:
            totalOrders > 0
              ? Math.round(
                  ((orderStats.statusBreakdown.delivered || 0) / totalOrders) *
                    100
                )
              : 0,
          processing:
            totalOrders > 0
              ? Math.round(
                  ((orderStats.statusBreakdown.processing || 0) / totalOrders) *
                    100
                )
              : 0,
          pending:
            totalOrders > 0
              ? Math.round(
                  ((orderStats.statusBreakdown.pending || 0) / totalOrders) *
                    100
                )
              : 0,
          cancelled:
            totalOrders > 0
              ? Math.round(
                  ((orderStats.statusBreakdown.cancelled || 0) / totalOrders) *
                    100
                )
              : 0,
        };

        setStats({
          totalOrders: orderStats.totalOrders,
          totalRevenue: orderStats.totalRevenue,
          totalProducts: productStats.totalProducts,
          totalUsers: userStats.totalUsers,
        });

        setStatusData(statusPercentages);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";
        setError(errorMessage);
        toast.error(`Dashboard Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-red-500 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium">Dashboard Error</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {error}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="text-2xl font-semibold text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Overview
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon="shopping-bag"
          trend={`${stats.totalOrders} total orders`}
          trendDirection="up"
        />
        <StatCard
          title="Total Revenue"
          value={`$ ${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : 0}`}
          icon="currency-dollar"
          trend={`$${
            stats.totalRevenue ? stats.totalRevenue.toFixed(2) : 0
          } revenue`}
          trendDirection="up"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon="cube"
          trend={`${stats.totalProducts} products`}
          trendDirection="up"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="users"
          trend={`${stats.totalUsers} users`}
          trendDirection="up"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Sales Overview
          </h2>
          <SalesChart data={stats} />
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Order Status Distribution
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Delivered
              </span>
              <span className="text-sm font-medium">
                {statusData.delivered}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${statusData.delivered}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Processing
              </span>
              <span className="text-sm font-medium">
                {statusData.processing}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${statusData.processing}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </span>
              <span className="text-sm font-medium">{statusData.pending}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${statusData.pending}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Cancelled
              </span>
              <span className="text-sm font-medium">
                {statusData.cancelled}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${statusData.cancelled}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="p-6 pb-0">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Recent Orders
          </h2>
        </div>
        <RecentOrdersTable />
      </motion.div>
    </div>
  );
}
