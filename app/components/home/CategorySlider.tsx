"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  productsCount: number;
}

interface CategorySliderProps {
  title: string;
  subtitle?: string;
  categoryIds?: string[];
  featured?: boolean;
}

export default function CategorySlider({
  title,
  subtitle,
  categoryIds = [],
  featured = false,
}: CategorySliderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Create a stable URL string that only changes when dependencies change
  const apiUrl = useMemo(() => {
    let url = "/api/categories";
    if (featured) {
      url += "?featured=true";
    } else if (categoryIds && categoryIds.length > 0) {
      url += `?categoryIds=${categoryIds.join(",")}`;
    }
    return url;
  }, [featured, categoryIds]);

  const fetchCategories = useCallback(async () => {
    // Skip fetching if we've already loaded data for this URL
    if (!isLoading && categories.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(apiUrl, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      // Check if categories exist in the response
      if (!data.categories || !Array.isArray(data.categories)) {
        setCategories([]);
        return;
      }

      // Filter out categories with no image
      const validCategories = data.categories.filter(
        (cat: Category) => cat.image && cat.image.length > 0
      );
      console.log("data", data);
      console.log("validCategories", validCategories);
      setCategories(validCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, categories.length, isLoading]);

  // Use a ref to track if we've already made the initial API call
  const initialFetchRef = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't already or if dependencies changed
    if (!initialFetchRef.current) {
      fetchCategories();
      initialFetchRef.current = true;
    }
  }, [fetchCategories]);

  // Mouse event handlers for draggable slider
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-600 dark:text-gray-300 mt-2"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No categories found
        </div>
      ) : (
        <div className="relative">
          <div
            className="flex overflow-x-auto pb-4 hide-scrollbar"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <motion.div
              className="flex space-x-4 px-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  className="flex-shrink-0 w-48 md:w-64 group"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="relative h-40 md:h-48 rounded-lg overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-4 text-white w-full">
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm opacity-80">
                            {category.productsCount} products
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicators */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden md:block">
            <button
              onClick={() => {
                if (sliderRef.current) {
                  sliderRef.current.scrollLeft -= 300;
                }
              }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-800 dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
            <button
              onClick={() => {
                if (sliderRef.current) {
                  sliderRef.current.scrollLeft += 300;
                }
              }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-800 dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
