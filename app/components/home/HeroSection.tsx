"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroBanner {
  _id?: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  order?: number;
  showButton?: boolean;
  showSecondaryButton?: boolean;
  // Alternative property names for backward compatibility
  image?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface HeroSectionProps {
  banners: HeroBanner[];
}

interface HomepageSettings {
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "0, 245, 255";
};

export default function HeroSection({ banners }: HeroSectionProps) {
  const [homepageSettings, setHomepageSettings] =
    useState<HomepageSettings | null>(null);

  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const response = await fetch("/api/settings/homepage");
        if (response.ok) {
          const data = await response.json();
          setHomepageSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching homepage settings:", error);
      }
    };

    fetchHomepageSettings();
  }, []);

  const activeBanners = banners
    .filter((banner) => banner.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Default banner if no active banners
  const defaultBanner: HeroBanner = {
    title: "ANASITY",
    subtitle: "Future of E-Commerce",
    backgroundImage: "",
    ctaText: "Explore Store",
    ctaLink: "/categories",
    active: true,
    order: 0,
    showButton: true,
    showSecondaryButton: true,
  };

  const allBanners = activeBanners.length > 0 ? activeBanners : [defaultBanner];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || allBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, allBanners.length]);

  const accentColor = homepageSettings?.accentColor || "#00f5ff";
  const accentRgb = hexToRgb(accentColor);

  // Normalize the current banner properties
  const currentBanner = allBanners[currentSlide];
  const normalizedBanner = {
    title: currentBanner.title || "ANASITY",
    subtitle: currentBanner.subtitle || "Future of E-Commerce",
    backgroundImage: currentBanner.backgroundImage || currentBanner.image || "",
    ctaText:
      currentBanner.ctaText || currentBanner.buttonText || "Explore Store",
    ctaLink: currentBanner.ctaLink || currentBanner.buttonLink || "/categories",
    active: currentBanner.active,
    order: currentBanner.order || 0,
    showButton: currentBanner.showButton !== false,
    showSecondaryButton: currentBanner.showSecondaryButton !== false,
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + allBanners.length) % allBanners.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background with Slide Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {normalizedBanner.backgroundImage && (
            <>
              <Image
                src={normalizedBanner.backgroundImage}
                alt="Hero Background"
                fill
                className="object-cover opacity-30"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-black/70" />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 z-10">
        {/* Dynamic Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `rgba(var(--theme-primary-rgb), 0.2)`,
            boxShadow: `0 0 100px rgba(var(--theme-primary-rgb), 0.3)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `rgba(var(--theme-accent-rgb), 0.2)`,
            boxShadow: `0 0 100px rgba(var(--theme-accent-rgb), 0.3)`,
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.7, 0.3, 0.7],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        />

        {/* Particle Field */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: `var(--theme-primary)`,
              left: `${10 + i * 7}%`,
              top: `${5 + i * 9}%`,
              boxShadow: `0 0 10px var(--theme-primary)`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.2, 1, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Holographic Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute h-px w-full"
              style={{
                top: `${i * 12.5}%`,
                background: `linear-gradient(to right, transparent, var(--theme-primary), transparent)`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`v-${i}`}
              className="absolute w-px h-full"
              style={{
                left: `${i * 16.66}%`,
                background: `linear-gradient(to bottom, transparent, var(--theme-secondary), transparent)`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 text-center px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            {/* Main Title */}
            <div className="relative inline-block mb-8">
              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-extrabold bg-clip-text text-transparent mb-4"
                style={{
                  backgroundImage: "var(--theme-gradient-primary)",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {normalizedBanner.title}
              </motion.h1>
              <motion.div
                className="absolute -inset-4 rounded-lg blur-xl"
                style={{
                  background: `var(--theme-gradient-primary)`,
                  opacity: 0.3,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-8"
            >
              {normalizedBanner.subtitle.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={index % 2 === 0 ? "text-white" : ""}
                  style={
                    index % 2 === 0
                      ? { color: "var(--theme-primary)" }
                      : { color: "white" }
                  }
                >
                  {word}{" "}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* CTA Buttons */}
        {(normalizedBanner.showButton ||
          normalizedBanner.showSecondaryButton) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            {normalizedBanner.showButton && (
              <Link
                href={normalizedBanner.ctaLink}
                className="group relative px-10 py-5 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                style={{
                  background: "var(--theme-gradient-primary)",
                  boxShadow:
                    "0 4px 15px rgba(var(--theme-primary-rgb), 0.4), 0 0 50px rgba(var(--theme-primary-rgb), 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(var(--theme-primary-rgb), 0.6), 0 0 60px rgba(var(--theme-primary-rgb), 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(var(--theme-primary-rgb), 0.4), 0 0 50px rgba(var(--theme-primary-rgb), 0.2)";
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  🚀 {normalizedBanner.ctaText}
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "var(--theme-gradient-accent)",
                  }}
                />
              </Link>
            )}

            {normalizedBanner.showSecondaryButton && (
              <Link
                href="/products"
                className="group relative px-10 py-5 border-2 font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                style={{
                  borderColor: "var(--theme-secondary)",
                  color: "var(--theme-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.backgroundColor =
                    "var(--theme-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--theme-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  ⚡ View Products
                </span>
              </Link>
            )}
          </motion.div>
        )}
      </div>

      {/* Futuristic Slider Navigation - Only show if multiple banners */}
      {allBanners.length > 1 && (
        <>
          {/* Slide Indicators */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex gap-4">
              {allBanners.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`relative w-16 h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-white/30 hover:bg-white/50"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  style={
                    index === currentSlide
                      ? {
                          backgroundColor: accentColor,
                          boxShadow: `0 0 20px rgba(${accentRgb}, 0.8)`,
                        }
                      : {}
                  }
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {index === currentSlide && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${accentColor}, #8b5cf6)`,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <motion.button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 w-16 h-16 bg-black/50 backdrop-blur-sm border rounded-full flex items-center justify-center font-bold transition-all duration-300"
            style={{
              borderColor: `rgba(${accentRgb}, 0.5)`,
              color: accentColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.2)`;
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 30px rgba(${accentRgb}, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.5)`;
              e.currentTarget.style.boxShadow = "none";
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 w-16 h-16 bg-black/50 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              borderColor: `rgba(${accentRgb}, 0.5)`,
              color: accentColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(${accentRgb}, 0.2)`;
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 30px rgba(${accentRgb}, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.5)`;
              e.currentTarget.style.boxShadow = "none";
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>

          {/* Auto-play Toggle */}
          <motion.button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-8 right-8 z-30 w-12 h-12 bg-black/50 backdrop-blur-sm border border-purple-500/50 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isAutoPlaying ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
        </>
      )}

      {/* Scroll Indicator - Only show on first slide or single banner */}
      {(currentSlide === 0 || allBanners.length === 1) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
