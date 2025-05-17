"use client";

import axios from "axios";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}api/products?limit=${limit}&page=${page}`
        );
        const data = await response.data;
        console.log(data);

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

  const handleDeleteProduct = async (productId: string) => {
    const token = getCookie("auth_token");
    toast.info("Deleting product...");

    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Products
        </h1>
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
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Inventory
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product: Product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.category?.name || "Uncategorized"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${product.price ? product.price.toFixed(2) : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.inventory || product.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">{filteredProducts.length}</span> of{" "}
            <span className="font-medium">{products.length}</span> products
          </div>
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

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
    </div>
  );
}
