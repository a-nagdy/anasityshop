"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  title?: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  helpful: number;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchReviews = useCallback(
    async (page = 1, status = filter) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(status !== "all" && { status }),
        });

        const response = await fetch(`/api/reviews?${params}`);

        if (response.ok) {
          const data = await response.json();
          setReviews(data.data.reviews);
          setPagination(data.data.pagination);
        } else {
          toast.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Error loading reviews");
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchReviews(1, filter);
  }, [filter, fetchReviews]);

  const handleStatusUpdate = async (
    reviewId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      setUpdating(reviewId);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Review ${newStatus} successfully`);
        fetchReviews(pagination.currentPage, filter);
      } else {
        const data = await response.json();
        toast.error(data.message || `Failed to ${newStatus} review`);
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    } finally {
      setUpdating(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Moderate customer reviews and manage approval status
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {pagination.total} reviews
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: "pending", name: "Pending", icon: "⏳" },
              { id: "approved", name: "Approved", icon: "✅" },
              { id: "rejected", name: "Rejected", icon: "❌" },
              { id: "all", name: "All Reviews", icon: "📝" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  filter === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "pending"
                ? "No pending reviews to moderate"
                : filter === "approved"
                ? "No approved reviews yet"
                : filter === "rejected"
                ? "No rejected reviews"
                : "No reviews in the system yet"}
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Review Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.firstName[0]}
                      {review.user.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.user.firstName} {review.user.lastName}
                        </h3>
                        {review.verified && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {review.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status.charAt(0).toUpperCase() +
                        review.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Review Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Product
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.product.name}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          SKU: {review.product.sku}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Rating
                      </h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {review.title && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Review Title
                        </h4>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.title}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Review Comment
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {review.helpful > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Helpful Votes
                        </h4>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {review.helpful} people found this helpful
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Actions */}
                  <div className="space-y-4">
                    {review.status === "pending" && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                          Review Actions
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(review._id, "approved")
                            }
                            disabled={updating === review._id}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            {updating === review._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>✅ Approve Review</>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(review._id, "rejected")
                            }
                            disabled={updating === review._id}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            {updating === review._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>❌ Reject Review</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review History */}
                    {review.status !== "pending" && review.reviewedBy && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Review History
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">
                              {review.status.charAt(0).toUpperCase() +
                                review.status.slice(1)}
                            </span>{" "}
                            by{" "}
                            <span className="font-medium">
                              {review.reviewedBy.firstName}{" "}
                              {review.reviewedBy.lastName}
                            </span>
                          </p>
                          {review.reviewedAt && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(review.reviewedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            window.open(
                              `/products/${review.product.sku}`,
                              "_blank"
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          🔗 View Product
                        </button>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(review.user.email)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          📧 Copy Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchReviews(pagination.currentPage - 1, filter)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => fetchReviews(page, filter)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    page === pagination.currentPage
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => fetchReviews(pagination.currentPage + 1, filter)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
