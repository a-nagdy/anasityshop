"use client";

import ImageUploader from "@/app/components/ImageUploader";
import MultiImageUploader from "@/app/components/MultiImageUploader";
import axios from "axios";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Category = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  quantity: number;
  status: "in stock" | "out of stock" | "low stock" | "draft";
  color: string[];
  size: string[];
  featured: boolean;
  shipping: boolean;
  active: boolean;
  image: string;
  images: string[];
  slug: string;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formError, setFormError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const token = getCookie("auth_token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    color: "",
    size: "",
    featured: false,
    shipping: true,
    active: true,
    image: "",
    images: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch product data
        const productResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}api/products/${id}`
        );
        const productData = productResponse.data;
        setProduct(productData);

        // Fetch categories
        const categoriesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}api/categories`
        );
        setCategories(categoriesResponse.data);

        // Populate form data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          category: productData.category?._id || "",
          quantity: productData.quantity?.toString() || "",
          color: productData.color?.join(", ") || "",
          size: productData.size?.join(", ") || "",
          featured: productData.featured || false,
          shipping: productData.shipping !== false,
          active: productData.active !== false,
          image: productData.image || "",
          images: productData.images || [],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setFormError("Failed to load product data");
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle main image change
  const handleMainImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  // Handle additional images change
  const handleAdditionalImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  // Simulate file upload (in a real app, you'd upload to a server/cloud)
  const handleFileUpload = (file: File) => {
    // In a real implementation, upload the file to your server/cloud storage
    console.log("File to upload:", file.name);

    // For simulation purposes only
    setTimeout(() => {
      toast.success(`File "${file.name}" uploaded successfully`);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");

    try {
      // Format the data for the API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        color: formData.color
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        size: formData.size
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      // Make API call to update product
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}api/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product updated successfully!");

      // Redirect to products page on success
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      setFormError("Failed to update product. Please try again.");
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
          Edit Product: {product?.name}
        </h1>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Product Images
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Product Image */}
              <div>
                <ImageUploader
                  label="Main Product Image"
                  imageUrl={formData.image}
                  onImageChange={handleMainImageChange}
                  onFileUpload={handleFileUpload}
                  previewSize="large"
                  placeholder="Enter main image URL"
                />
              </div>

              {/* Additional Images */}
              <div>
                <MultiImageUploader
                  label="Additional Images"
                  images={formData.images}
                  onImagesChange={handleAdditionalImagesChange}
                  onFileUpload={handleFileUpload}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Product Information */}
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Product Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name*
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

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity*
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Colors (comma separated)
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Red, Blue, Green"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="S, M, L, XL"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Status (read-only, determined by backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="p-2.5 bg-gray-100 dark:bg-gray-600 rounded-md">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      product?.status === "in stock"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : product?.status === "out of stock"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : product?.status === "low stock"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                    }
                  `}
                >
                  {product?.status || "Unknown"}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (Auto-determined based on quantity and active state)
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
            ></textarea>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Featured Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="shipping"
                name="shipping"
                checked={formData.shipping}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="shipping"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Shipping Available
              </label>
            </div>

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
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
