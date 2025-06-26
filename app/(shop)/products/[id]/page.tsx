"use client";

import ReviewForm from "@/app/components/reviews/ReviewForm";
import ReviewList from "@/app/components/reviews/ReviewList";
import { useTheme } from "@/app/components/ThemeProvider";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  ShareIcon,
  ShoppingCartIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  PlusIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  sku?: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
  quantity: number;
  sold: number;
  featured: boolean;
  weight?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  color?: string[];
  size?: string[];
  createdAt: string;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
}

interface ReviewStats {
  reviewCount: number;
  averageRating: number;
}

interface RelatedProduct {
  _id: string;
  name: string;
  sku?: string;
  slug: string;
  price: number;
  discountPrice?: number;
  image: string;
  status: string;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const themeSettings = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    reviewCount: 0,
    averageRating: 0,
  });
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "specs"
  >("description");

  const fetchReviewStats = useCallback(async () => {
    if (!product?._id) return;

    try {
      const response = await fetch(`/api/reviews?productId=${product._id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setReviewStats({
          reviewCount: data.data.reviews.length || 0,
          averageRating:
            data.data.reviews.reduce(
              (acc: number, review: { rating: number }) => acc + review.rating,
              0
            ) / data.data.reviews.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  }, [product?._id]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch product by ID (much more efficient than slug lookup)
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (response.ok && data) {
        // Validate required product data
        if (!data._id || !data.name || !data.price) {
          throw new Error("Invalid product data received");
        }

        // Calculate additional fields
        const enrichedProduct = {
          ...data,
          finalPrice: data.discountPrice || data.price,
          hasDiscount: Boolean(data.discountPrice),
          discountPercentage: data.discountPrice
            ? Math.round(((data.price - data.discountPrice) / data.price) * 100)
            : 0,
          // Ensure category exists with defaults
          category: data.category || {
            _id: "",
            name: "Uncategorized",
            slug: "uncategorized",
          },
          // Ensure status exists
          status: data.status || "in stock",
          quantity: data.quantity || 0,
          sold: data.sold || 0,
          featured: data.featured || false,
        };

        setProduct(enrichedProduct);

        // Set default selections
        if (enrichedProduct.color && enrichedProduct.color.length > 0) {
          setSelectedColor(enrichedProduct.color[0]);
        }
        if (enrichedProduct.size && enrichedProduct.size.length > 0) {
          setSelectedSize(enrichedProduct.size[0]);
        }

        // Fetch related products only if category exists
        if (enrichedProduct.category && enrichedProduct.category._id) {
          fetchRelatedProducts(
            enrichedProduct.category._id,
            enrichedProduct._id
          );
        }
      } else {
        toast.error("Product not found");
        router.push("/categories");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      router.push("/categories");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  useEffect(() => {
    if (product?._id) {
      fetchReviewStats();
    }
  }, [product?._id, reviewRefreshTrigger, fetchReviewStats]);

  const fetchRelatedProducts = async (
    categoryId: string,
    currentProductId: string
  ) => {
    try {
      const response = await fetch(
        `/api/products?category=${categoryId}&limit=6`
      );
      const data = await response.json();

      if (data.success) {
        // Filter out current product and limit to 4
        const filtered = data.data.products
          .filter((p: RelatedProduct) => p._id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate selections
    if (product.color && product.color.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (product.size && product.size.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        }),
      });

      if (response.ok) {
        toast.success("Product added to cart!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const isProductInStock = (product: Product) => {
    return product.status === "in stock" || product.status === "low stock";
  };

  const getStockMessage = (product: Product) => {
    if (product.status === "out of stock") return "Out of Stock";
    if (product.status === "low stock") return `Only ${product.quantity} left!`;
    return `${product.quantity} in stock`;
  };

  const getStockColor = (product: Product) => {
    if (product.status === "out of stock") return "text-red-500";
    if (product.status === "low stock") return "text-yellow-500";
    return "text-green-500";
  };

  const renderStars = (rating: number, size = "w-5 h-5") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolidIcon className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon
                className={`${size} text-gray-300 dark:text-gray-600`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Get dynamic colors from theme settings
  const accentColor = themeSettings?.accentColor || "#00f5ff";
  const backgroundColor = themeSettings?.backgroundColor || "#0a0a0f";
  const accentRgb = hexToRgb(accentColor);
  const backgroundRgb = hexToRgb(backgroundColor);

  // Dynamic styles for theming
  const dynamicStyles = {
    accentButton: {
      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
      boxShadow: accentRgb
        ? `0 8px 32px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`
        : undefined,
    },
    accentText: { color: accentColor },
    accentBorder: { borderColor: accentColor },
    darkSection: {
      backgroundColor: backgroundColor,
      background: backgroundRgb
        ? `linear-gradient(135deg, ${backgroundColor}, rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.8))`
        : backgroundColor,
    },
    glowEffect: {
      boxShadow: accentRgb
        ? `0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.2)`
        : undefined,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: accentColor }}
          ></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product not found
          </h2>
          <button
            onClick={() => router.push("/categories")}
            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all"
            style={dynamicStyles.accentButton}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }
  console.log(reviewStats);
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <button
              onClick={() => router.push("/")}
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Home
            </button>
            <ChevronRightIcon className="w-4 h-4" />
            <button
              onClick={() => router.push("/categories")}
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Categories
            </button>
            <ChevronRightIcon className="w-4 h-4" />
            <button
              onClick={() =>
                router.push(`/categories/${product.category.slug}`)
              }
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              {product.category.name}
            </button>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <motion.img
                  key={selectedImageIndex}
                  src={allImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Zoom Icon */}
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                {/* Discount Badge */}
                {product.hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Title & Rating */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  {renderStars(reviewStats.averageRating)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({reviewStats.reviewCount} review
                    {reviewStats.reviewCount !== 1 ? "s" : ""})
                  </span>
                  <span
                    className={`text-sm font-medium ${getStockColor(product)}`}
                  >
                    {getStockMessage(product)}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl font-bold"
                  style={dynamicStyles.accentText}
                >
                  ${product.finalPrice.toFixed(2)}
                </span>
                {product.hasDiscount && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {product.color && product.color.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Color:{" "}
                    <span className="font-normal capitalize">
                      {selectedColor}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                          selectedColor === color
                            ? "text-white shadow-lg"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                        style={
                          selectedColor === color
                            ? {
                                ...dynamicStyles.accentBorder,
                                ...dynamicStyles.accentButton,
                              }
                            : undefined
                        }
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.size && product.size.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Size: <span className="font-normal">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all uppercase ${
                          selectedSize === size
                            ? "text-white shadow-lg"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                        style={
                          selectedSize === size
                            ? {
                                ...dynamicStyles.accentBorder,
                                ...dynamicStyles.accentButton,
                              }
                            : undefined
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Quantity
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-center min-w-[50px] font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.quantity, quantity + 1))
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Max: {product.quantity}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isProductInStock(product) || addingToCart}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      isProductInStock(product) && !addingToCart
                        ? `text-white hover:scale-105 shadow-lg`
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    style={
                      isProductInStock(product) && !addingToCart
                        ? dynamicStyles.accentButton
                        : undefined
                    }
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-5 h-5" />
                        {isProductInStock(product)
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`px-6 py-3 border-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? "text-white shadow-lg"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                    style={
                      isWishlisted
                        ? {
                            ...dynamicStyles.accentBorder,
                            ...dynamicStyles.accentButton,
                          }
                        : undefined
                    }
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    Wishlist
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                    style={{
                      ...dynamicStyles.glowEffect,
                    }}
                    onMouseEnter={(e) => {
                      if (accentRgb) {
                        e.currentTarget.style.borderColor = accentColor;
                        e.currentTarget.style.color = accentColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.color = "";
                    }}
                  >
                    <ShareIcon className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Key Features
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    High-quality materials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    Fast shipping available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    30-day return policy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    Customer support included
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
              {[
                { id: "description", label: "Description" },
                {
                  id: "reviews",
                  label: `Reviews (${reviewStats.reviewCount})`,
                },
                { id: "specs", label: "Specifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? ""
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  style={
                    activeTab === tab.id
                      ? {
                          borderBottomColor: accentColor,
                          color: accentColor,
                        }
                      : undefined
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "description" && (
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Add Review Button */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
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
                        Write a Review
                      </button>
                    </div>

                    {/* Reviews List */}
                    <ReviewList
                      productId={product._id}
                      refreshTrigger={reviewRefreshTrigger}
                    />
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Product Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            SKU:
                          </span>
                          <span className="text-gray-900 dark:text-white font-mono">
                            {product.sku ||
                              `PRD-${product._id.slice(-8).toUpperCase()}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Category:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </div>
                        {product.color && product.color.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Available Colors:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {product.color.join(", ")}
                            </span>
                          </div>
                        )}
                        {product.size && product.size.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Available Sizes:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {product.size.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Additional Info
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Weight:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {product.weight || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Dimensions:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {product.dimensions || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Material:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {product.material || "Standard"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Warranty:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {product.warranty || "1 Year"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold mb-8 text-center"
                style={dynamicStyles.accentText}
              >
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct._id}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: accentRgb
                        ? `0 10px 40px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.2)`
                        : undefined,
                    }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group cursor-pointer transition-all duration-300"
                    onClick={() =>
                      router.push(
                        `/products/${relatedProduct.sku || relatedProduct._id}`
                      )
                    }
                  >
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold"
                            style={dynamicStyles.accentText}
                          >
                            ${relatedProduct.finalPrice.toFixed(2)}
                          </span>
                          {relatedProduct.hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              ${relatedProduct.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {relatedProduct.hasDiscount && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            -{relatedProduct.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex === 0
                          ? allImages.length - 1
                          : selectedImageIndex - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex === allImages.length - 1
                          ? 0
                          : selectedImageIndex + 1
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      {showReviewForm && product && (
        <ReviewForm
          productId={product._id}
          productName={product.name}
          onReviewSubmitted={() => {
            setReviewRefreshTrigger((prev) => prev + 1);
          }}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </>
  );
}
