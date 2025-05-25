"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroBannerSection from "./HeroBannerSection";
import CategorySliderSection from "./CategorySliderSection";
import ProductSliderSection from "./ProductSliderSection";
import ColorSettings from "./ColorSettings";
import { HomepageSettingsValue } from "../../../api/models/Settings";

interface HomepageSettingsFormProps {
  settings: HomepageSettingsValue;
  onSave: (settings: HomepageSettingsValue) => void;
  isSaving: boolean;
}

export default function HomepageSettingsForm({
  settings,
  onSave,
  isSaving,
}: HomepageSettingsFormProps) {
  const [formData, setFormData] = useState({
    heroBanners: settings.heroBanners || [],
    categorySliders: settings.categorySliders || [],
    productSliders: settings.productSliders || [],
    showFeaturedCategories: settings.showFeaturedCategories !== false,
    showNewArrivals: settings.showNewArrivals !== false,
    showBestsellers: settings.showBestsellers !== false,
    backgroundColor: settings.backgroundColor || "#ffffff",
    accentColor: settings.accentColor || "#3b82f6",
    animation3dEnabled: settings.animation3dEnabled !== false,
  });

  useEffect(() => {
    setFormData({
      heroBanners: settings.heroBanners || [],
      categorySliders: settings.categorySliders || [],
      productSliders: settings.productSliders || [],
      showFeaturedCategories: settings.showFeaturedCategories !== false,
      showNewArrivals: settings.showNewArrivals !== false,
      showBestsellers: settings.showBestsellers !== false,
      backgroundColor: settings.backgroundColor || "#ffffff",
      accentColor: settings.accentColor || "#3b82f6",
      animation3dEnabled: settings.animation3dEnabled !== false,
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggleChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  const updateHeroBanners = (heroBanners: any[]) => {
    setFormData((prev) => ({
      ...prev,
      heroBanners,
    }));
  };

  const updateCategorySliders = (categorySliders: any[]) => {
    setFormData((prev) => ({
      ...prev,
      categorySliders,
    }));
  };

  const updateProductSliders = (productSliders: any[]) => {
    setFormData((prev) => ({
      ...prev,
      productSliders,
    }));
  };

  const updateColors = (colors: { backgroundColor: string; accentColor: string }) => {
    setFormData((prev) => ({
      ...prev,
      backgroundColor: colors.backgroundColor,
      accentColor: colors.accentColor,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Homepage Settings
        </h2>

        {/* General Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            General Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable 3D Animations
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="animation3dEnabled"
                  id="animation3dEnabled"
                  checked={formData.animation3dEnabled}
                  onChange={() => handleToggleChange("animation3dEnabled")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="animation3dEnabled"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    formData.animation3dEnabled ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Featured Categories
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="showFeaturedCategories"
                  id="showFeaturedCategories"
                  checked={formData.showFeaturedCategories}
                  onChange={() => handleToggleChange("showFeaturedCategories")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showFeaturedCategories"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    formData.showFeaturedCategories ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show New Arrivals
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="showNewArrivals"
                  id="showNewArrivals"
                  checked={formData.showNewArrivals}
                  onChange={() => handleToggleChange("showNewArrivals")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showNewArrivals"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    formData.showNewArrivals ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Bestsellers
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="showBestsellers"
                  id="showBestsellers"
                  checked={formData.showBestsellers}
                  onChange={() => handleToggleChange("showBestsellers")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showBestsellers"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    formData.showBestsellers ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <ColorSettings
          backgroundColor={formData.backgroundColor}
          accentColor={formData.accentColor}
          onChange={updateColors}
        />

        {/* Hero Banners */}
        <HeroBannerSection
          banners={formData.heroBanners}
          onChange={updateHeroBanners}
        />

        {/* Category Sliders */}
        <CategorySliderSection
          sliders={formData.categorySliders}
          onChange={updateCategorySliders}
        />

        {/* Product Sliders */}
        <ProductSliderSection
          sliders={formData.productSliders}
          onChange={updateProductSliders}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
