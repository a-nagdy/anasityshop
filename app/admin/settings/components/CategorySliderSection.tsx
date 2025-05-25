"use client";

import { Category } from "@/app/types/categoryTypes";
import { useEffect, useState } from "react";

interface CategorySlider {
  _id?: string;
  title: string;
  subtitle?: string;
  categories: string[];
  active: boolean;
}

interface CategorySliderSectionProps {
  sliders: CategorySlider[];
  onChange: (sliders: CategorySlider[]) => void;
}

export default function CategorySliderSection({
  sliders,
  onChange,
}: CategorySliderSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSlider, setExpandedSlider] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlider = () => {
    const newSlider: CategorySlider = {
      title: "Featured Categories",
      subtitle: "Explore our collection",
      categories: [],
      active: true,
    };
    onChange([...sliders, newSlider]);
    setExpandedSlider(sliders.length);
  };

  const handleRemoveSlider = (index: number) => {
    const updatedSliders = [...sliders];
    updatedSliders.splice(index, 1);
    onChange(updatedSliders);
    setExpandedSlider(null);
  };

  const handleSliderChange = (
    index: number,
    field: keyof CategorySlider,
    value: string | boolean | string[]
  ) => {
    const updatedSliders = [...sliders];
    updatedSliders[index] = {
      ...updatedSliders[index],
      [field]: value,
    };
    onChange(updatedSliders);
  };

  const toggleSliderExpansion = (index: number) => {
    setExpandedSlider(expandedSlider === index ? null : index);
  };

  const handleCategoryToggle = (sliderIndex: number, categoryId: string) => {
    const slider = sliders[sliderIndex];
    const updatedCategories = slider.categories.includes(categoryId)
      ? slider.categories.filter((id) => id !== categoryId)
      : [...slider.categories, categoryId];

    handleSliderChange(sliderIndex, "categories", updatedCategories);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Category Sliders
        </h3>
        <button
          type="button"
          onClick={handleAddSlider}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Category Slider
        </button>
      </div>

      <div className="space-y-4">
        {sliders.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No category sliders added yet. Click &quot;Add Category
            Sliders&quot; to create one.
          </div>
        ) : (
          sliders.map((slider, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 cursor-pointer"
                onClick={() => toggleSliderExpansion(index)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 mr-2 ${
                      slider.active ? "bg-green-500" : "bg-red-500"
                    } rounded-full`}
                  ></div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {slider.title || "Untitled Slider"}
                  </h4>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSliderChange(index, "active", !slider.active);
                    }}
                    className="text-xs mr-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {slider.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSlider(index);
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30"
                  >
                    Remove
                  </button>
                  <svg
                    className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${
                      expandedSlider === index ? "transform rotate-180" : ""
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

              {expandedSlider === index && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={slider.title}
                        onChange={(e) =>
                          handleSliderChange(index, "title", e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={slider.subtitle || ""}
                        onChange={(e) =>
                          handleSliderChange(index, "subtitle", e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Categories
                      </label>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            Loading categories...
                          </span>
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                          No categories found.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {categories.map((category) => (
                            <div
                              key={category._id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`category-${index}-${category._id}`}
                                checked={slider.categories.includes(
                                  category._id
                                )}
                                onChange={() =>
                                  handleCategoryToggle(index, category._id)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`category-${index}-${category._id}`}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
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
