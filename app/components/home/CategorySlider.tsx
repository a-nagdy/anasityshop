"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  active: boolean;
}

interface CategorySliderProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
}

export default function CategorySlider({
  categories,
  title = "Explore Categories",
  subtitle = "Discover our premium collections",
}: CategorySliderProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {categories.slice(0, 8).map((category, index) => (
            <motion.div
              key={category._id}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                z: 50,
              }}
              className="group relative"
            >
              <Link href={`/categories/${category.slug}`}>
                <div className="relative h-80 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition-all duration-500">
                  {/* Category Image */}
                  {category.image && (
                    <div className="absolute inset-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Hover Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Glowing Border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        "0 0 0 1px rgba(0,245,255,0)",
                        "0 0 20px 1px rgba(0,245,255,0.3)",
                        "0 0 0 1px rgba(0,245,255,0)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Category Name */}
                    <motion.h3
                      className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {category.name}
                    </motion.h3>

                    {/* Description */}
                    {category.description && (
                      <motion.p
                        className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {category.description}
                      </motion.p>
                    )}

                    {/* Explore Button */}
                    <motion.div
                      className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg text-sm">
                        Explore
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </span>
                    </motion.div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/40 hover:to-cyan-600/40 text-white font-semibold rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
          >
            View All Categories
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="group-hover:text-cyan-400 transition-colors"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
