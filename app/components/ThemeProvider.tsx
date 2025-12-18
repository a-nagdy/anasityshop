"use client";

import { useEffect, useState } from "react";

interface WebsiteThemeSettings {
  // Primary Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Button Colors
  buttonPrimaryColor: string;
  buttonSecondaryColor: string;
  buttonHoverColor: string;
  buttonTextColor: string;

  // Header Colors
  headerBackgroundColor: string;
  headerTextColor: string;
  headerBorderColor: string;

  // Footer Colors
  footerBackgroundColor: string;
  footerTextColor: string;
  footerLinkColor: string;

  // Background Colors
  backgroundColor: string;
  surfaceColor: string;

  // Text Colors
  textPrimaryColor: string;
  textSecondaryColor: string;

  // Border and Shadow
  borderColor: string;
  shadowColor: string;

  // Effects
  animation3dEnabled: boolean;
  glassmorphismEnabled: boolean;
  particleEffectsEnabled: boolean;
}

interface HomepageSettings {
  backgroundColor?: string;
  accentColor?: string;
  animation3dEnabled?: boolean;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeSettings, setThemeSettings] = useState<WebsiteThemeSettings>({
    // Primary Colors
    primaryColor: "#00f5ff",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",

    // Button Colors
    buttonPrimaryColor: "#00f5ff",
    buttonSecondaryColor: "#8b5cf6",
    buttonHoverColor: "#00d9ff",
    buttonTextColor: "#ffffff",

    // Header Colors
    headerBackgroundColor: "#f4f0ec",
    headerTextColor: "#ffffff",
    headerBorderColor: "rgba(0, 245, 255, 0.2)",

    // Footer Colors
    footerBackgroundColor: "#f4f0ec",
    footerTextColor: "#ffffff",
    footerLinkColor: "#00f5ff",

    // Background Colors
    backgroundColor: "#f4f0ec",
    surfaceColor: "rgba(255, 255, 255, 0.05)",

    // Text Colors
    textPrimaryColor: "#ffffff",
    textSecondaryColor: "#a1a1aa",

    // Border and Shadow
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "rgba(0, 245, 255, 0.2)",

    // Effects
    animation3dEnabled: true,
    glassmorphismEnabled: true,
    particleEffectsEnabled: true,
  });

  useEffect(() => {
    // Fetch both theme settings and homepage settings
    const fetchAllSettings = async () => {
      try {
        // Fetch website theme settings
        const [themeResponse, homepageResponse] = await Promise.all([
          fetch("/api/settings/website-theme"),
          fetch("/api/settings/homepage"),
        ]);

        let baseThemeSettings: WebsiteThemeSettings | null = null;
        let homepageSettings: HomepageSettings | null = null;

        // Process website theme settings
        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (themeData.data && themeData.data.value) {
            baseThemeSettings = themeData.data.value;
          }
        }

        // Process homepage settings
        if (homepageResponse.ok) {
          const homepageData = await homepageResponse.json();
          if (homepageData.data) {
            homepageSettings = homepageData.data;
          }
        }

        // Helper to convert hex to rgb for rgba composition (inlined below as toRgb)

        // Merge settings - homepage settings override theme settings for key colors
        setThemeSettings((previous) => {
          const base = baseThemeSettings || previous;
          if (homepageSettings) {
            const toRgb = (hex: string) => {
              if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
                return hex;
              }
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                hex
              );
              return result
                ? `${parseInt(result[1], 16)}, ${parseInt(
                    result[2],
                    16
                  )}, ${parseInt(result[3], 16)}`
                : "0, 245, 255";
            };
            const mergedSettings: WebsiteThemeSettings = {
              ...base,
              // Use homepage colors as primary theme colors
              primaryColor: homepageSettings.accentColor || base.primaryColor,
              accentColor: homepageSettings.accentColor || base.accentColor,
              backgroundColor:
                homepageSettings.backgroundColor || base.backgroundColor,

              // Update button colors to use homepage accent
              buttonPrimaryColor:
                homepageSettings.accentColor || base.buttonPrimaryColor,
              buttonHoverColor:
                homepageSettings.accentColor || base.buttonHoverColor,

              // Update header border and footer link to use homepage accent
              headerBorderColor: `rgba(${toRgb(
                homepageSettings.accentColor || base.primaryColor
              )}, 0.2)`,
              footerLinkColor:
                homepageSettings.accentColor || base.footerLinkColor,

              // Update shadow color to use homepage accent
              shadowColor: `rgba(${toRgb(
                homepageSettings.accentColor || base.primaryColor
              )}, 0.2)`,

              // Use homepage animation setting
              animation3dEnabled:
                homepageSettings.animation3dEnabled !== undefined
                  ? homepageSettings.animation3dEnabled
                  : base.animation3dEnabled,
              // Preserve other flags
              glassmorphismEnabled: base.glassmorphismEnabled,
              particleEffectsEnabled: base.particleEffectsEnabled,
              secondaryColor: base.secondaryColor,
              buttonSecondaryColor: base.buttonSecondaryColor,
              headerBackgroundColor: base.headerBackgroundColor,
              headerTextColor: base.headerTextColor,
              footerBackgroundColor: base.footerBackgroundColor,
              footerTextColor: base.footerTextColor,
              surfaceColor: base.surfaceColor,
              textPrimaryColor: base.textPrimaryColor,
              textSecondaryColor: base.textSecondaryColor,
              borderColor: base.borderColor,
            };
            return mergedSettings;
          }
          return base;
        });
      } catch (error) {
        console.error("Error fetching theme settings:", error);
      }
    };

    fetchAllSettings();

    // Listen for theme update events
    const handleThemeUpdate = () => {
      fetchAllSettings();
    };

    // Listen for homepage update events too
    const handleHomepageUpdate = () => {
      fetchAllSettings();
    };

    window.addEventListener("themeUpdated", handleThemeUpdate);
    window.addEventListener("homepageUpdated", handleHomepageUpdate);

    return () => {
      window.removeEventListener("themeUpdated", handleThemeUpdate);
      window.removeEventListener("homepageUpdated", handleHomepageUpdate);
    };
  }, []); // Remove themeSettings from dependency array to prevent infinite loop

  useEffect(() => {
    // Apply theme to CSS custom properties
    const root = document.documentElement;

    // Helper function to convert color to RGB
    const hexToRgb = (hex: string) => {
      // Handle rgba/rgb strings
      if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
        return hex;
      }

      // Handle hex colors
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
            result[3],
            16
          )}`
        : "0, 245, 255";
    };

    // Primary Colors
    root.style.setProperty("--theme-primary", themeSettings.primaryColor);
    root.style.setProperty("--theme-secondary", themeSettings.secondaryColor);
    root.style.setProperty("--theme-accent", themeSettings.accentColor);

    // Button Colors
    root.style.setProperty(
      "--theme-button-primary",
      themeSettings.buttonPrimaryColor
    );
    root.style.setProperty(
      "--theme-button-secondary",
      themeSettings.buttonSecondaryColor
    );
    root.style.setProperty(
      "--theme-button-hover",
      themeSettings.buttonHoverColor
    );
    root.style.setProperty(
      "--theme-button-text",
      themeSettings.buttonTextColor
    );

    // Header Colors
    root.style.setProperty(
      "--theme-header-bg",
      themeSettings.headerBackgroundColor
    );
    root.style.setProperty(
      "--theme-header-text",
      themeSettings.headerTextColor
    );
    root.style.setProperty(
      "--theme-header-border",
      themeSettings.headerBorderColor
    );

    // Footer Colors
    root.style.setProperty(
      "--theme-footer-bg",
      themeSettings.footerBackgroundColor
    );
    root.style.setProperty(
      "--theme-footer-text",
      themeSettings.footerTextColor
    );
    root.style.setProperty(
      "--theme-footer-link",
      themeSettings.footerLinkColor
    );

    // Background Colors
    root.style.setProperty("--theme-bg-primary", themeSettings.backgroundColor);
    root.style.setProperty("--theme-surface", themeSettings.surfaceColor);

    // Text Colors
    root.style.setProperty(
      "--theme-text-primary",
      themeSettings.textPrimaryColor
    );
    root.style.setProperty(
      "--theme-text-secondary",
      themeSettings.textSecondaryColor
    );

    // Border and Shadow
    root.style.setProperty("--theme-border", themeSettings.borderColor);
    root.style.setProperty("--theme-shadow", themeSettings.shadowColor);

    // Calculate RGB values for gradients and effects
    const primaryRgb = hexToRgb(themeSettings.primaryColor);
    const secondaryRgb = hexToRgb(themeSettings.secondaryColor);
    const accentRgb = hexToRgb(themeSettings.accentColor);

    // Set RGB variations for effects
    root.style.setProperty("--theme-primary-rgb", primaryRgb);
    root.style.setProperty("--theme-secondary-rgb", secondaryRgb);
    root.style.setProperty("--theme-accent-rgb", accentRgb);

    // Create opacity variations for the primary color
    root.style.setProperty("--theme-primary-10", `rgba(${primaryRgb}, 0.1)`);
    root.style.setProperty("--theme-primary-20", `rgba(${primaryRgb}, 0.2)`);
    root.style.setProperty("--theme-primary-30", `rgba(${primaryRgb}, 0.3)`);
    root.style.setProperty("--theme-primary-50", `rgba(${primaryRgb}, 0.5)`);

    // Create opacity variations for the accent color too
    root.style.setProperty("--theme-accent-10", `rgba(${accentRgb}, 0.1)`);
    root.style.setProperty("--theme-accent-20", `rgba(${accentRgb}, 0.2)`);
    root.style.setProperty("--theme-accent-30", `rgba(${accentRgb}, 0.3)`);
    root.style.setProperty("--theme-accent-40", `rgba(${accentRgb}, 0.4)`);
    root.style.setProperty("--theme-accent-50", `rgba(${accentRgb}, 0.5)`);
    root.style.setProperty("--theme-accent-60", `rgba(${accentRgb}, 0.6)`);
    root.style.setProperty("--theme-accent-70", `rgba(${accentRgb}, 0.7)`);
    root.style.setProperty("--theme-accent-80", `rgba(${accentRgb}, 0.8)`);
    root.style.setProperty("--theme-accent-90", `rgba(${accentRgb}, 0.9)`);

    // Gradient effects
    root.style.setProperty(
      "--theme-gradient-accent",
      `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})`
    );
    root.style.setProperty(
      "--theme-gradient-accent",
      `linear-gradient(135deg, ${themeSettings.accentColor}, ${themeSettings.primaryColor})`
    );

    // Glow effects
    root.style.setProperty("--theme-glow", `0 0 20px rgba(${primaryRgb}, 0.5)`);
    root.style.setProperty(
      "--theme-glow-strong",
      `0 0 40px rgba(${primaryRgb}, 0.8)`
    );
    root.style.setProperty(
      "--theme-glow-primary",
      `0 0 20px rgba(${primaryRgb}, 0.5)`
    );
    root.style.setProperty(
      "--theme-glow-secondary",
      `0 0 40px rgba(${accentRgb}, 0.3)`
    );

    // Effects flags
    root.style.setProperty(
      "--theme-animations-enabled",
      themeSettings.animation3dEnabled ? "1" : "0"
    );
    root.style.setProperty(
      "--theme-glassmorphism-enabled",
      themeSettings.glassmorphismEnabled ? "1" : "0"
    );
    root.style.setProperty(
      "--theme-particles-enabled",
      themeSettings.particleEffectsEnabled ? "1" : "0"
    );

    // Apply body background
    document.body.style.backgroundColor = themeSettings.backgroundColor;
  }, [themeSettings]);

  return <>{children}</>;
}

// Hook to use theme settings in components
export function useTheme() {
  const [themeSettings, setThemeSettings] = useState<WebsiteThemeSettings>({
    // Primary Colors
    primaryColor: "#00f5ff",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",

    // Button Colors
    buttonPrimaryColor: "#00f5ff",
    buttonSecondaryColor: "#8b5cf6",
    buttonHoverColor: "#00d9ff",
    buttonTextColor: "#ffffff",

    // Header Colors
    headerBackgroundColor: "rgba(10, 10, 15, 0.95)",
    headerTextColor: "#ffffff",
    headerBorderColor: "rgba(0, 245, 255, 0.2)",

    // Footer Colors
    footerBackgroundColor: "rgba(10, 10, 15, 0.98)",
    footerTextColor: "#ffffff",
    footerLinkColor: "#00f5ff",

    // Background Colors
    backgroundColor: "#0a0a0f",
    surfaceColor: "rgba(255, 255, 255, 0.05)",

    // Text Colors
    textPrimaryColor: "#ffffff",
    textSecondaryColor: "#a1a1aa",

    // Border and Shadow
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "rgba(0, 245, 255, 0.2)",

    // Effects
    animation3dEnabled: true,
    glassmorphismEnabled: true,
    particleEffectsEnabled: true,
  });

  useEffect(() => {
    // Fetch both theme settings and homepage settings (same logic as main ThemeProvider)
    const fetchAllSettings = async () => {
      try {
        // Fetch both website theme and homepage settings
        const [themeResponse, homepageResponse] = await Promise.all([
          fetch("/api/settings/website-theme"),
          fetch("/api/settings/homepage"),
        ]);
        let baseThemeSettings: WebsiteThemeSettings | null = null;
        let homepageSettings: HomepageSettings | null = null;

        // Process website theme settings
        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (themeData.data && themeData.data.value) {
            baseThemeSettings = themeData.data.value;
          }
        }

        // Process homepage settings
        if (homepageResponse.ok) {
          const homepageData = await homepageResponse.json();
          if (homepageData.data) {
            homepageSettings = homepageData.data;
          }
        }

        // Helper function to convert color to RGB
        // const hexToRgb = (hex: string) => {
        //   // Handle rgba/rgb strings
        //   if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
        //     return hex;
        //   }

        //   // Handle hex colors
        //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        //   return result
        //     ? `${parseInt(result[1], 16)}, ${parseInt(
        //         result[2],
        //         16
        //       )}, ${parseInt(result[3], 16)}`
        //     : "0, 245, 255";
        // };

        // Merge settings - homepage settings override theme settings for key colors
        setThemeSettings((previous) => {
          const base = baseThemeSettings || previous;
          if (homepageSettings) {
            const hexToRgb = (hex: string) => {
              if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
                return hex;
              }
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                hex
              );
              return result
                ? `${parseInt(result[1], 16)}, ${parseInt(
                    result[2],
                    16
                  )}, ${parseInt(result[3], 16)}`
                : "0, 245, 255";
            };

            return {
              ...base,
              primaryColor: homepageSettings.accentColor || base.primaryColor,
              accentColor: homepageSettings.accentColor || base.accentColor,
              backgroundColor:
                homepageSettings.backgroundColor || base.backgroundColor,
              buttonPrimaryColor:
                homepageSettings.accentColor || base.buttonPrimaryColor,
              buttonHoverColor:
                homepageSettings.accentColor || base.buttonHoverColor,
              headerBorderColor: `rgba(${hexToRgb(
                homepageSettings.accentColor || base.primaryColor
              )}, 0.2)`,
              footerLinkColor:
                homepageSettings.accentColor || base.footerLinkColor,
              shadowColor: `rgba(${hexToRgb(
                homepageSettings.accentColor || base.primaryColor
              )}, 0.2)`,
              animation3dEnabled:
                homepageSettings.animation3dEnabled !== undefined
                  ? homepageSettings.animation3dEnabled
                  : base.animation3dEnabled,
            };
          }
          return base;
        });
      } catch (error) {
        console.error("Error fetching theme settings:", error);
      }
    };

    fetchAllSettings();

    // Listen for both theme and homepage update events
    const handleThemeUpdate = () => {
      fetchAllSettings();
    };

    const handleHomepageUpdate = () => {
      fetchAllSettings();
    };

    window.addEventListener("themeUpdated", handleThemeUpdate);
    window.addEventListener("homepageUpdated", handleHomepageUpdate);

    return () => {
      window.removeEventListener("themeUpdated", handleThemeUpdate);
      window.removeEventListener("homepageUpdated", handleHomepageUpdate);
    };
  }, []); // Run once on mount; merges state functionally to avoid deps

  return themeSettings;
}

// Function to trigger theme update across the app
export function triggerThemeUpdate() {
  window.dispatchEvent(new CustomEvent("themeUpdated"));
}

// Function to trigger homepage update across the app
export function triggerHomepageUpdate() {
  window.dispatchEvent(new CustomEvent("homepageUpdated"));
}
