"use client";

import { useEffect, useState } from "react";
import CategorySlider from "../components/home/CategorySlider";
import HeroSection from "../components/home/HeroSection";
import Particles from "../components/home/Particles";
import ProductSlider from "../components/home/ProductSlider";

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  active: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productsCount: number;
  active: boolean;
  products: Product[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
  images: string[];
  status: string;
}

interface Slider {
  title: string;
  subtitle: string;
  categories: Category[];
}

interface ProductSlider {
  title: string;
  subtitle: string;
  products: Product[];
}

interface HomepageData {
  heroBanners: Banner[];
  categorySliders: Slider[];
  productSliders: ProductSlider[];
  settings: {
    showFeaturedCategories: boolean;
    showNewArrivals: boolean;
    showBestsellers: boolean;
    backgroundColor: string;
    accentColor: string;
    animation3dEnabled: boolean;
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<HomepageData | null>(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/homepage");
        if (!response.ok) {
          throw new Error(`Failed to fetch homepage data: ${response.status}`);
        }
        const data = await response.json();
        // console.log("Homepage settings:", data.settings);
        setData(data);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load homepage"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error || "Failed to load homepage"}
          </p>
        </div>
      </div>
    );
  }

  const { heroBanners, categorySliders, productSliders, settings } = data;

  return (
    <main className="min-h-screen relative">
      <Particles
        particleColors={["#4F46E5", "#6366F1", "#818CF8"]}
        particleCount={150}
        particleSpread={15}
        speed={0.05}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        alphaParticles={true}
        particleBaseSize={80}
        sizeRandomness={0.5}
        cameraDistance={25}
      />

      {/* {settings?.animation3dEnabled && (
        <BackgroundWrapper accentColor={settings.accentColor || "#4F46E5"} />
      )} */}

      <div style={{ backgroundColor: settings.backgroundColor }}>
        <HeroSection banners={heroBanners} />

        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Category Sliders */}
          {categorySliders.map((slider, index) => (
            <CategorySlider
              key={index}
              title={slider.title}
              subtitle={slider.subtitle}
              categoryIds={slider.categories.map((cat: Category) => cat._id)}
              categories={slider.categories}
            />
          ))}

          {/* Product Sliders */}
          {productSliders.map((slider, index) => (
            <ProductSlider
              key={index}
              title={slider.title}
              subtitle={slider.subtitle}
              products={slider.products as Product[]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
