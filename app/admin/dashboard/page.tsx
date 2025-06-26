"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast, ToastOptions } from "react-toastify";
import RecentOrdersTable from "../components/RecentOrdersTable";
import SalesChart from "../components/SalesChart";
import StatCard from "../components/StatCard";
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [statusData, setStatusData] = useState({
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/stats/summary");
        const data = await response.json();
        setStats({
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          totalProducts: data.totalProducts,
          totalUsers: data.totalUsers,
        });
        setStatusData(data.orderStatusPercentages);
        // console.log(data);

        setIsLoading(false);
      } catch (error) {
        toast.error(
          "Error fetching dashboard data:",
          error as unknown as ToastOptions
        );
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          value={stats.totalOrders}
          icon="shopping-bag"
          trend={`${stats.totalOrders - 100} orders`}
          trendDirection="up"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue?.toLocaleString() || 0}`}
          icon="currency-dollar"
          trend={`${stats.totalRevenue - 100} orders`}
          trendDirection="up"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="cube"
          trend={`${stats.totalProducts - 100} products`}
          trendDirection="up"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="users"
          trend={`${stats.totalUsers - 100} users`}
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
            Order Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Delivered
              </span>
              <span className="text-sm font-medium">
                {statusData?.delivered}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${statusData?.delivered}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Processing
              </span>
              <span className="text-sm font-medium">
                {statusData?.processing}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${statusData?.processing}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </span>
              <span className="text-sm font-medium">
                {statusData?.pending}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-yellow-500 h-2.5 rounded-full"
                style={{ width: `${statusData?.pending}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Cancelled
              </span>
              <span className="text-sm font-medium">
                {statusData?.cancelled}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{ width: `${statusData?.cancelled}%` }}
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
