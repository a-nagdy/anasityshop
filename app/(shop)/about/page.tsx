"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: "🎯",
      title: "Our Mission",
      description:
        "To provide premium quality products with exceptional customer service, making online shopping a delightful experience.",
    },
    {
      icon: "💎",
      title: "Quality First",
      description:
        "We carefully curate every product to ensure it meets our high standards of quality and craftsmanship.",
    },
    {
      icon: "🚀",
      title: "Fast Delivery",
      description:
        "Lightning-fast shipping with real-time tracking to get your orders to you as quickly as possible.",
    },
    {
      icon: "🔒",
      title: "Secure Shopping",
      description:
        "Bank-level security and encrypted payments to keep your information safe and secure.",
    },
  ];

  const values = [
    {
      title: "Customer First",
      description: "Your satisfaction is our top priority in everything we do.",
    },
    {
      title: "Innovation",
      description:
        "We constantly evolve to bring you the latest and greatest products.",
    },
    {
      title: "Sustainability",
      description:
        "Committed to eco-friendly practices and sustainable sourcing.",
    },
    {
      title: "Integrity",
      description:
        "Honest, transparent, and ethical in all our business practices.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "var(--theme-primary)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "var(--theme-primary)" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--theme-gradient-accent)",
              }}
            >
              About Elyana
            </h1>
            <p
              className="text-xl md:text-2xl max-w-3xl mx-auto mb-8"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Your trusted destination for premium products and exceptional
              shopping experiences since 2024.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: "var(--theme-text-primary)" }}
              >
                Our Story
              </h2>
              <p
                className="text-lg mb-4"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                Elyana was founded with a simple yet powerful vision: to create
                an online shopping experience that combines quality,
                convenience, and trust.
              </p>
              <p
                className="text-lg mb-4"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                What started as a small passion project has grown into a
                thriving e-commerce platform serving thousands of satisfied
                customers worldwide.
              </p>
              <p
                className="text-lg"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                We believe in the power of great products to enhance lives, and
                we&apos;re committed to bringing you the best selection with
                unmatched service.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-96 rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--theme-surface)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-8xl"
                  style={{ color: "var(--theme-primary)" }}
                >
                  🛍️
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Why Choose Us
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              We&apos;re committed to providing the best shopping experience
              possible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:border-[var(--theme-primary)]"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "var(--theme-text-secondary)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Our Values
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl backdrop-blur-sm border"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-primary)",
                }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {value.title}
                </h3>
                <p
                  className="text-lg"
                  style={{ color: "var(--theme-text-secondary)" }}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center p-12 rounded-3xl backdrop-blur-sm border"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor: "var(--theme-primary)",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Ready to Start Shopping?
            </h2>
            <p
              className="text-xl mb-8"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Explore our curated collection of premium products
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: "var(--theme-gradient-accent)",
                }}
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 font-bold rounded-xl border-2 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: "var(--theme-primary)",
                  color: "var(--theme-primary)",
                }}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
