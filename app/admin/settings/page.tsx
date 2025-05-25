"use client";

import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  HomepageSettingsValue,
  SettingsDocument,
} from "../../api/models/Settings";
import HomepageSettingsForm from "./components/HomepageSettingsForm";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("homepage");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/homepage");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (settingsData: HomepageSettingsValue) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/homepage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setSettings(data);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Settings
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("homepage")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "homepage"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Homepage
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            General
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {activeTab === "homepage" && (
          <HomepageSettingsForm
            settings={settings?.value as HomepageSettingsValue}
            onSave={handleSaveSettings}
            isSaving={isSaving}
          />
        )}
        {activeTab === "general" && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              General settings coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
