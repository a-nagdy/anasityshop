"use client";
import { User } from "@/app/types/user";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const res = await fetch(`/api/customers?page=${page}&search=${search}`);
      const data = await res.json();
      // console.log(data);
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchCustomers();
  }, [page, search]);

  const handleDeleteCustomer = async (id: string) => {
    const res = await axios.delete(`/api/customers/${id}`);
    if (res.status === 200) {
      toast.success("Customer deleted successfully");
    } else {
      toast.error("Failed to delete customer");
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: (c: User) => `${c.firstName} ${c.lastName}`,
    },
    { header: "Email", accessor: (c: User) => c.email },
    { header: "Phone", accessor: (c: User) => c.phone || "-" },
    {
      header: "Role",
      accessor: (c: User) => c.role.replace("-", " "),
    },
    {
      header: "Joined",
      accessor: (c: User) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];
  const pageActions = [
    {
      label: "Edit",
      onClick: (customer: User) =>
        router.push(`/admin/customers/${customer._id}`),
      className:
        "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer",
    },
    {
      label: "Delete",
      onClick: (customer: User) => handleDeleteCustomer(customer._id),
      className:
        "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer",
    },
  ];

  const addAction = (
    <Link
      href="/admin/customers/add"
      className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow transition-colors"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Add New Customer
    </Link>
  );

  return (
    <DataTable
      title="Customers"
      data={customers}
      columns={columns}
      loading={loading}
      searchTerm={search}
      onSearchChange={setSearch}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: customers.length,
        onPageChange: setPage,
      }}
      emptyMessage={{
        title: "No customers found",
        description: "Try adjusting your search.",
      }}
      pageActions={pageActions}
      actions={addAction}
    />
  );
}
