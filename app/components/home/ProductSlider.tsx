"use client";

import PlaceholderImage from "@/assets/svg/elyana-placeholder.svg";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton } from "../ui";
interface Product {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string | { _id: string; name: string; slug: string };
  description?: string;
  featured?: boolean;
  quantity?: number;
  status: string;
}

interface ProductSliderProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  type?: "featured" | "bestseller" | "new" | "sale";
}

interface HomepageSettings {
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "0, 245, 255";
};

export default function ProductSlider({
  products,
  title = "Featured Products",
  subtitle = "Discover our top picks",
  type = "featured",
}: ProductSliderProps) {
  // Debug: console.log(products);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [homepageSettings, setHomepageSettings] =
    useState<HomepageSettings | null>(null);
  // Removed addingToCart state - now handled by AddToCartButton component

  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const response = await fetch("/api/settings/homepage");
        if (response.ok) {
          const data = await response.json();
          setHomepageSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching homepage settings:", error);
      }
    };

    fetchHomepageSettings();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Helper function to check if product is in stock
  const isProductInStock = (product: Product) => {
    return product.status === "in stock" || product.status === "low stock";
  };

  // Removed handleAddToCart function - now handled by AddToCartButton component

  const accentColor = homepageSettings?.accentColor || "#00f5ff";
  const accentRgb = hexToRgb(accentColor);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, rotateY: -15 },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${accentColor}, #8b5cf6)`,
            }}
          >
            {title}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>

          {/* Type Badge */}
          {type && (
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-block mt-4"
            >
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  type === "sale"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : type === "new"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : type === "bestseller"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "text-white border-white/30"
                }`}
                style={
                  type === "featured"
                    ? {
                        backgroundColor: `rgba(${accentRgb}, 0.2)`,
                        color: accentColor,
                        borderColor: `rgba(${accentRgb}, 0.3)`,
                      }
                    : {}
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr"
        >
          {products.slice(0, 8).map((product, index) => {
            const inStock = isProductInStock(product);

            return (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50,
                  transition: { duration: 0.3 },
                }}
                className="group relative h-full"
              >
                <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                  {/* Product Image */}
                  <Link href={`/products/${product.sku || product._id}`}>
                    <div className="relative h-64 flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.image || PlaceholderImage}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-700 ${
                          inStock
                            ? "group-hover:scale-110"
                            : "grayscale group-hover:scale-105"
                        }`}
                      />

                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Stock Status */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            inStock
                              ? product.status === "low stock"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {product.status === "in stock"
                            ? "In Stock"
                            : product.status === "low stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </div>

                      {/* Sale Badge */}
                      {product.salePrice &&
                        product.salePrice < product.price && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold animate-pulse">
                              SALE
                            </span>
                          </div>
                        )}

                      {/* Out of Stock Overlay */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg bg-red-500/90 px-4 py-2 rounded-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Hover Glow */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to top, rgba(${accentRgb}, 0.2), transparent)`,
                        }}
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Category */}
                    <p className="text-sm text-gray-400 mb-2 flex-shrink-0">
                      {typeof product.category === "string"
                        ? product.category
                        : product.category?.name || "Category"}
                    </p>

                    {/* Product Name */}
                    <Link href={`/products/${product.sku || product._id}`}>
                      <h3
                        className="text-xl font-bold text-white mb-3 transition-colors duration-300 line-clamp-2 cursor-pointer min-h-[3.5rem] flex-shrink-0"
                        style={{
                          color: "white",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = accentColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "white";
                        }}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <div className="flex-grow mb-4">
                      {product.description ? (
                        <p className="text-gray-300 text-sm line-clamp-3 min-h-[4.5rem]">
                          {product.description}
                        </p>
                      ) : (
                        <div className="min-h-[4.5rem]"></div>
                      )}
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between mt-auto flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {product.salePrice &&
                        product.salePrice < product.price ? (
                          <>
                            <span className="text-2xl font-bold text-green-400">
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <AddToCartButton
                          productId={product._id}
                          inStock={inStock}
                          variant="primary"
                          size="sm"
                          className="w-12 h-12 rounded-full !p-0"
                          iconOnly
                          customIcon={
                            inStock ? (
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
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            ) : (
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
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Stock Info */}
                    {inStock &&
                      product.quantity !== undefined &&
                      product.quantity <= 5 && (
                        <div className="mt-3 text-center flex-shrink-0">
                          <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                            Only {product.quantity} left in stock!
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Glowing Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        `0 0 0 1px rgba(${accentRgb}, 0)`,
                        `0 0 20px 1px rgba(${accentRgb}, 0.2)`,
                        `0 0 0 1px rgba(${accentRgb}, 0)`,
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />

                  {/* Corner Accents */}
                  <div
                    className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `rgba(${accentRgb}, 0.5)` }}
                  />
                  <div
                    className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: "#8b5cf6" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-xl border transition-all duration-300 backdrop-blur-sm hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(${accentRgb}, 0.2), rgba(139, 92, 246, 0.2))`,
              borderColor: `rgba(${accentRgb}, 0.3)`,
              boxShadow: `0 4px 15px rgba(${accentRgb}, 0.2)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, rgba(${accentRgb}, 0.4), rgba(139, 92, 246, 0.4))`;
              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, rgba(${accentRgb}, 0.2), rgba(139, 92, 246, 0.2))`;
              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.3)`;
            }}
          >
            View All Products
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="transition-colors"
              style={{ color: accentColor }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
