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
        // Fetch all data in parallel
        const [
          homepageResponse,
          featuredResponse,
          newResponse,
          saleResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("/api/settings/homepage"),
          fetch("/api/products?limit=8&featured=true"),
          fetch("/api/products?limit=8&sortBy=createdAt&sortOrder=desc"),
          fetch("/api/products?limit=8&onSale=true"),
          fetch("/api/categories?active=true&parentOnly=true&limit=8"),
        ]);

        // Homepage settings
        if (homepageResponse.ok) {
          const homepageData = await homepageResponse.json();
          setHomepageSettings(homepageData.data);
        }

        // Featured products
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedProducts(
            featuredData.products || featuredData.data?.products || []
          );
        }

        // New products
        if (newResponse.ok) {
          const newData = await newResponse.json();
          setNewProducts(newData.products || newData.data?.products || []);
        }

        // Sale products
        if (saleResponse.ok) {
          const saleData = await saleResponse.json();
          setSaleProducts(saleData.products || saleData.data?.products || []);
        }

        // Categories
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(
            categoriesData.categories || categoriesData.data?.categories || []
          );
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Global background effects */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: homepageSettings?.backgroundColor || "#0a0a0f",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,245,255,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,128,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(57,255,20,0.08),transparent)]" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{
              backgroundImage: `linear-gradient(${
                homepageSettings?.accentColor || "#00f5ff"
              }1a 1px, transparent 1px), linear-gradient(90deg, ${
                homepageSettings?.accentColor || "#00f5ff"
              }1a 1px, transparent 1px)`,
            }}
          />
        </div>

        {/* Floating particles */}
        {homepageSettings?.animation3dEnabled && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: homepageSettings?.accentColor || "#00f5ff",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection banners={homepageSettings?.heroBanners || []} />

        {/* Categories Section */}
        {homepageSettings?.showFeaturedCategories && categories.length > 0 && (
          <CategorySlider
            categories={categories}
            title="Explore Categories"
            subtitle="Discover our premium collections"
          />
        )}

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
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Why Choose Anasity?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
                  className="group p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
