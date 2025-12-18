"use client";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { AddToCartButton, ThemeButton } from "../ui";

interface Product {
  _id: string;
  name: string;
  sku?: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  image: string;
  status: string;
  quantity: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
  imageHeight?: string;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({
  product,
  showAddToCart = true,
  showWishlist = true,
  className = "",
  imageHeight = "aspect-square",
  onProductClick,
}: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isInStock =
    product.status === "in stock" || product.status === "low stock";
  const isOutOfStock = product.status === "out of stock";

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      router.push(`/products/${product.sku || product._id}`);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    // TODO: Implement actual wishlist API calls
  };

  // const getStatusBadge = () => {
  //   if (isOutOfStock) {
  //     return (
  //       <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
  //         Out of Stock
  //       </span>
  //     );
  //   }

  //   if (product.status === "low stock") {
  //     return (
  //       <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
  //         Low Stock
  //       </span>
  //     );
  //   }

  //   if (product.hasDiscount) {
  //     return (
  //       <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
  //         -{product.discountPercentage}%
  //       </span>
  //     );
  //   }

  //   return null;
  // };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {/* Image Container */}
      <div
        className={`relative ${imageHeight} overflow-hidden`}
        onClick={handleCardClick}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status Badge */}
        {/* {getStatusBadge()} */}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600 dark:text-primary" />
            )}
          </button>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ThemeButton
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Quick View
          </ThemeButton>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div onClick={handleCardClick} className="cursor-pointer">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem] capitalize">
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {product.category.name}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ${product.finalPrice.toFixed(2)}
            </span>
            {product.hasDiscount && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-3">
            {isOutOfStock ? (
              <span className="text-sm text-red-500 font-medium">
                Out of Stock
              </span>
            ) : product.status === "low stock" ? (
              <span className="text-sm text-yellow-500 font-medium">
                Only {product.quantity} left!
              </span>
            ) : (
              <span className="text-sm text-green-500 font-medium">
                {product.quantity} in stock
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <AddToCartButton
            productId={product._id}
            inStock={isInStock}
            variant="primary"
            size="sm"
            fullWidth
          />
        )}
      </div>
    </motion.div>
  );
}
