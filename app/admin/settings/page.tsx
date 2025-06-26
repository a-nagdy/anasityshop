"use client";

import { motion } from "framer-motion";
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<WebsiteThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/website-theme");

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data.value);
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/settings/website-theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        // Trigger theme update across the website
        window.dispatchEvent(new CustomEvent("themeUpdated"));
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    key: keyof WebsiteThemeSettings,
    value: string | boolean
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value,
      });
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: WebsiteThemeSettings = {
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
    };

    setSettings(defaultSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load settings
          </h2>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Website Theme Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Customize the colors and appearance of your website
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Primary Color"
              value={settings.primaryColor}
              onChange={(value) => updateSetting("primaryColor", value)}
            />
            <ColorInput
              label="Secondary Color"
              value={settings.secondaryColor}
              onChange={(value) => updateSetting("secondaryColor", value)}
            />
            <ColorInput
              label="Accent Color"
              value={settings.accentColor}
              onChange={(value) => updateSetting("accentColor", value)}
            />
          </div>
        </div>

        {/* Button Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Button Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Button Primary"
              value={settings.buttonPrimaryColor}
              onChange={(value) => updateSetting("buttonPrimaryColor", value)}
            />
            <ColorInput
              label="Button Secondary"
              value={settings.buttonSecondaryColor}
              onChange={(value) => updateSetting("buttonSecondaryColor", value)}
            />
            <ColorInput
              label="Button Hover"
              value={settings.buttonHoverColor}
              onChange={(value) => updateSetting("buttonHoverColor", value)}
            />
            <ColorInput
              label="Button Text"
              value={settings.buttonTextColor}
              onChange={(value) => updateSetting("buttonTextColor", value)}
            />
          </div>
        </div>

        {/* Header Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Header Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Header Background"
              value={settings.headerBackgroundColor}
              onChange={(value) =>
                updateSetting("headerBackgroundColor", value)
              }
              allowRgba
            />
            <ColorInput
              label="Header Text"
              value={settings.headerTextColor}
              onChange={(value) => updateSetting("headerTextColor", value)}
            />
            <ColorInput
              label="Header Border"
              value={settings.headerBorderColor}
              onChange={(value) => updateSetting("headerBorderColor", value)}
              allowRgba
            />
          </div>
        </div>

        {/* Footer Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Footer Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Footer Background"
              value={settings.footerBackgroundColor}
              onChange={(value) =>
                updateSetting("footerBackgroundColor", value)
              }
              allowRgba
            />
            <ColorInput
              label="Footer Text"
              value={settings.footerTextColor}
              onChange={(value) => updateSetting("footerTextColor", value)}
            />
            <ColorInput
              label="Footer Links"
              value={settings.footerLinkColor}
              onChange={(value) => updateSetting("footerLinkColor", value)}
            />
          </div>
        </div>

        {/* Background Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Background Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Main Background"
              value={settings.backgroundColor}
              onChange={(value) => updateSetting("backgroundColor", value)}
            />
            <ColorInput
              label="Surface Color"
              value={settings.surfaceColor}
              onChange={(value) => updateSetting("surfaceColor", value)}
              allowRgba
            />
          </div>
        </div>

        {/* Text Colors */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Text Colors</h3>
          <div className="space-y-4">
            <ColorInput
              label="Primary Text"
              value={settings.textPrimaryColor}
              onChange={(value) => updateSetting("textPrimaryColor", value)}
            />
            <ColorInput
              label="Secondary Text"
              value={settings.textSecondaryColor}
              onChange={(value) => updateSetting("textSecondaryColor", value)}
            />
          </div>
        </div>

        {/* Border and Shadow */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Border & Shadow</h3>
          <div className="space-y-4">
            <ColorInput
              label="Border Color"
              value={settings.borderColor}
              onChange={(value) => updateSetting("borderColor", value)}
              allowRgba
            />
            <ColorInput
              label="Shadow Color"
              value={settings.shadowColor}
              onChange={(value) => updateSetting("shadowColor", value)}
              allowRgba
            />
          </div>
        </div>

        {/* Effects */}
        <div className=" p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Effects</h3>
          <div className="space-y-4">
            <CheckboxInput
              label="3D Animations"
              checked={settings.animation3dEnabled}
              onChange={(checked) =>
                updateSetting("animation3dEnabled", checked)
              }
            />
            <CheckboxInput
              label="Glassmorphism"
              checked={settings.glassmorphismEnabled}
              onChange={(checked) =>
                updateSetting("glassmorphismEnabled", checked)
              }
            />
            <CheckboxInput
              label="Particle Effects"
              checked={settings.particleEffectsEnabled}
              onChange={(checked) =>
                updateSetting("particleEffectsEnabled", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowRgba?: boolean;
}

function ColorInput({
  label,
  value,
  onChange,
  allowRgba = false,
}: ColorInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
          placeholder={allowRgba ? "rgba(0,0,0,0.5)" : "#000000"}
        />
        {!allowRgba && (
          <input
            type="color"
            value={value.startsWith("#") ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
        )}
      </div>
    </div>
  );
}

interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxInput({ label, checked, onChange }: CheckboxInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
    </div>
  );
}
