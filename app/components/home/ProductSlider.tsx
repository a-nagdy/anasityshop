"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  status: string;
}

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products?: Product[];
}

export default function ProductSlider({
  title,
  subtitle,
  products = [],
}: ProductSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Transform products to add placeholder image if none exists
  const validProducts = products.map((product) => ({
    ...product,
    images:
      product.images && product.images.length > 0
        ? product.images
        : ["https://placehold.co/600x400/png"],
  }));

  if (validProducts.length === 0) {
    return null;
  }

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
            {validProducts.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                className="flex-shrink-0 w-48 md:w-64 group"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.status === "low stock" && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400">
                          Low Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
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
    </div>
  );
}
