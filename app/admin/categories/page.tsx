"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CategoryService } from "../../services/categoryService";
import { CategoryResponse } from "../../types/api";

type Category = CategoryResponse;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Category>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError("");

    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      setError(errorMessage);
      toast.error(`Categories Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.slug &&
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (category._id &&
        category._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create a manual sorting function to ensure proper ordering
  const manualSort = (categories: Category[]) => {
    // Create a copy to avoid mutating the original array
    const sorted = [...categories];

    // Sort based on the current field and direction
    if (sortField === "name") {
      sorted.sort((a, b) => {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    } else if (sortField === "productCount") {
      sorted.sort((a, b) => {
        // Force conversion to number and handle undefined
        const aProducts = a.productCount === undefined ? 0 : +a.productCount;
        const bProducts = b.productCount === undefined ? 0 : +b.productCount;

        if (sortDirection === "asc") {
          return aProducts - bProducts;
        } else {
          return bProducts - aProducts;
        }
      });
    } else if (sortField === "active") {
      sorted.sort((a, b) => {
        const aActive = a.active ? 1 : 0;
        const bActive = b.active ? 1 : 0;

        return sortDirection === "asc" ? aActive - bActive : bActive - aActive;
      });
    }

    return sorted;
  };

  // Apply the manual sorting
  const sortedCategories = manualSort(filteredCategories);

  // Pagination
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const displayedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort click
  const handleSort = (field: string) => {
    // Make sure field is a valid property of Category
    const validField = field as keyof Category;

    if (validField === sortField) {
      // Toggle direction if same field
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      // Set new field and reset direction to asc
      setSortField(validField);
      setSortDirection("asc");
    }
  };

  // Handle delete with service layer
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setIsDeleting(categoryId);

    try {
      await CategoryService.deleteCategory(categoryId);

      // Remove from local state
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));

      toast.success("Category deleted successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      toast.error(`Delete Error: ${errorMessage}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Categories
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">
              Failed to load categories
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Categories
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Categories
        </h1>
        <Link
          href="/admin/categories/new"
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
          Add New Category
        </Link>
      </motion.div>

      {/* Main Content Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Search and Sorting Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
          <div className="w-full lg:w-1/3">
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center">
              <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Sort by:
              </label>
              <div className="flex">
                <button
                  onClick={() => handleSort("name")}
                  className={`px-3 py-1 text-sm rounded-l-md ${
                    sortField === "name"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Name{" "}
                  {sortField === "name" &&
                    (sortDirection === "desc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("productCount")}
                  className={`px-3 py-1 text-sm ${
                    sortField === "productCount"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Products{" "}
                  {sortField === "productCount" &&
                    (sortDirection === "desc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("active")}
                  className={`px-3 py-1 text-sm rounded-r-md ${
                    sortField === "active"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Status{" "}
                  {sortField === "active" &&
                    (sortDirection === "desc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCategories.map((category) => (
            <motion.div
              key={category._id}
              className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div
                  className={`h-36 w-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                    !category.image ? "text-gray-400 dark:text-gray-500" : ""
                  }`}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      category.active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400"
                    }`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {category.name}
                  </h3>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {category.slug}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.productCount || 0} Products
                    </span>
                  </div>

                  {category.parent && (
                    <div className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      Sub-category
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-600 flex justify-between">
                  <Link
                    href={`/admin/categories/${category._id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    disabled={isDeleting === category._id}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {displayedCategories.length === 0 && (
          <div className="text-center py-8 px-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No categories found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you&apos;re
              looking for.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-400 mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-medium">
              {displayedCategories.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredCategories.length)}
            </span>{" "}
            of <span className="font-medium">{filteredCategories.length}</span>{" "}
            categories
          </div>

          {totalPages > 1 && (
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = 1;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
