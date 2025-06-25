"use client";

import { DualRangeSlider } from "@/app/components/ui/DualRangeSlider";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiGrid,
  FiHeart,
  FiList,
  FiSearch,
  FiShoppingCart,
  FiStar,
} from "react-icons/fi";
import { toast } from "react-toastify";

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "6, 182, 212";
}

// Types
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  status: "in stock" | "out of stock" | "draft" | "low stock";
  color: string[];
  size: string[];
  featured: boolean;
  active: boolean;
  totalRating: number;
  sold: number;
  createdAt: string;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  children?: Category[];
}

interface Filters {
  search: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  status: string[];
  featured: boolean | null;
  rating: number;
}

type SortOption = {
  label: string;
  value: string;
  field: string;
  order: "asc" | "desc";
};

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];
const SORT_OPTIONS: SortOption[] = [
  { label: "Newest First", value: "newest", field: "createdAt", order: "desc" },
  {
    label: "Price: Low to High",
    value: "price_asc",
    field: "finalPrice",
    order: "asc",
  },
  {
    label: "Price: High to Low",
    value: "price_desc",
    field: "finalPrice",
    order: "desc",
  },
  { label: "Most Popular", value: "popular", field: "sold", order: "desc" },
  {
    label: "Best Rating",
    value: "rating",
    field: "totalRating",
    order: "desc",
  },
  { label: "Name A-Z", value: "name_asc", field: "name", order: "asc" },
  { label: "Name Z-A", value: "name_desc", field: "name", order: "desc" },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");

  // Homepage settings for background color
  const [homepageSettings, setHomepageSettings] = useState<{
    backgroundColor: string;
    accentColor: string;
    animation3dEnabled: boolean;
  } | null>(null);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS[0]);

  // Filters
  const [filters, setFilters] = useState<Filters>({
    search: "",
    priceRange: [0, 10000],
    colors: [],
    sizes: [],
    status: [],
    featured: null,
    rating: 0,
  });

  // Available filter options (extracted from products)
  const [filterOptions, setFilterOptions] = useState({
    colors: [] as string[],
    sizes: [] as string[],
    maxPrice: 10000,
    minPrice: 0,
  });

  // Filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch category and initial data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/categories/${slug}`);
        setCategory(response.data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Category not found");
        toast.error("Category not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  // Fetch homepage settings for background color
  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const response = await axios.get("/api/homepage");
        setHomepageSettings(response.data.settings);
      } catch (error) {
        console.error("Error fetching homepage settings:", error);
        // Use defaults if failed
        setHomepageSettings({
          backgroundColor: "#0f172a",
          accentColor: "#06b6d4",
          animation3dEnabled: true,
        });
      }
    };

    fetchHomepageSettings();
  }, []);

  // Fetch products with corrected sort parameter
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      try {
        setProductsLoading(true);

        // Convert sort format from sortBy to API expected format
        let sortParam = "";
        if (sortBy.field === "finalPrice" && sortBy.order === "asc") {
          sortParam = "price_asc";
        } else if (sortBy.field === "finalPrice" && sortBy.order === "desc") {
          sortParam = "price_desc";
        } else if (sortBy.field === "name" && sortBy.order === "asc") {
          sortParam = "name_asc";
        } else if (sortBy.field === "name" && sortBy.order === "desc") {
          sortParam = "name_desc";
        } else if (sortBy.field === "sold") {
          sortParam = "popular";
        } else {
          sortParam = "-createdAt"; // Default newest first
        }

        const params = new URLSearchParams({
          category: category._id,
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sort: sortParam,
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.featured !== null)
          params.append("featured", filters.featured.toString());
        if (filters.status.length > 0)
          params.append("status", filters.status.join(","));

        console.log("Fetching products with params:", params.toString());

        const response = await axios.get(`/api/products?${params.toString()}`);
        console.log("Products response:", response.data);

        const fetchedProducts =
          response.data.data?.products || response.data.products || [];

        setProducts(fetchedProducts);

        // Extract filter options from all products
        const allColors = new Set<string>();
        const allSizes = new Set<string>();
        let maxPrice = 0;
        let minPrice = Infinity;

        fetchedProducts.forEach((product: Product) => {
          product.color?.forEach((color) => allColors.add(color));
          product.size?.forEach((size) => allSizes.add(size));
          const price = product.discountPrice || product.price;
          maxPrice = Math.max(maxPrice, price);
          minPrice = Math.min(minPrice, price);
        });

        setFilterOptions({
          colors: Array.from(allColors),
          sizes: Array.from(allSizes),
          maxPrice: Math.ceil(maxPrice),
          minPrice: Math.floor(minPrice),
        });

        // Update price range filter if it's the initial load
        if (filters.priceRange[1] === 10000) {
          setFilters((prev) => ({
            ...prev,
            priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)],
          }));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category, currentPage, itemsPerPage, sortBy, filters]);

  // Filter products client-side (for better UX)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Price range filter
      const price = product.discountPrice || product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1])
        return false;

      // Color filter
      if (
        filters.colors.length > 0 &&
        !product.color?.some((color) => filters.colors.includes(color))
      )
        return false;

      // Size filter
      if (
        filters.sizes.length > 0 &&
        !product.size?.some((size) => filters.sizes.includes(size))
      )
        return false;

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(product.status))
        return false;

      // Rating filter
      if (filters.rating > 0 && product.totalRating < filters.rating)
        return false;

      return true;
    });
  }, [products, filters]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, itemsPerPage]);

  // Pagination
  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      priceRange: [filterOptions.minPrice, filterOptions.maxPrice],
      colors: [],
      sizes: [],
      status: [],
      featured: null,
      rating: 0,
    });
  };

  const dynamicStyles = homepageSettings
    ? {
        backgroundColor: homepageSettings.backgroundColor,
        "--accent-color": homepageSettings.accentColor,
        "--accent-rgb": hexToRgb(homepageSettings.accentColor),
      }
    : {
        backgroundColor: "#0f172a",
        "--accent-color": "#06b6d4",
        "--accent-rgb": "6, 182, 212",
      };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Category Not Found
          </h1>
          <p className="text-slate-300 mb-6">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={dynamicStyles as React.CSSProperties}
    >
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(var(--accent-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "grid-move 20s linear infinite",
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                backgroundColor: homepageSettings?.accentColor || "#06b6d4",
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent"
          style={{
            background: `radial-gradient(circle at 20% 50%, rgba(${hexToRgb(
              homepageSettings?.accentColor || "#06b6d4"
            )}, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Hero Section with enhanced effects */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
        {category?.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-40"
          />
        )}

        {/* Holographic effect overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(45deg, 
              transparent 30%, 
              rgba(${hexToRgb(
                homepageSettings?.accentColor || "#06b6d4"
              )}, 0.3) 50%, 
              transparent 70%
            )`,
            animation: "hologram 3s ease-in-out infinite alternate",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 relative"
              style={{
                textShadow: `0 0 30px rgba(${hexToRgb(
                  homepageSettings?.accentColor || "#06b6d4"
                )}, 0.5)`,
              }}
            >
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    homepageSettings?.accentColor || "#06b6d4"
                  }, #ffffff, ${homepageSettings?.accentColor || "#06b6d4"})`,
                }}
              >
                {category?.name}
              </span>
              {/* Glowing effect */}
              <div
                className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r opacity-50 blur-sm"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    homepageSettings?.accentColor || "#06b6d4"
                  }, #ffffff, ${homepageSettings?.accentColor || "#06b6d4"})`,
                }}
              >
                {category?.name}
              </div>
            </motion.h1>

            {category?.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {category.description}
              </motion.p>
            )}

            {/* Animated border */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mx-auto mt-8 h-1 w-32 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${
                  homepageSettings?.accentColor || "#06b6d4"
                }, transparent)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content with glassmorphism */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl"
          style={{
            boxShadow: `0 8px 32px rgba(${hexToRgb(
              homepageSettings?.accentColor || "#06b6d4"
            )}, 0.1)`,
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg w-5 h-5"
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
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
              />
              {/* Glowing border effect */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${
                    homepageSettings?.accentColor || "#06b6d4"
                  }, transparent)`,
                }}
              />
            </div>

            {/* Toolbar Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy.value}
                  onChange={(e) => {
                    const selected =
                      SORT_OPTIONS.find(
                        (opt) => opt.value === e.target.value
                      ) || SORT_OPTIONS[0];
                    setSortBy(selected);
                  }}
                  className="px-4 py-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 appearance-none min-w-[160px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-800 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                </div>
              </div>

              {/* Futuristic Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative px-6 py-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 group"
                style={{
                  boxShadow: `0 4px 15px rgba(${hexToRgb(
                    homepageSettings?.accentColor || "#06b6d4"
                  )}, 0.2)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                    />
                  </svg>
                  <span>Filters</span>
                  {(filters.colors.length > 0 ||
                    filters.sizes.length > 0 ||
                    filters.status.length > 0 ||
                    filters.featured !== null ||
                    filters.rating > 0) && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center"
                      style={{
                        backgroundColor:
                          homepageSettings?.accentColor || "#06b6d4",
                      }}
                    />
                  )}
                </div>
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "grid"
                        ? `${homepageSettings?.accentColor || "#06b6d4"}40`
                        : undefined,
                  }}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "list"
                        ? `${homepageSettings?.accentColor || "#06b6d4"}40`
                        : undefined,
                  }}
                >
                  <FiList className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Futuristic Filter Sidebar */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-500 ${
            isFilterOpen ? "visible" : "invisible"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
              isFilterOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`absolute right-0 top-0 h-full w-96 max-w-[90vw] backdrop-blur-xl bg-gradient-to-b from-slate-900/95 to-slate-800/95 border-l border-white/10 shadow-2xl transition-transform duration-500 overflow-y-auto ${
              isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              boxShadow: `0 0 60px rgba(${hexToRgb(
                homepageSettings?.accentColor || "#06b6d4"
              )}, 0.2)`,
            }}
          >
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    style={{
                      color: homepageSettings?.accentColor || "#06b6d4",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                    />
                  </svg>
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-8">
              {/* Price Range */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        homepageSettings?.accentColor || "#06b6d4",
                    }}
                  />
                  Price Range
                </label>
                <div className="space-y-4">
                  {/* Shadcn Dual Range Slider */}
                  <DualRangeSlider
                    value={filters.priceRange}
                    min={filterOptions.minPrice}
                    max={filterOptions.maxPrice}
                    step={1}
                    accentColor={homepageSettings?.accentColor || "#06b6d4"}
                    onValueChange={(value) =>
                      handleFilterChange("priceRange", value)
                    }
                    label={(value) => `$${value}`}
                    labelPosition="top"
                    className="w-full"
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Min:</span>
                      <span className="text-white font-mono bg-white/10 px-3 py-1 rounded-lg">
                        ${filters.priceRange[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Max:</span>
                      <span className="text-white font-mono bg-white/10 px-3 py-1 rounded-lg">
                        ${filters.priceRange[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors Filter */}
              {filterOptions.colors.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          homepageSettings?.accentColor || "#06b6d4",
                      }}
                    />
                    Colors
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {filterOptions.colors.map((color) => (
                      <label key={color} className="cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(color)}
                          onChange={(e) => {
                            const newColors = e.target.checked
                              ? [...filters.colors, color]
                              : filters.colors.filter((c) => c !== color);
                            handleFilterChange("colors", newColors);
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                            filters.colors.includes(color)
                              ? "border-white shadow-lg scale-110 ring-2 ring-white/30"
                              : "border-gray-500 group-hover:border-white group-hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                        >
                          {filters.colors.includes(color) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 text-center mt-1 capitalize">
                          {color}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Filter */}
              {filterOptions.sizes.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          homepageSettings?.accentColor || "#06b6d4",
                      }}
                    />
                    Sizes
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {filterOptions.sizes.map((size) => (
                      <label key={size} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.sizes.includes(size)}
                          onChange={(e) => {
                            const newSizes = e.target.checked
                              ? [...filters.sizes, size]
                              : filters.sizes.filter((s) => s !== size);
                            handleFilterChange("sizes", newSizes);
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`px-3 py-2 rounded-lg text-center font-medium transition-all duration-300 ${
                            filters.sizes.includes(size)
                              ? "bg-white/20 text-white border-2 border-white shadow-lg"
                              : "bg-white/5 text-gray-400 border-2 border-gray-600 hover:border-white hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {size}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        homepageSettings?.accentColor || "#06b6d4",
                    }}
                  />
                  Availability
                </label>
                <div className="space-y-3">
                  {["in stock", "out of stock", "low stock"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter((s) => s !== status);
                          handleFilterChange("status", newStatus);
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-gray-500 bg-transparent checked:bg-white/20 checked:border-white focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      />
                      <span className="ml-3 text-gray-300 group-hover:text-white capitalize transition-colors duration-300">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        homepageSettings?.accentColor || "#06b6d4",
                    }}
                  />
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange("rating", rating)}
                        className="w-5 h-5 border-2 border-gray-500 bg-transparent checked:bg-white/20 checked:border-white focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      />
                      <div className="ml-3 flex items-center gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <FiStar
                            key={i}
                            className="text-yellow-400 fill-current w-4 h-4"
                          />
                        ))}
                        {[...Array(5 - rating)].map((_, i) => (
                          <FiStar key={i} className="text-gray-600 w-4 h-4" />
                        ))}
                        <span className="text-gray-300 group-hover:text-white ml-2 transition-colors duration-300">
                          {rating}+ Stars
                        </span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === 0}
                      onChange={() => handleFilterChange("rating", 0)}
                      className="w-5 h-5 border-2 border-gray-500 bg-transparent checked:bg-white/20 checked:border-white focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    />
                    <span className="ml-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                      Any Rating
                    </span>
                  </label>
                </div>
              </div>

              {/* Featured Filter */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        homepageSettings?.accentColor || "#06b6d4",
                    }}
                  />
                  Special Features
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.featured === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "featured",
                        e.target.checked ? true : null
                      )
                    }
                    className="w-5 h-5 rounded-lg border-2 border-gray-500 bg-transparent checked:bg-white/20 checked:border-white focus:ring-2 focus:ring-white/30 transition-all duration-300"
                  />
                  <span className="ml-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                    Featured Products Only
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${
                      homepageSettings?.accentColor || "#06b6d4"
                    }, ${homepageSettings?.accentColor || "#06b6d4"}80)`,
                    boxShadow: `0 4px 15px rgba(${hexToRgb(
                      homepageSettings?.accentColor || "#06b6d4"
                    )}, 0.3)`,
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid with enhanced animations */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-transparent"
                style={{
                  borderTopColor: homepageSettings?.accentColor || "#06b6d4",
                  borderRightColor: homepageSettings?.accentColor || "#06b6d4",
                }}
              />
              <div
                className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-transparent opacity-20"
                style={{
                  borderTopColor: homepageSettings?.accentColor || "#06b6d4",
                }}
              />
            </div>
          </div>
        ) : currentProducts.length > 0 ? (
          <motion.div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {currentProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                accentColor={homepageSettings?.accentColor || "#06b6d4"}
              />
            ))}
          </motion.div>
        ) : (
          // Enhanced empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mb-8">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${
                    homepageSettings?.accentColor || "#06b6d4"
                  }20, transparent)`,
                }}
              >
                <FiSearch className="text-4xl text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No products found
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search terms to find what
              you&apos;re looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              style={{
                boxShadow: `0 4px 15px rgba(${hexToRgb(
                  homepageSettings?.accentColor || "#06b6d4"
                )}, 0.2)`,
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalProducts > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center mt-12 space-x-2"
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all duration-300"
            >
              Previous
            </button>

            {/* Page numbers */}
            {[...Array(Math.ceil(totalProducts / itemsPerPage))].map(
              (_, index) => {
                const pageNum = index + 1;
                const isCurrentPage = pageNum === currentPage;

                // Show first page, current page and surrounding pages, last page
                if (
                  pageNum === 1 ||
                  pageNum === Math.ceil(totalProducts / itemsPerPage) ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300 ${
                        isCurrentPage
                          ? "bg-white/20 text-white shadow-lg"
                          : "bg-black/20 text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                      style={{
                        backgroundColor: isCurrentPage
                          ? `${homepageSettings?.accentColor || "#06b6d4"}40`
                          : undefined,
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }
            )}

            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    Math.ceil(totalProducts / itemsPerPage),
                    currentPage + 1
                  )
                )
              }
              disabled={currentPage === Math.ceil(totalProducts / itemsPerPage)}
              className="px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all duration-300"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8 text-gray-400 text-sm"
        >
          Showing {startIndex + 1} to {Math.min(endIndex, totalProducts)} of{" "}
          {totalProducts} products
        </motion.div>
      </div>

      {/* Enhanced CSS */}
      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes hologram {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        /* Custom Slider Styles */
        .slider-thumb-min,
        .slider-thumb-max {
          pointer-events: auto;
        }

        .slider-thumb-min::-webkit-slider-thumb,
        .slider-thumb-max::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), #ffffff);
          border: 2px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
          transition: all 0.3s ease;
          position: relative;
          margin-top: -8.5px;
        }

        .slider-thumb-min::-webkit-slider-thumb:hover,
        .slider-thumb-max::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.6);
        }

        .slider-thumb-min::-moz-range-thumb,
        .slider-thumb-max::-moz-range-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), #ffffff);
          border: 2px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
          transition: all 0.3s ease;
          border: none;
          margin-top: -8.5px;
        }

        .slider-thumb-min::-moz-range-thumb:hover,
        .slider-thumb-max::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.6);
        }

        /* Hide default track for dual slider */
        .slider-thumb-min::-webkit-slider-runnable-track,
        .slider-thumb-max::-webkit-slider-runnable-track {
          appearance: none;
          background: transparent;
          border: none;
          height: 3px;
        }

        .slider-thumb-min::-moz-range-track,
        .slider-thumb-max::-moz-range-track {
          background: transparent;
          border: none;
          height: 3px;
        }

        /* Ensure Firefox doesn't interfere */
        .slider-thumb-min,
        .slider-thumb-max {
          -moz-appearance: none;
          background: transparent;
          border: none;
        }

        /* Remove default focus outline */
        .slider-thumb-min:focus,
        .slider-thumb-max:focus {
          outline: none;
        }

        .slider-thumb-min:focus::-webkit-slider-thumb,
        .slider-thumb-max:focus::-webkit-slider-thumb {
          box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.8);
        }
      `}</style>
    </div>
  );
}

// Enhanced ProductCard component
interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
  accentColor: string;
}

function ProductCard({ product, viewMode, accentColor }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 ${
        viewMode === "list" ? "flex flex-row" : "flex flex-col"
      }`}
      style={{
        boxShadow: isHovered
          ? `0 20px 60px rgba(${hexToRgb(
              accentColor
            )}, 0.3), 0 0 30px rgba(${hexToRgb(accentColor)}, 0.1)`
          : `0 8px 32px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}, transparent 70%)`,
        }}
      />

      {/* Product Image */}
      <div
        className={`relative overflow-hidden ${
          viewMode === "list" ? "w-48 h-48" : "h-64"
        }`}
      >
        <Image
          src={product.image || product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Holographic overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${accentColor}40 50%, transparent 70%)`,
            animation: isHovered ? "hologram 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-8 group-hover:translate-x-0">
          <button
            className="p-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            style={{
              boxShadow: `0 4px 15px rgba(${hexToRgb(accentColor)}, 0.2)`,
            }}
          >
            <FiHeart className="text-sm" />
          </button>
          <button
            className="p-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            style={{
              boxShadow: `0 4px 15px rgba(${hexToRgb(accentColor)}, 0.2)`,
            }}
          >
            <FiEye className="text-sm" />
          </button>
        </div>

        {/* Status badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.hasDiscount && (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                boxShadow: `0 2px 10px rgba(${hexToRgb(accentColor)}, 0.3)`,
              }}
            >
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          {product.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white backdrop-blur-sm">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div
        className={`p-6 flex-1 ${
          viewMode === "list" ? "flex flex-col justify-between" : ""
        }`}
      >
        <div>
          <h3
            className="font-bold text-lg text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r"
            style={{
              backgroundImage: isHovered
                ? `linear-gradient(135deg, ${accentColor}, #ffffff)`
                : undefined,
            }}
          >
            {product.name}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold" style={{ color: accentColor }}>
              ${product.finalPrice?.toFixed(2) || product.price?.toFixed(2)}
            </span>
            {product.hasDiscount && (
              <span className="text-gray-500 line-through text-lg">
                ${product.price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.totalRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`text-sm ${
                      i < product.totalRating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({product.totalRating})
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
            boxShadow: `0 4px 15px rgba(${hexToRgb(accentColor)}, 0.3)`,
          }}
        >
          <FiShoppingCart className="text-lg" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
