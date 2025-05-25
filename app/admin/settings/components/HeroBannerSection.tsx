"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadFileToCloudinary } from "../../../utils/clientFileUpload";

interface HeroBanner {
  _id?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageId?: string;
  active: boolean;
}

interface HeroBannerSectionProps {
  banners: HeroBanner[];
  onChange: (banners: HeroBanner[]) => void;
}

export default function HeroBannerSection({
  banners,
  onChange,
}: HeroBannerSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [expandedBanner, setExpandedBanner] = useState<number | null>(null);

  const handleAddBanner = () => {
    const newBanner: HeroBanner = {
      title: "New Banner",
      subtitle: "Banner subtitle",
      buttonText: "Shop Now",
      buttonLink: "/products",
      image: "",
      active: true,
    };
    onChange([...banners, newBanner]);
    setExpandedBanner(banners.length);
  };

  const handleRemoveBanner = (index: number) => {
    const updatedBanners = [...banners];
    updatedBanners.splice(index, 1);
    onChange(updatedBanners);
    setExpandedBanner(null);
  };

  const handleBannerChange = (index: number, field: keyof HeroBanner, value: any) => {
    const updatedBanners = [...banners];
    updatedBanners[index] = {
      ...updatedBanners[index],
      [field]: value,
    };
    onChange(updatedBanners);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setIsUploading(true);
      const result = await uploadFileToCloudinary(file, "banners");
      if (result && result.url) {
        handleBannerChange(index, "image", result.url);
        handleBannerChange(index, "imageId", result.publicId);
      }
    } catch (error) {
      console.error("Error uploading banner image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleBannerExpansion = (index: number) => {
    setExpandedBanner(expandedBanner === index ? null : index);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Hero Banners
        </h3>
        <button
          type="button"
          onClick={handleAddBanner}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Banner
        </button>
      </div>

      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No banners added yet. Click "Add Banner" to create one.
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 cursor-pointer"
                onClick={() => toggleBannerExpansion(index)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 mr-2 ${
                      banner.active
                        ? "bg-green-500"
                        : "bg-red-500"
                    } rounded-full`}
                  ></div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {banner.title || "Untitled Banner"}
                  </h4>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerChange(index, "active", !banner.active);
                    }}
                    className="text-xs mr-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {banner.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBanner(index);
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30"
                  >
                    Remove
                  </button>
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${
                      expandedBanner === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expandedBanner === index && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) =>
                            handleBannerChange(index, "title", e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={banner.subtitle}
                          onChange={(e) =>
                            handleBannerChange(index, "subtitle", e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={banner.buttonText}
                          onChange={(e) =>
                            handleBannerChange(
                              index,
                              "buttonText",
                              e.target.value
                            )
                          }
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={banner.buttonLink}
                          onChange={(e) =>
                            handleBannerChange(
                              index,
                              "buttonLink",
                              e.target.value
                            )
                          }
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Banner Image
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                        {banner.image ? (
                          <div className="relative w-full h-48">
                            <Image
                              src={banner.image}
                              alt={banner.title}
                              fill
                              className="object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleBannerChange(index, "image", "");
                                handleBannerChange(index, "imageId", "");
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                              <label
                                htmlFor={`banner-image-${index}`}
                                className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload an image</span>
                                <input
                                  id={`banner-image-${index}`}
                                  name={`banner-image-${index}`}
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(index, file);
                                    }
                                  }}
                                  disabled={isUploading}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 10MB
                            </p>
                            {isUploading && (
                              <div className="mt-2 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                  Uploading...
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
