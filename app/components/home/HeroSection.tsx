"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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

interface HeroSectionProps {
  banners: HeroBanner[];
}

export default function HeroSection({ banners = [] }: HeroSectionProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const activeBanners = banners.filter(banner => banner.active && banner.image);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);
  if (activeBanners.length === 0) {
    return (
      <div className="relative h-[70vh] flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-800 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white z-10 px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {banners[0].title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            {banners[0].subtitle}
          </p>
          <Link
            href={banners[0].buttonLink}
            className="inline-block px-8 py-3 bg-white text-blue-900 font-medium rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"
          >
            {banners[0].buttonText}
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {activeBanners.map((banner, index) => (
        <div
          key={banner._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative h-full w-full">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div
                  key={`banner-${currentBanner}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-2xl text-white"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {banner.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8">{banner.subtitle}</p>
                  <Link
                    href={banner.buttonLink}
                    className="inline-block px-8 py-3 bg-white text-blue-900 font-medium rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"
                  >
                    {banner.buttonText}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Banner navigation dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
          <div className="flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBanner
                    ? "bg-white scale-125"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
