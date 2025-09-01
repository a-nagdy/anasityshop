"use client";

import { CategoryResponse } from "@/app/types/api";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiGrid, FiSearch, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import { CategoryService } from "../../services/categoryService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoryService.getActiveCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load categories";
        toast.error(`Categories Error: ${errorMessage}`);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

        {/* Holographic effect overlay */}
        <div className="absolute inset-0 opacity-30 animate-holographic" />

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 relative"
            >
              <span className="text-theme-gradient holographic-text">
                Categories
              </span>
              {/* Glowing effect */}
              <div className="absolute inset-0 text-theme-gradient opacity-50 blur-sm holographic-text">
                Categories
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              Explore our collection of products organized by category
            </motion.p>

            {/* Animated border */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mx-auto mt-8 h-1 w-32 rounded-full theme-bg-gradient"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6 mb-8 shadow-2xl theme-glow"
        >
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/20 backdrop-blur-sm theme-border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-xl theme-bg-gradient opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
          </div>
        </motion.div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
            {filteredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </motion.div>
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mb-8">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center theme-accent-bg-20">
                <FiGrid className="text-4xl text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? "No categories found" : "No categories available"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Categories will appear here once they are added"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn-theme-outline hover:btn-theme-primary transition-all duration-300"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
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

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

// Category Card Component
interface CategoryCardProps {
  category: CategoryResponse;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link href={`/categories/${category.slug}`}>
        <div className="card-theme glass-effect rounded-2xl overflow-hidden hover-lift">
          {/* Category Image */}
          <div className="relative h-48 overflow-hidden">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full theme-bg-secondary flex items-center justify-center">
                <FiGrid className="text-6xl text-gray-400" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Holographic overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 theme-bg-gradient" />
          </div>

          {/* Category Info */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-theme-gradient transition-colors duration-300">
              {category.name}
            </h3>

            {category.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            {/* Product count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400">
                <FiUsers className="text-sm" />
                <span className="text-sm">
                  {category.productCount || 0} products
                </span>
              </div>

              {/* Arrow icon */}
              <div className="text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl theme-border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
