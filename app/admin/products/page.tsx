"use client";

import axios from "axios";
import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";

type Product = {
  id: string;
  _id: string;
  name: string;
  price: number;
  category: {
    id: string;
    name: string;
    _id: string;
  };
  quantity: number;
  inventory?: number;
  status: "in stock" | "out of stock" | "low stock" | "draft";
  featured: boolean;
  image?: string;
  images?: string[];
  slug: string;
  active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `/api/products?limit=${limit}&page=${page}`
        );
        const data = await response.data;

        console.log(response);

        setProducts(data.products);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [limit, page]);

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "in stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "out of stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "low stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "draft":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" ||
        product.category?.name === selectedCategory
    );

  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category?.name).filter(Boolean)
    ),
  ];
console.log(categories)
  const handleDeleteProduct = async (productId: string) => {
    const token = getCookie("auth_token");
    toast.info("Deleting product...");

    setIsDeleting(true);
    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove product from state
      setProducts(products.filter((product) => product._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("Failed to delete product. Please try again.");
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: (product: Product) => (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-md object-cover"
                          src={
                            product?.image ||
                            product?.images?.[0] ||
                            "https://placehold.co/50x50"
                          }
                          alt={product.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.id}
                        </div>
                      </div>
                    </div>
      ),
    },
    {
      header: "Category",
      accessor: (product: Product) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category?.name || "Uncategorized"}
        </div>
      ),
    },
    {
      header: "Price",
      accessor: (product: Product) => (
        <div className="text-sm text-gray-900 dark:text-white">
                    ${product.price ? product.price.toFixed(2) : "0.00"}
        </div>
      ),
    },
    {
      header: "Inventory",
      accessor: (product: Product) => (
        <div className="text-sm text-gray-900 dark:text-white">
                    {product.inventory || product.quantity || 0}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (product: Product) => (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
      ),
    },
  ];

  const pageActions = [
    {
      label: "Edit",
      onClick: (product: Product) =>
        router.push(`/admin/products/${product._id}`),
      className:
        "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    },
    {
      label: "Delete",
      onClick: (product: Product) => handleDeleteProduct(product._id),
      className:
        "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
    },
  ];

  const filterControls = (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Category:
      </label>
      <select
        className="block w-full max-w-xs rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        className="block w-full max-w-xs rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        value={limit}
        onChange={(e) => setLimit(parseInt(e.target.value))}
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
      </select>
        </div>
  );

  const actions = (
    <Link
      href="/admin/products/add"
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
      Add New Product
    </Link>
  );

  return (
    <>
      <DataTable
        title="Products"
        data={filteredProducts}
        columns={columns}
        loading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterControls}
        actions={actions}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(products.length / limit),
          totalItems: products.length,
          onPageChange: setPage,
        }}
        emptyMessage={{
          title: "No products found",
          description: "Try adjusting your search or filters",
        }}
        pageActions={pageActions}
      />

      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
}
