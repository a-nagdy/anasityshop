"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

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

interface BannerSectionProps {
  banners: Banner[];
  title?: string;
  subtitle?: string;
}

export default function BannerSection({
  banners,
  title = "Special Offers",
  subtitle = "Don't miss out on these amazing deals",
}: BannerSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const activeBanners = banners
    .filter((banner) => banner.active)
    .sort((a, b) => a.order - b.order);

  if (activeBanners.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Global Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: "rgba(var(--theme-secondary-rgb), 0.05)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: "rgba(var(--theme-primary-rgb), 0.05)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--theme-gradient-accent)",
              }}
            >
              {title}
            </h2>
            <p className="text-xl text-primary max-w-2xl mx-auto">{subtitle}</p>
          </motion.div>
        )}

        {/* Banners */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-8"
        >
          {activeBanners.map((banner, index) => (
            <motion.div
              key={banner._id || index}
              variants={itemVariants}
              className="group"
            >
              {banner.layout === "full-width" && (
                <FullWidthBanner banner={banner} index={index} />
              )}

              {banner.layout === "split" && (
                <SplitBanner banner={banner} index={index} />
              )}

              {banner.layout === "grid" && index === 0 && (
                <GridBanners
                  banners={activeBanners
                    .filter((b) => b.layout === "grid")
                    .slice(0, 4)}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FullWidthBanner({ banner, index }: { banner: Banner; index: number }) {
  return (
    <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden group">
      {/* Background Image */}
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover transition-transform duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      {/* Futuristic Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-1"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.2, duration: 1 }}
          style={{
            background: "var(--theme-gradient-accent)",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-full h-1"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
          style={{
            background: "var(--theme-gradient-accent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center p-8 md:p-12">
        <div className="max-w-2xl">
          <motion.h3
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            {banner.title}
          </motion.h3>

          {banner.subtitle && (
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="text-xl md:text-2xl mb-4 text-white"
            >
              {banner.subtitle}
            </motion.p>
          )}

          {banner.description && (
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="text-white mb-6 text-lg"
            >
              {banner.description}
            </motion.p>
          )}

          {banner.ctaText && banner.ctaLink && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <Link
                href={banner.ctaLink}
                className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl transition-all duration-300"
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
                {banner.ctaText}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SplitBanner({ banner, index }: { banner: Banner; index: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Content */}
      <div className="order-2 lg:order-1">
        <motion.h3
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          {banner.title}
        </motion.h3>

        {banner.subtitle && (
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-xl mb-4"
            style={{ color: "var(--theme-primary)" }}
          >
            {banner.subtitle}
          </motion.p>
        )}

        {banner.description && (
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="text-primary mb-8 text-lg leading-relaxed"
          >
            {banner.description}
          </motion.p>
        )}

        {banner.ctaText && banner.ctaLink && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
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
              {banner.ctaText}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Image */}
      <div className="order-1 lg:order-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.8 }}
          className="relative h-80 rounded-2xl overflow-hidden group"
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}

function GridBanners({ banners }: { banners: Banner[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {banners.map((banner, index) => (
        <motion.div
          key={banner._id || index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative h-64 rounded-xl overflow-hidden"
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h4 className="text-white font-bold text-lg mb-2">
              {banner.title}
            </h4>
            {banner.ctaText && banner.ctaLink && (
              <Link
                href={banner.ctaLink}
                className="transition-colors text-sm font-semibold"
                style={{
                  color: "var(--theme-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--theme-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--theme-primary)";
                }}
              >
                {banner.ctaText} →
              </Link>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
