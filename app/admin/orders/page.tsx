"use client";

import { Order } from "@/app/types/orders";
import { Pagination } from "@/app/types/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";

interface ColumnKey {
  order: boolean;
  customer: boolean;
  total: boolean;
  status: boolean;
  payment: boolean;
  delivery: boolean;
  date: boolean;
  items: boolean;
  shipping: boolean;
  notes: boolean;
  actions: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    isPaid: "",
    isDelivered: "",
  });
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey>({
    order: true,
    customer: true,
    total: true,
    status: true,
    payment: true,
    delivery: true,
    date: true,
    items: true,
    shipping: true,
    notes: true,
    actions: true,
  });
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        ...filters,
      });
      const response = await fetch(`/api/orders?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      // console.log(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return (
      colors[status.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const columnDefinitions = [
    {
      header: "Order",
      accessor: "orderNumber",
      key: "order" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {order.orderNumber}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "user",
      key: "customer" as keyof ColumnKey,
      render: (order: Order) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {order.user.firstName} {order.user.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {order.user.email}
          </div>
        </div>
      ),
    },
    {
      header: "Total",
      accessor: "total",
      key: "total" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm text-gray-900 dark:text-white">
          ${order.total.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      key: "status" as keyof ColumnKey,
      render: (order: Order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: "isPaid",
      key: "payment" as keyof ColumnKey,
      render: (order: Order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            order.isPaid
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {order.isPaid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      header: "Delivery",
      accessor: "isDelivered",
      key: "delivery" as keyof ColumnKey,
      render: (order: Order) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            order.isDelivered
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {order.isDelivered ? "Delivered" : "Pending"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      key: "date" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Items",
      accessor: "items",
      key: "items" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {order.items.length} items
        </div>
      ),
    },
    {
      header: "Shipping",
      accessor: "shipping",
      key: "shipping" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {order.shipping?.method || ""}
        </div>
      ),
    },
    {
      header: "Notes",
      accessor: "notes",
      key: "notes" as keyof ColumnKey,
      render: (order: Order) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {order.notes || "No notes"}
        </div>
      ),
    },
  ];

  const columns = columnDefinitions
    .filter((col) => visibleColumns[col.key])
    .map(({ header, render }) => ({
      header,
      accessor: render,
    }));

  const filterControls = (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex gap-4">
        <select
          className="border rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className="border rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
          value={filters.isPaid}
          onChange={(e) => handleFilterChange("isPaid", e.target.value)}
        >
          <option value="">All Payment Status</option>
          <option value="true">Paid</option>
          <option value="false">Unpaid</option>
        </select>
        <select
          className="border rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
          value={filters.isDelivered}
          onChange={(e) => handleFilterChange("isDelivered", e.target.value)}
        >
          <option value="">All Delivery Status</option>
          <option value="true">Delivered</option>
          <option value="false">Not Delivered</option>
        </select>
      </div>
      <div className="relative">
        <button
          className="border rounded p-2 bg-white dark:bg-gray-700 dark:text-white flex items-center gap-2"
          onClick={() => {
            const dropdown = document.getElementById("columnDropdown");
            dropdown?.classList.toggle("hidden");
          }}
        >
          <span>Columns</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          id="columnDropdown"
          className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10"
        >
          <div className="p-2">
            {columnDefinitions.map((column) => (
              <label
                key={column.key}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[column.key]}
                  onChange={(e) =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [column.key]: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {column.header}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const pageActions = [
    {
      label: "View Details",
      onClick: (order: Order) => router.push(`/admin/orders/${order._id}`),
      className:
        "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300",
    },
  ];

  return (
    <DataTable
      title="Orders"
      data={orders}
      columns={columns}
      loading={loading}
      filters={filterControls}
      pagination={{
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalOrders,
        onPageChange: (page) =>
          setPagination((prev) => ({ ...prev, currentPage: page })),
      }}
      onRowClick={(order) => router.push(`/admin/orders/${order._id}`)}
      emptyMessage={{
        title: "No orders found",
        description: "Try adjusting your filters",
      }}
      pageActions={pageActions}
    />
    );
}
