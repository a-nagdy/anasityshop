"use client";

import BannerSection from "@/app/components/home/BannerSection";
import CategorySlider from "@/app/components/home/CategorySlider";
import HeroSection from "@/app/components/home/HeroSection";
import ProductSlider from "@/app/components/home/ProductSlider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string | { _id: string; name: string; slug: string };
  description?: string;
  featured?: boolean;
  quantity?: number;
  status: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  active: boolean;
}

interface HeroBanner {
  _id?: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  order: number;
}

interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  order: number;
  layout: "full-width" | "split" | "grid";
}

interface CategorySlider {
  title: string;
  subtitle?: string;
  categories: string[];
  active: boolean;
}

interface ProductSlider {
  title: string;
  subtitle?: string;
  products: string[];
  type: "featured" | "bestseller" | "new" | "sale" | "custom";
  active: boolean;
}

interface HomepageSettings {
  heroBanners: HeroBanner[];
  categorySliders: CategorySlider[];
  productSliders: ProductSlider[];
  banners: Banner[];
  showFeaturedCategories: boolean;
  showNewArrivals: boolean;
  showBestsellers: boolean;
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageSettings, setHomepageSettings] =
    useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        // Import services
        const { ProductService } = await import("../services/productService");
        const { CategoryService } = await import("../services/categoryService");
        const { SettingsService } = await import("../services/settingsService");

        // Fetch all data in parallel using services
        const [
          homepageSettings,
          featuredProducts,
          newProducts,
          saleProducts,
          categories,
        ] = await Promise.all([
          SettingsService.getHomepageSettings(),
          ProductService.getFeaturedProducts(8),
          ProductService.getNewProducts(8),
          ProductService.getSaleProducts(8),
          CategoryService.getParentCategories(8),
        ]);

        // Set all data using services
        setHomepageSettings(homepageSettings as HomepageSettings);
        setFeaturedProducts(featuredProducts as Product[]);
        setNewProducts(newProducts as Product[]);
        setSaleProducts(saleProducts as Product[]);
        setCategories(categories as Category[]);
      } catch (error) {
        // Use proper error handling
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load homepage data";
        console.error("Error fetching homepage data:", errorMessage);

        // Set empty arrays as fallbacks
        setFeaturedProducts([]);
        setNewProducts([]);
        setSaleProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection banners={homepageSettings?.heroBanners || []} />

        {/* Promotional Banners */}
        {homepageSettings?.banners && homepageSettings.banners.length > 0 && (
          <BannerSection
            banners={homepageSettings.banners}
            title="Special Offers"
            subtitle="Don't miss out on these amazing deals"
          />
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <ProductSlider
            products={featuredProducts}
            title="Featured Products"
            subtitle="Discover our top picks"
            type="featured"
          />
        )}
        {/* Categories Section */}
        {homepageSettings?.showFeaturedCategories && categories.length > 0 && (
          <CategorySlider
            categories={categories}
            title="Explore Categories"
            subtitle="Discover our premium collections"
          />
        )}

        {/* New Arrivals */}
        {homepageSettings?.showNewArrivals && newProducts.length > 0 && (
          <ProductSlider
            products={newProducts}
            title="New Arrivals"
            subtitle="Latest additions to our collection"
            type="new"
          />
        )}

        {/* Sale Products */}
        {homepageSettings?.showBestsellers && saleProducts.length > 0 && (
          <ProductSlider
            products={saleProducts}
            title="Best Deals"
            subtitle="Limited time offers"
            type="sale"
          />
        )}

        {/* Additional Content Sections */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2
                className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent"
                style={{
                  backgroundImage: "var(--theme-gradient-accent)",
                }}
              >
                Why Choose Elyana?
              </h2>
              <p className="text-xl theme-primary max-w-3xl mx-auto">
                Experience the future of e-commerce with cutting-edge
                technology, premium products, and unmatched customer service.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🚀",
                  title: "Fast Delivery",
                  description:
                    "Lightning-fast shipping with real-time tracking",
                },
                {
                  icon: "🔒",
                  title: "Secure Payment",
                  description: "Bank-level security for all transactions",
                },
                {
                  icon: "⭐",
                  title: "Premium Quality",
                  description: "Only the finest products make it to our store",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl backdrop-blur-sm border border-white/10 transition-all duration-300"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3
                    className="text-2xl font-bold text-white mb-4 transition-colors"
                    style={{
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--theme-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-primary">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
