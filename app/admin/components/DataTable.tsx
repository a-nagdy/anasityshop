"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  actions?: ReactNode;
  emptyMessage?: {
    title: string;
    description: string;
  };
  onRowClick?: (item: T) => void;
  pageActions?: Action<T>[];
}

export default function DataTable<T>({
  title,
  data,
  columns,
  loading,
  searchTerm,
  onSearchChange,
  filters,
  pagination,
  actions,
  emptyMessage = {
    title: "No items found",
    description: "Try adjusting your filters",
  },
  onRowClick,
  pageActions,
}: DataTableProps<T>) {
  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Add actions column if pageActions are provided
  const finalColumns = pageActions
    ? [
        ...columns,
        {
          header: "Actions",
          accessor: (item: T) => (
            <div className="flex items-center space-x-2">
              {pageActions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  className={`text-sm font-medium ${
                    action.className ||
                    "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ),
          className: "text-right",
        },
      ]
    : columns;

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {title}
        </h1>
        {actions}
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          {onSearchChange && (
            <div className="max-w-md w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {filters && (
            <div className="flex items-center space-x-4">{filters}</div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              {emptyMessage.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {emptyMessage.description}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {finalColumns.map((column, index) => (
                      <th
                        key={index}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                          column.className || ""
                        }`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.map((item, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {finalColumns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap ${
                            column.className || ""
                          }`}
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(item)
                            : String(item[column.accessor])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  Showing page {pagination.currentPage} of{" "}
                  {pagination.totalPages}
                  <span className="ml-2 text-gray-500">
                    ({pagination.totalItems} total items)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      pagination.onPageChange(pagination.currentPage - 1)
                    }
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      pagination.onPageChange(pagination.currentPage + 1)
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
