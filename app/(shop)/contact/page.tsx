"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      info: "support@elyana.com",
      link: "mailto:support@elyana.com",
    },
    {
      icon: "🕒",
      title: "Business Hours",
      info: "Mon-Fri: 9AM-6PM EST",
      link: null,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Get In Touch
            </h1>
            <p
              className="text-xl md:text-2xl max-w-3xl mx-auto"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Have questions? We&apos;d love to hear from you. Send us a message
              and we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:border-[var(--theme-primary)] hover:scale-105"
                    style={{
                      backgroundColor: "var(--theme-surface)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: "var(--theme-text-secondary)" }}>
                      {item.info}
                    </p>
                  </a>
                ) : (
                  <div
                    className="p-6 rounded-2xl backdrop-blur-sm border"
                    style={{
                      backgroundColor: "var(--theme-surface)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: "var(--theme-text-secondary)" }}>
                      {item.info}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-3xl backdrop-blur-sm border"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor: "var(--theme-primary)",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-2 text-center"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Send Us a Message
            </h2>
            <p
              className="text-center mb-8"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Fill out the form below and we&apos;ll get back to you within 24
              hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg-primary)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: "var(--theme-text-primary)",
                    }}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg-primary)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: "var(--theme-text-primary)",
                    }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                  style={{
                    backgroundColor: "var(--theme-bg-primary)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--theme-text-primary)",
                  }}
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[var(--theme-primary)] transition-colors resize-none"
                  style={{
                    backgroundColor: "var(--theme-bg-primary)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--theme-text-primary)",
                  }}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--theme-gradient-accent)",
                }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              Quick answers to common questions
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {[
              {
                q: "What are your shipping options?",
                a: "We offer standard (5-7 days), express (2-3 days), and overnight shipping options.",
              },
              {
                q: "Do you ship internationally?",
                a: "Yes! We ship to most countries worldwide. Shipping costs and times vary by location.",
              },
              {
                q: "What is your return policy?",
                a: "We offer a 30-day return policy for most items. Products must be unused and in original packaging.",
              },
              {
                q: "How can I track my order?",
                a: "Once shipped, you'll receive a tracking number via email to monitor your order's progress.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl backdrop-blur-sm border"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {faq.q}
                </h3>
                <p style={{ color: "var(--theme-text-secondary)" }}>{faq.a}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
