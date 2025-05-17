"use client";

import CategoryForm from "@/app/admin/components/CategoryForm/CategoryForm";
import { AppDispatch, RootState } from "@/app/store";
import {createCategory, fetchCategories } from "@/app/store/slices/categorySlice";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Category } from "@/app/types/categoryTypes";

export default function AddCategoryPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isSubmitting, error } = useSelector(
    (state: RootState) => state.categories
  );

  // Fetch all categories to populate parent dropdown
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = (formData: Partial<Category>) => {
    dispatch(createCategory(formData))
      .unwrap()
      .then(() => {
        // Navigate back to categories list on successful creation
        router.push('/admin/categories');
      });
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Add New Category
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

        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Category Information
        </h2>

        <CategoryForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Create Category"
          parentCategories={categories}
        />
      </motion.div>
    </div>
  );
}
