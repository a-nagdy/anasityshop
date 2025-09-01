"use client";
import { UserResponse } from "@/app/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserService } from "../../services/userService";
import DataTable from "../components/DataTable";
export default function CustomersPage() {
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await UserService.getUsers(
          {
            search: search || undefined,
          },
          {
            page,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
          }
        );

        setCustomers(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load customers";
        toast.error(`Customers Error: ${errorMessage}`);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [page, search]);

  const handleDeleteCustomer = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      toast.success("Customer deleted successfully");
      // Refresh the customers list
      const response = await UserService.getUsers(
        {
          search: search || undefined,
        },
        {
          page,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        }
      );
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete customer";
      toast.error(`Delete Error: ${errorMessage}`);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: (c: UserResponse) => c.name,
    },
    { header: "Email", accessor: (c: UserResponse) => c.email },
    { header: "Phone", accessor: () => "-" }, // UserResponse doesn't have phone
    {
      header: "Role",
      accessor: (c: UserResponse) => c.role.replace("-", " "),
    },
    {
      header: "Joined",
      accessor: (c: UserResponse) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];
  const pageActions = [
    {
      label: "Edit",
      onClick: (customer: UserResponse) =>
        router.push(`/admin/customers/${customer._id}`),
      className:
        "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer",
    },
    {
      label: "Delete",
      onClick: (customer: UserResponse) => handleDeleteCustomer(customer._id),
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
