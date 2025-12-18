"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react"; // useEffect removed from unused homepage settings fetch

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

export default function HeroSection({ banners }: HeroSectionProps) {
  // Removed hardcoded colors - now using CSS variables from globals.css

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeBanners = banners
    .filter((banner) => banner.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const allBanners = activeBanners;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || allBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, allBanners.length]);

  // Don't render if no active banners
  if (activeBanners.length === 0) {
    return null;
  }

  // Normalize the current banner properties
  const currentBanner = allBanners[currentSlide];
  const normalizedBanner = {
    title: currentBanner.title || "",
    subtitle: currentBanner.subtitle || "",
    backgroundImage: currentBanner.backgroundImage || currentBanner.image || "",
    ctaText: currentBanner.ctaText || currentBanner.buttonText || "",
    ctaLink: currentBanner.ctaLink || currentBanner.buttonLink || "",
    active: currentBanner.active,
    order: currentBanner.order || 0,
    showButton: currentBanner.showButton !== false && !!currentBanner.ctaText,
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {normalizedBanner.backgroundImage && (
            <>
              <Image
                src={normalizedBanner.backgroundImage}
                alt="Hero Background"
                fill
                className={`object-cover ${
                  normalizedBanner.title || normalizedBanner.subtitle
                    ? "opacity-30"
                    : "opacity-100"
                }`}
                quality={100}
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-black/70" />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Background Effects - Removed animated orbs, particles, and grid lines */}

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
                className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-4"
                style={{
                  color: "var(--theme-primary)",
                }}
              >
                {normalizedBanner.title}
              </motion.h1>
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
                className="group relative px-10 py-5 text-white font-bold rounded-xl text-lg transition-all duration-300 overflow-hidden"
                style={{
                  background: "var(--theme-gradient-accent)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "var(--theme-gradient-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "var(--theme-gradient-accent)";
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
                className="group relative px-10 py-5 border-2 font-bold rounded-xl text-lg transition-all duration-300 backdrop-blur-sm"
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
                          background: "var(--theme-gradient-accent)",
                        }
                      : {}
                  }
                >
                  {index === currentSlide && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "var(--theme-gradient-accent)",
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
              borderColor: "var(--theme-primary-50)",
              color: "var(--theme-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--theme-primary-20)";
              e.currentTarget.style.borderColor = "var(--theme-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = "var(--theme-primary-50)";
            }}
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
              borderColor: "var(--theme-primary-50)",
              color: "var(--theme-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--theme-primary-20)";
              e.currentTarget.style.borderColor = "var(--theme-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.borderColor = "var(--theme-primary-50)";
            }}
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
            className="absolute top-8 right-8 z-30 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
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
