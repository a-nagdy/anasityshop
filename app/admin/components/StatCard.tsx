"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendDirection = "neutral",
}: StatCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-start"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend && (
          <div className="mt-2 flex items-center">
            {trendDirection === "up" && (
              <svg
                className="w-4 h-4 text-green-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
            {trendDirection === "down" && (
              <svg
                className="w-4 h-4 text-red-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
            <span
              className={`text-sm font-medium ${
                trendDirection === "up"
                  ? "text-green-500"
                  : trendDirection === "down"
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-full bg-${getIconColor(
          icon
        )}-100 dark:bg-${getIconColor(icon)}-900/30`}
      >
        {getIcon(icon)}
      </div>
    </motion.div>
  );
}

function getIconColor(icon: string): string {
  switch (icon) {
    case "shopping-bag":
      return "blue";
    case "currency-dollar":
      return "green";
    case "cube":
      return "purple";
    case "users":
      return "orange";
    default:
      return "gray";
  }
}

function getIcon(name: string) {
  switch (name) {
    case "shopping-bag":
      return (
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      );
    case "currency-dollar":
      return (
        <svg
          className="w-6 h-6 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "cube":
      return (
        <svg
          className="w-6 h-6 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    case "users":
      return (
        <svg
          className="w-6 h-6 text-orange-600 dark:text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}
