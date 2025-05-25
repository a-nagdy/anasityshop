import { Suspense } from "react";
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

// Server component - use fetch API

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

  // In build time, return default settings to avoid dynamic server usage
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_BASE_URL
  ) {
    return defaultSettings;
  }

  try {
    // Make a direct call to the API route
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/settings/homepage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.warn(`Homepage settings API error: ${response.status}`);
      return defaultSettings;
    }

    const data = await response.json();

    // The settings are in the 'value' property of the response
    if (data && data.value) {
      const settings = data.value as HomepageSettingsValue;
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
    }

    // If no value property, try using the data directly
    if (
      data &&
      (data.heroBanners || data.categorySliders || data.productSliders)
    ) {
      return {
        heroBanners: data.heroBanners || [],
        categorySliders: data.categorySliders || [],
        productSliders: data.productSliders || [],
        showFeaturedCategories: data.showFeaturedCategories ?? true,
        showNewArrivals: data.showNewArrivals ?? true,
        showBestsellers: data.showBestsellers ?? true,
        backgroundColor: data.backgroundColor || "#ffffff",
        accentColor: data.accentColor || "#3b82f6",
        animation3dEnabled: data.animation3dEnabled ?? true,
      };
    }

    // If we get here, return default settings
    return defaultSettings;
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
