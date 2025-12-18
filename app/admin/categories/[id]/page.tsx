"use client";

import CategoryForm from "@/app/admin/components/CategoryForm/CategoryForm";
import { AppDispatch, RootState } from "@/app/store";
import {
  fetchCategories,
  fetchCategoryById,
  updateCategory,
} from "@/app/store/slices/categorySlice";
import { Category } from "@/app/types/categoryTypes";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const { categories, currentCategory, isLoading, isSubmitting, error } =
    useSelector((state: RootState) => state.categories);

  // Fetch the category and all categories (for parent dropdown)
  useEffect(() => {
    dispatch(fetchCategoryById(id));
    dispatch(fetchCategories());
  }, [dispatch, id]);

  const handleSubmit = (formData: Partial<Category>) => {
    dispatch(updateCategory({ id, data: formData }))
      .unwrap()
      .then(() => {
        // Navigate back to categories list on successful update
        router.push("/admin/categories");
      });
  };

  if (isLoading || !currentCategory) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Edit Category: {currentCategory?.name}
        </h1>
        <Link
          href="/admin/categories"
          className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Categories
        </Link>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          {/* Slug (read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
              Slug
            </label>
            <div className="p-2.5 bg-gray-100 dark:bg-gray-600 rounded-md">
              <span className="text-sm text-gray-600 dark:text-primary">
                {currentCategory?.slug}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Auto-generated from name)
              </span>
            </div>
          </div>

          {/* Product Count (read-only info) - only if products field exists */}
          {currentCategory?.products !== undefined && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-primary mb-1">
                Associated Products
              </label>
              <div className="p-2.5 bg-gray-100 dark:bg-gray-600 rounded-md">
                <span className="text-sm text-gray-600 dark:text-primary">
                  {currentCategory.products} product
                  {currentCategory.products !== 1 && "s"}
                </span>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Category Information
        </h2>

        <CategoryForm
          initialData={currentCategory}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
          parentCategories={categories.filter((cat) => cat._id !== id)} // Exclude current category from parents
        />
      </motion.div>
    </div>
  );
}
