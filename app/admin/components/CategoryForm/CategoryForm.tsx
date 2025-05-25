"use client";

import ImageUploader from "@/app/components/ImageUploader";
import { Category, CategoryFormProps } from "@/app/types/categoryTypes";
import { ChangeEvent, FormEvent, useState } from "react";

export default function CategoryForm({
  initialData = {},
  onSubmit,
  isSubmitting,
  submitButtonText,
  parentCategories = [],
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: initialData.name || "",
    description: initialData.description || "",
    image: initialData.image || "",
    parent: initialData.parent || null,
    active: initialData.active !== undefined ? initialData.active : true,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "parent" && value === "") {
      setFormData((prev) => ({ ...prev, parent: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Parent Category
          </label>
          <select
            name="parent"
            value={formData.parent || ""}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
          >
            <option value="">None (Root Category)</option>
            {parentCategories
              .filter((cat) => cat._id !== initialData._id) // Can't be its own parent
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional. Select a parent category if this is a subcategory.
          </p>
        </div>

        {/* Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Image
          </label>
          <ImageUploader
            label=""
            imageUrl={formData.image || ""}
            onImageChange={handleImageChange}
            previewSize="medium"
            placeholder="Enter image URL"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional. Add an image for this category.
          </p>
        </div>

        {/* Active Status */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="active"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Inactive categories won&apos;t be shown to customers.
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={4}
          className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
        ></textarea>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Optional. Provide a description for this category.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}
