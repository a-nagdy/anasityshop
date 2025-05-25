"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  status: string;
}

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  type: "featured" | "bestseller" | "new" | "sale" | "custom";
  productIds?: string[];
}

export default function ProductSlider({
  title,
  subtitle,
  type,
  productIds = [],
}: ProductSliderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Create a stable URL string that only changes when dependencies change
  const apiUrl = useMemo(() => {
    const url = "/api/products";
    const params = new URLSearchParams();

    if (type === "custom" && productIds && productIds.length > 0) {
      params.append("productIds", productIds.join(","));
    } else if (type === "featured") {
      params.append("featured", "true");
    } else if (type === "bestseller") {
      params.append("bestseller", "true");
    } else if (type === "new") {
      params.append("new", "true");
    } else if (type === "sale") {
      params.append("sale", "true");
    }

    params.append("limit", "12"); // Limit the number of products

    return `${url}?${params.toString()}`;
  }, [type, productIds]);

  const fetchProducts = useCallback(async () => {
    // Skip fetching if we've already loaded data for this URL
    if (!isLoading && products.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const controller = new AbortController();
      const signal = controller.signal;

      const response = await fetch(apiUrl, {
        cache: "force-cache",
        next: { revalidate: 3600 },
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      // Check if products exist in the response
      if (!data.products || !Array.isArray(data.products)) {
        setProducts([]);
        return;
      }

      // Filter out products with no images
      const validProducts = data.products.filter(
        (product: Product) => product.images && product.images.length > 0
      );

      console.log(validProducts);

      setProducts(validProducts);

      return () => controller.abort();
    } catch (err) {
      // Ignore abort errors as they're expected when component unmounts
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, products.length, isLoading]);

  // Use a ref to track if we've already made the initial API call
  const initialFetchRef = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't already or if dependencies changed
    if (!initialFetchRef.current) {
      fetchProducts();
      initialFetchRef.current = true;
    }
  }, [fetchProducts]);

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

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Animation variants
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
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No products found</div>
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
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className="flex-shrink-0 w-48 md:w-64 group"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-48 md:h-64 overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Product badges */}
                        {product.status === "out of stock" && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Sold Out
                          </div>
                        )}

                        {product.status === "low stock" && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Low Stock
                          </div>
                        )}

                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Sale
                            </div>
                          )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                          {product.name}
                        </h3>

                        <div className="flex items-end">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </span>

                          {product.comparePrice &&
                            product.comparePrice > product.price && (
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
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
