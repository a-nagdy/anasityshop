import { Suspense } from "react";
import connectToDatabase from "../utils/db";
import Settings from "./api/models/Settings";
import BackgroundWrapper from "./components/home/BackgroundWrapper";
import CategorySlider from "./components/home/CategorySlider";
import HeroSection from "./components/home/HeroSection";
import ProductSlider from "./components/home/ProductSlider";

// Import types
import {
  CategorySlider as CategorySliderType,
  HomepageSettingsValue,
  ProductSlider as ProductSliderType,
} from "./types/homepageTypes";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Server component - use direct database access instead of fetch

async function getHomepageSettings(): Promise<HomepageSettingsValue> {
  // Default settings to use if API call fails
  const defaultSettings: HomepageSettingsValue = {
    heroBanners: [],
    categorySliders: [],
    productSliders: [],
    showFeaturedCategories: true,
    showNewArrivals: true,
    showBestsellers: true,
    backgroundColor: "#ffffff",
    accentColor: "#3b82f6",
    animation3dEnabled: true,
  };

  try {
    // Direct database access instead of HTTP fetch
    await connectToDatabase();

    // Try to get homepage settings
    const homepageSettings = await Settings.findOne({ name: "homepage" });

    // If not found, return default settings
    if (!homepageSettings || !homepageSettings.value) {
      return defaultSettings;
    }

    const settings = homepageSettings.value as HomepageSettingsValue;

    // Ensure all required properties exist
    return {
      heroBanners: settings.heroBanners || [],
      categorySliders: settings.categorySliders || [],
      productSliders: settings.productSliders || [],
      showFeaturedCategories: settings.showFeaturedCategories ?? true,
      showNewArrivals: settings.showNewArrivals ?? true,
      showBestsellers: settings.showBestsellers ?? true,
      backgroundColor: settings.backgroundColor || "#ffffff",
      accentColor: settings.accentColor || "#3b82f6",
      animation3dEnabled: settings.animation3dEnabled ?? true,
    };
  } catch (error) {
    console.error("Error in getHomepageSettings:", error);
    return defaultSettings;
  }
}

export default async function Home() {
  const settings = await getHomepageSettings();

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* 3D Animated Background */}
      {settings.animation3dEnabled && (
        <Suspense fallback={null}>
          <BackgroundWrapper accentColor={settings.accentColor} />
        </Suspense>
      )}

      {/* Hero Banner Section */}
      <section className="relative z-10">
        <HeroSection banners={settings.heroBanners || []} />
      </section>

      {/* Category Sliders */}
      {settings.categorySliders &&
        settings.categorySliders.length > 0 &&
        settings.categorySliders.map(
          (slider: CategorySliderType, index: number) =>
            slider &&
            slider.active &&
            slider.title && (
              <section
                key={`category-slider-${index}`}
                className="py-12 relative z-10"
              >
                <div className="container mx-auto px-4">
                  <CategorySlider
                    title={slider.title}
                    subtitle={slider.subtitle}
                    categoryIds={slider.categories}
                  />
                </div>
              </section>
            )
        )}

      {/* Featured Categories Section */}
      {settings.showFeaturedCategories && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <CategorySlider
              title="Featured Categories"
              subtitle="Explore our collections"
              featured={true}
            />
          </div>
        </section>
      )}

      {/* Product Sliders */}
      {settings.productSliders &&
        settings.productSliders.length > 0 &&
        settings.productSliders.map(
          (slider: ProductSliderType, index: number) =>
            slider &&
            slider.active &&
            slider.title && (
              <section
                key={`product-slider-${index}`}
                className="py-12 relative z-10"
              >
                <div className="container mx-auto px-4">
                  <ProductSlider
                    title={slider.title}
                    subtitle={slider.subtitle}
                    type={slider.type}
                    productIds={
                      slider.type === "custom" ? slider.products : undefined
                    }
                  />
                </div>
              </section>
            )
        )}

      {/* New Arrivals Section */}
      {settings.showNewArrivals && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <ProductSlider
              title="New Arrivals"
              subtitle="Check out our latest products"
              type="new"
            />
          </div>
        </section>
      )}

      {/* Bestsellers Section */}
      {settings.showBestsellers && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <ProductSlider
              title="Bestsellers"
              subtitle="Our most popular products"
              type="bestseller"
            />
          </div>
        </section>
      )}
    </div>
  );
}
