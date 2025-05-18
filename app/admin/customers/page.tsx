"use client";
import { User } from "@/app/types/user";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const res = await fetch(`/api/customers?page=${page}&search=${search}`);
      const data = await res.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchCustomers();
  }, [page, search]);

  const columns = [
    {
      header: "Name",
      accessor: (c: User) => `${c.firstName} ${c.lastName}`,
    },
    { header: "Email", accessor: (c: User) => c.email },
    { header: "Phone", accessor: (c: User) => c.phone || "-" },
    { header: "Address", accessor: (c: User) => c.address?.address || "-" },
    {
      header: "Joined",
      accessor: (c: User) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

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
    />
  );
}
