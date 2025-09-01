"use client";

import ImageUploader from "@/app/components/ImageUploader";
import MultiImageUploader from "@/app/components/MultiImageUploader";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CategoryService } from "../../../services/categoryService";
import { ProductService } from "../../../services/productService";
import { ProductResponse } from "../../../types/api";

type Category = {
  _id: string;
  name: string;
};

type Product = ProductResponse;

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

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    color: "",
    size: "",
    weight: "",
    dimensions: "",
    material: "",
    warranty: "",
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
        // Fetch product and categories data using services
        const [productData, categoriesData] = await Promise.all([
          ProductService.getProduct(id),
          CategoryService.getActiveCategories(),
        ]);

        setProduct(productData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Populate form data - handle both string and array formats for color/size
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          category: productData.category?._id || "",
          quantity: productData.quantity?.toString() || "",
          color: Array.isArray(productData.color)
            ? productData.color.join(", ")
            : productData.color || "",
          size: Array.isArray(productData.size)
            ? productData.size.join(", ")
            : productData.size || "",
          weight: productData.weight || "",
          dimensions: productData.dimensions || "",
          material: productData.material || "",
          warranty: productData.warranty || "",
          featured: productData.featured || false,
          shipping: true, // ProductResponse doesn't have shipping, default to true
          active: productData.active !== false,
          image: productData.image || "",
          images: productData.images || [],
          sku: productData.sku || "",
        });

        console.log("Product data:", productData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load product data";
        setFormError(errorMessage);
        toast.error(`Product Error: ${errorMessage}`);
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
      if (name === "name") {
        // Auto-generate SKU when name changes
        const generatedSKU = autoGenerateSKU(value);
        setFormData((prev) => ({ ...prev, [name]: value, sku: generatedSKU }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  // Handle additional images change
  const handleAdditionalImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  // Simulate file upload (in a real app, you'd upload to a server/cloud)
  const handleFileUpload = (file: File) => {
    // In a real implementation, upload the file to your server/cloud storage
    // console.log("File to upload:", file.name);

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
      // Format the data for the API using proper types
      const updateData = {
        id, // Required by UpdateProductRequest type
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        sku: formData.sku,
        image: formData.image, // Include the main image
        images: Array.isArray(formData.images) ? formData.images : [],
        color:
          typeof formData.color === "string"
            ? formData.color
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .join(", ")
            : "",
        size:
          typeof formData.size === "string"
            ? formData.size
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .join(", ")
            : "",
        weight: formData.weight,
        dimensions: formData.dimensions,
        material: formData.material,
        warranty: formData.warranty,
        featured: formData.featured,
        active: formData.active,
      };

      // Use ProductService for the update instead of direct axios
      await ProductService.updateProduct(id, updateData);

      toast.success("Product updated successfully!");

      // Redirect to products page on success
      router.push("/admin/products");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update product. Please try again.";

      setFormError(errorMessage);
      toast.error(`Update Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const autoGenerateSKU = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters except spaces
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Main Product Image
                </label>
                <div>
                  <ImageUploader
                    onUpload={(url) => {
                      setFormData((prev) => ({
                        ...prev,
                        image: url,
                        images: prev.images || [],
                      }));
                    }}
                    folder="products"
                    maxSize={5}
                    imageUrl={formData.image}
                  />
                </div>
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

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SKU (Auto-generated)*
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
                placeholder="Auto-generated from product name"
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

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 1.5kg"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 10cm x 20cm x 5cm"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g., Plastic, Metal"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g., 2 years"
                className="block w-full rounded-md border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5"
              />
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
