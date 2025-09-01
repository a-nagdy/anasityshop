"use client";

import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
// Import our services and types
import { CategoryService } from "../../services/categoryService";
import { ProductService } from "../../services/productService";
import { CategoryResponse, ProductResponse } from "../../types/api";
import DataTable from "../components/DataTable";

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  // State management
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Other states
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Auth check
  useEffect(() => {
    const token = getCookie("auth_token");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [productsResponse, categoriesData] = await Promise.all([
          ProductService.getProducts(
            {},
            {
              page: 1,
              limit: 1000, // Load all products for client-side filtering
              sortBy: "createdAt",
              sortOrder: "desc",
            }
          ),
          CategoryService.getActiveCategories(),
        ]);

        setAllProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : []
        );
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";
        setError(errorMessage);
        toast.error(`Load Error: ${errorMessage}`);
        setAllProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search API call when debounced search term changes
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) return;

    const searchProducts = async () => {
      try {
        setIsSearching(true);
        const searchResponse = await ProductService.searchProducts(
          debouncedSearchTerm
        );
        const searchResults = searchResponse.data || [];

        // Merge search results with existing products, avoiding duplicates
        setAllProducts((prevProducts) => {
          const searchIds = new Set(
            searchResults.map((p: ProductResponse) => p._id)
          );
          const filteredPrev = prevProducts.filter(
            (p: ProductResponse) => !searchIds.has(p._id)
          );
          return [...searchResults, ...filteredPrev];
        });
      } catch (error) {
        console.error("Search error:", error);
        // Don't show error toast for search failures, just log it
      } finally {
        setIsSearching(false);
      }
    };

    searchProducts();
  }, [debouncedSearchTerm]);

  // Helper functions
  const getProductStatus = useCallback((product: ProductResponse) => {
    if (!product.active) return "draft";
    if (product.quantity === 0) return "out-of-stock";
    if (product.quantity <= 10) return "low-stock";
    return "in-stock";
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "draft":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "in-stock":
        return "In Stock";
      case "out-of-stock":
        return "Out of Stock";
      case "low-stock":
        return "Low Stock";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  }, []);

  // Advanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Text search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      if (selectedCategory === "Uncategorized") {
        filtered = filtered.filter((product) => !product.category);
      } else {
        filtered = filtered.filter(
          (product) =>
            product.category?.name === selectedCategory ||
            product.category?._id === selectedCategory
        );
      }
    }

    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (product) => getProductStatus(product) === selectedStatus
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(
        (product) => product.finalPrice >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(
        (product) => product.finalPrice <= parseFloat(priceRange.max)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof ProductResponse] as
        | string
        | number;
      let bValue: string | number = b[sortBy as keyof ProductResponse] as
        | string
        | number;

      // Handle special cases
      if (sortBy === "category") {
        aValue = a.category?.name || "Uncategorized";
        bValue = b.category?.name || "Uncategorized";
      } else if (sortBy === "status") {
        aValue = getProductStatus(a);
        bValue = getProductStatus(b);
      } else if (sortBy === "finalPrice") {
        aValue = a.finalPrice;
        bValue = b.finalPrice;
      }

      // Convert to string for comparison if needed
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    allProducts,
    searchTerm,
    selectedCategory,
    selectedStatus,
    priceRange,
    sortBy,
    sortOrder,
    getProductStatus,
  ]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Category options for dropdown
  const categoryOptions = useMemo(
    () => ["All", ...categories.map((cat) => cat.name), "Uncategorized"],
    [categories]
  );

  // Status options
  const statusOptions = [
    "All",
    "in-stock",
    "low-stock",
    "out-of-stock",
    "draft",
  ];

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(productId);
    try {
      await ProductService.deleteProduct(productId);
      setAllProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success("Product deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete product";
      toast.error(`Delete Error: ${errorMessage}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setPriceRange({ min: "", max: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Table columns
  const columns = [
    {
      header: "Product",
      accessor: (product: ProductResponse) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <Image
              className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              src={
                product.image ||
                product.images?.[0] ||
                "https://placehold.co/50x50"
              }
              alt={product.name}
              width={48}
              height={48}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 w-[200px] overflow-hidden text-ellipsis">
              {product.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </div>
            {product.description && (
              <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 w-[200px] overflow-hidden mt-1">
                {product.description}
              </div>
            )}
          </div>
        </div>
      ),
      className: "max-w-[200px]",
    },
    {
      header: "Category",
      accessor: (product: ProductResponse) => (
        <div className="text-sm">
          {product.category ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {product.category.name}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
              Uncategorized
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Price",
      accessor: (product: ProductResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            ${product.finalPrice.toFixed(2)}
          </div>
          {product.hasDiscount && (
            <div className="text-xs text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </div>
          )}
          {product.hasDiscount && (
            <div className="text-xs text-green-600 font-medium">
              {Math.round(
                ((product.price - product.finalPrice) / product.price) * 100
              )}
              % off
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Stock",
      accessor: (product: ProductResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {product.quantity}
          </div>
          {product.quantity <= 10 && product.quantity > 0 && (
            <div className="text-xs text-yellow-600 font-medium">
              ⚠️ Low Stock
            </div>
          )}
          {product.quantity === 0 && (
            <div className="text-xs text-red-600 font-medium">Out of Stock</div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (product: ProductResponse) => {
        const status = getProductStatus(product);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {getStatusText(status)}
          </span>
        );
      },
    },
    {
      header: "Featured",
      accessor: (product: ProductResponse) => (
        <div className="text-sm">
          {product.featured ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              ✓ Featured
            </span>
          ) : (
            <span className="text-gray-400 text-xs">Not Featured</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (product: ProductResponse) => (
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/products/${product._id}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDeleteProduct(product._id)}
            disabled={isDeleting === product._id}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting === product._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Products
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading products...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Products
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium">Failed to Load Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Products
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredAndSortedProducts.length} of {allProducts.length} products
            {searchTerm && (
              <span className="ml-1">
                • Searching for &quot;{searchTerm}&quot;
                {isSearching && <span className="ml-1 animate-pulse">...</span>}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Filters & Search
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, SKU, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Status" : getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items per page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => {
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }));
                  setCurrentPage(1);
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => {
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }));
                  setCurrentPage(1);
                }}
                placeholder="999.99"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="finalPrice">Price</option>
                <option value="quantity">Stock</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-lg font-medium mb-2">
                {filteredAndSortedProducts.length === 0
                  ? "No products found"
                  : "No products on this page"}
              </p>
              <p className="text-sm">
                {filteredAndSortedProducts.length === 0
                  ? "Try adjusting your search or filters"
                  : "Try going to a different page or changing your filters"}
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedProducts}
            title=""
            loading={false}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedProducts.length
              )}{" "}
              of {filteredAndSortedProducts.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
