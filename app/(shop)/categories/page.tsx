"use client";

import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiGrid, FiSearch, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  productsCount?: number;
}

interface HomepageSettings {
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [homepageSettings, setHomepageSettings] =
    useState<HomepageSettings | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/categories");
        console.log("Categories response:", response.data);

        // Handle the response format
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.categories || [];

        // Only show active categories
        const activeCategories = categoriesData.filter(
          (cat: Category) => cat.active
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch homepage settings for background color
  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const response = await axios.get("/api/homepage");
        setHomepageSettings(response.data.settings);
      } catch (error) {
        console.error("Error fetching homepage settings:", error);
        setHomepageSettings({
          backgroundColor: "#0f172a",
          accentColor: "#06b6d4",
          animation3dEnabled: true,
        });
      }
    };

    fetchHomepageSettings();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <p className="text-cyan-100">Loading categories...</p>
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

      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

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
                Categories
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Search Bar */}
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
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <CategoryCard
                key={category._id}
                category={category}
                accentColor={homepageSettings?.accentColor || "#06b6d4"}
              />
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
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${
                    homepageSettings?.accentColor || "#06b6d4"
                  }20, transparent)`,
                }}
              >
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
                className="px-8 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                style={{
                  boxShadow: `0 4px 15px rgba(${hexToRgb(
                    homepageSettings?.accentColor || "#06b6d4"
                  )}, 0.2)`,
                }}
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
      `}</style>
    </div>
  );
}

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

// Category Card Component
interface CategoryCardProps {
  category: Category;
  accentColor: string;
}

function CategoryCard({ category, accentColor }: CategoryCardProps) {
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
      className="group relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-500"
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

      <Link href={`/categories/${category.slug}`} className="block h-full">
        {/* Category Image */}
        <div className="relative h-48 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
              }}
            >
              <FiGrid className="text-6xl text-gray-400" />
            </div>
          )}

          {/* Holographic overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${accentColor}40 50%, transparent 70%)`,
              animation: isHovered
                ? "hologram 2s ease-in-out infinite"
                : "none",
            }}
          />

          {/* Product count badge */}
          {category.productsCount !== undefined && (
            <div className="absolute top-4 right-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm flex items-center gap-1"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                  boxShadow: `0 2px 10px rgba(${hexToRgb(accentColor)}, 0.3)`,
                }}
              >
                <FiUsers className="text-xs" />
                {category.productsCount}
              </span>
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="p-6">
          <h3
            className="font-bold text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r"
            style={{
              backgroundImage: isHovered
                ? `linear-gradient(135deg, ${accentColor}, #ffffff)`
                : undefined,
            }}
          >
            {category.name}
          </h3>

          {category.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* View button */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            View Products
            <FiGrid className="text-sm" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
