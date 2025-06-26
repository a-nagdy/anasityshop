"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ThemeSettings {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 245, b: 255 }; // fallback to cyan
};

export default function GlobalBackground() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchThemeSettings = async () => {
      try {
        const response = await fetch("/api/settings/website-theme");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.value) {
            setThemeSettings({
              primaryColor: data.data.value.primaryColor || "#00f5ff",
              backgroundColor: data.data.value.backgroundColor || "#0a0a0f",
              accentColor: data.data.value.accentColor || "#00f5ff",
              animation3dEnabled: data.data.value.animation3dEnabled !== false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching theme settings:", error);
        // Fallback to default values
        setThemeSettings({
          primaryColor: "#00f5ff",
          backgroundColor: "#0a0a0f",
          accentColor: "#00f5ff",
          animation3dEnabled: true,
        });
      }
    };

    fetchThemeSettings();

    // Listen for theme settings updates
    const handleThemeUpdate = () => {
      fetchThemeSettings();
    };

    window.addEventListener("themeUpdated", handleThemeUpdate);
    return () => {
      window.removeEventListener("themeUpdated", handleThemeUpdate);
    };
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted || !themeSettings) {
    return null;
  }

  // Get RGB values for the primary color
  const primaryRgb = hexToRgb(themeSettings.primaryColor);
  const primaryRgbString = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Base background */}
      <div
        className="absolute inset-0"
        style={{
          background: themeSettings.backgroundColor,
        }}
      />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(${themeSettings.primaryColor} 1px, transparent 1px),
              linear-gradient(90deg, ${themeSettings.primaryColor} 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        />
      </div>

      {/* Floating particles */}
      {themeSettings.animation3dEnabled && (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                backgroundColor: themeSettings.primaryColor,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent"
        style={{
          background: `radial-gradient(circle at 20% 50%, rgba(${primaryRgbString}, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Additional ambient lighting effects */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 80% 20%, rgba(${primaryRgbString}, 0.08), transparent)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 40% 40%, rgba(${primaryRgbString}, 0.06), transparent)`,
        }}
      />

      {/* Large floating orbs for ambient effect */}
      {themeSettings.animation3dEnabled && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-2xl opacity-30"
              style={{
                backgroundColor: themeSettings.primaryColor,
                left: `${20 + i * 30}%`,
                top: `${10 + i * 25}%`,
                width: `${150 + Math.random() * 100}px`,
                height: `${150 + Math.random() * 100}px`,
              }}
              animate={{
                x: [0, 40, 0],
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                delay: i * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
