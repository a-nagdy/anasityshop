"use client";

import ImageUploader from "@/app/components/ImageUploader";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  HomepageSettings,
  HeroBanner,
  Banner,
} from "../../services/settingsService";

export default function HomepageManagementPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "banners" | "settings">(
    "hero"
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { SettingsService } = await import(
        "../../services/settingsService"
      );

      const settingsData = await SettingsService.getHomepageSettings();
      setSettings(settingsData);
      toast.success("Homepage settings loaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load homepage settings";
      toast.error(`Settings Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { SettingsService } = await import(
        "../../services/settingsService"
      );

      // Validate settings before saving
      const validation = SettingsService.validateHomepageSettings(settings);
      if (!validation.valid) {
        validation.errors.forEach((error) => toast.error(error));
        return;
      }

      await SettingsService.updateHomepageSettings(settings);
      toast.success("Homepage settings saved successfully!");

      // Trigger homepage update event for global theme
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("homepageUpdated"));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save settings";
      toast.error(`Save Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const addHeroBanner = () => {
    if (!settings) return;

    const newBanner: HeroBanner = {
      title: "New Banner",
      subtitle: "Enter subtitle",
      backgroundImage: "",
      ctaText: "Learn More",
      ctaLink: "#",
      active: true,
      order: settings.heroBanners.length,
      showButton: true,
      showSecondaryButton: true,
    };

    setSettings({
      ...settings,
      heroBanners: [...settings.heroBanners, newBanner],
    });
    toast.success("New hero banner added");
  };

  const updateHeroBanner = (index: number, banner: HeroBanner) => {
    if (!settings) return;

    const updatedBanners = [...settings.heroBanners];
    updatedBanners[index] = banner;

    setSettings({
      ...settings,
      heroBanners: updatedBanners,
    });
  };

  const removeHeroBanner = (index: number) => {
    if (!settings) return;

    const updatedBanners = settings.heroBanners.filter((_, i) => i !== index);

    setSettings({
      ...settings,
      heroBanners: updatedBanners,
    });
    toast.success("Hero banner removed");
  };

  const addBanner = () => {
    if (!settings) return;

    const newBanner: Banner = {
      title: "New Promotional Banner",
      subtitle: "Enter subtitle",
      description: "Enter description",
      image: "",
      ctaText: "Shop Now",
      ctaLink: "#",
      active: true,
      order: (settings.banners || []).length,
      layout: "full-width",
    };

    setSettings({
      ...settings,
      banners: [...(settings.banners || []), newBanner],
    });
    toast.success("New promotional banner added");
  };

  const updateBanner = (index: number, banner: Banner) => {
    if (!settings) return;

    const updatedBanners = [...settings.banners];
    updatedBanners[index] = banner;

    setSettings({
      ...settings,
      banners: updatedBanners,
    });
  };

  const removeBanner = (index: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        banners: prev.banners.filter((_, i) => i !== index),
      };
    });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Failed to load homepage settings
          </h2>
          <button
            onClick={fetchSettings}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className=" py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Homepage Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage hero banners, promotional content, and homepage
                  settings
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  "Save All Changes"
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                {
                  id: "hero",
                  name: "Hero Banners",
                  icon: "🎯",
                  count: settings.heroBanners.length,
                },
                {
                  id: "banners",
                  name: "Promotional Banners",
                  icon: "📢",
                  count: settings.banners?.length || 0,
                },
                { id: "settings", name: "General Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "hero" | "banners" | "settings")
                  }
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "hero" && (
              <HeroBannersSection
                banners={settings.heroBanners}
                onAdd={addHeroBanner}
                onUpdate={updateHeroBanner}
                onRemove={removeHeroBanner}
              />
            )}

            {activeTab === "banners" && (
              <PromotionalBannersSection
                banners={settings.banners || []}
                onAdd={addBanner}
                onUpdate={updateBanner}
                onRemove={removeBanner}
              />
            )}

            {activeTab === "settings" && (
              <GeneralSettingsSection
                settings={settings}
                onUpdate={setSettings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Modern Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// Collapsible Card Component
function CollapsibleCard({
  title,
  subtitle,
  isOpen,
  onToggle,
  onRemove,
  children,
  status,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: React.ReactNode;
  status?: {
    active: boolean;
    showButton?: boolean;
    showSecondaryButton?: boolean;
  };
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggle}
                className="flex items-center gap-3 text-left flex-1 group"
              >
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              </button>

              {/* Status Indicators */}
              {status && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status.active ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={status.active ? "Active" : "Inactive"}
                  />
                  {status.showButton !== undefined && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.showButton ? "bg-blue-500" : "bg-gray-400"
                      }`}
                      title="Primary Button"
                    />
                  )}
                  {status.showSecondaryButton !== undefined && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.showSecondaryButton
                          ? "bg-purple-500"
                          : "bg-gray-400"
                      }`}
                      title="Secondary Button"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hero Banners Section Component
function HeroBannersSection({
  banners,
  onAdd,
  onUpdate,
  onRemove,
}: {
  banners: HeroBanner[];
  onAdd: () => void;
  onUpdate: (index: number, banner: HeroBanner) => void;
  onRemove: (index: number) => void;
}) {
  const [openBanners, setOpenBanners] = useState<number[]>([]);

  const toggleBanner = (index: number) => {
    setOpenBanners((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hero Banners
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage main hero banners with slider functionality
              </p>
            </div>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Hero Banner
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <CollapsibleCard
                key={index}
                title={banner.title || `Hero Banner ${index + 1}`}
                subtitle={banner.subtitle}
                isOpen={openBanners.includes(index)}
                onToggle={() => toggleBanner(index)}
                onRemove={() => onRemove(index)}
                status={{
                  active: banner.active,
                  showButton: banner.showButton,
                  showSecondaryButton: banner.showSecondaryButton,
                }}
              >
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={banner.title || ""}
                        onChange={(e) =>
                          onUpdate(index, { ...banner, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter banner title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={banner.subtitle || ""}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter banner subtitle"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CTA Text
                      </label>
                      <input
                        type="text"
                        value={banner.ctaText || ""}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            ctaText: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Button text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CTA Link
                      </label>
                      <input
                        type="text"
                        value={banner.ctaLink || ""}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            ctaLink: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Button destination URL"
                      />
                    </div>
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Image
                    </label>
                    <ImageUploader
                      onUpload={(url: string) => {
                        onUpdate(index, { ...banner, backgroundImage: url });
                      }}
                      folder="homepage/banners"
                      maxSize={5}
                    />
                    {banner.backgroundImage && (
                      <div className="mt-2 relative inline-block">
                        <Image
                          src={banner.backgroundImage}
                          alt="Banner background preview"
                          className="h-32 w-48 object-cover rounded-md border border-gray-200"
                          width={192}
                          height={192}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdate(index, { ...banner, backgroundImage: "" })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Settings
                    </h4>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={banner.active}
                        onChange={(checked) =>
                          onUpdate(index, { ...banner, active: checked })
                        }
                        label="Active"
                        description="Show this banner on the website"
                      />

                      <ToggleSwitch
                        checked={banner.showButton !== false}
                        onChange={(checked) =>
                          onUpdate(index, { ...banner, showButton: checked })
                        }
                        label="Show Primary Button"
                        description="Display the main CTA button"
                      />

                      <ToggleSwitch
                        checked={banner.showSecondaryButton !== false}
                        onChange={(checked) =>
                          onUpdate(index, {
                            ...banner,
                            showSecondaryButton: checked,
                          })
                        }
                        label="Show Secondary Button"
                        description="Display the secondary 'View Products' button"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={banner.order || 0}
                            onChange={(e) =>
                              onUpdate(index, {
                                ...banner,
                                order: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleCard>
            ))}

            {banners.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="max-w-sm mx-auto">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hero banners yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Create your first hero banner to showcase your main content
                    with a futuristic slider
                  </p>
                  <button
                    onClick={onAdd}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Your First Hero Banner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Promotional Banners Section Component (similar structure)
function PromotionalBannersSection({
  banners,
  onAdd,
  onUpdate,
  onRemove,
}: {
  banners: Banner[];
  onAdd: () => void;
  onUpdate: (index: number, banner: Banner) => void;
  onRemove: (index: number) => void;
}) {
  const [openBanners, setOpenBanners] = useState<number[]>([]);

  const toggleBanner = (index: number) => {
    setOpenBanners((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Promotional Banners
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Create promotional banners for special offers and campaigns
              </p>
            </div>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Banner
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <CollapsibleCard
                key={index}
                title={banner.title || `Banner ${index + 1}`}
                subtitle={banner.subtitle || `${banner.layout} layout`}
                isOpen={openBanners.includes(index)}
                onToggle={() => toggleBanner(index)}
                onRemove={() => onRemove(index)}
                status={{
                  active: banner.active,
                }}
              >
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={banner.title || ""}
                        onChange={(e) =>
                          onUpdate(index, { ...banner, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter banner title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Layout
                      </label>
                      <select
                        value={banner.layout}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            layout: e.target.value as
                              | "full-width"
                              | "split"
                              | "grid",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="full-width">Full Width</option>
                        <option value="split">Split Layout</option>
                        <option value="grid">Grid Layout</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={banner.subtitle || ""}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter subtitle"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CTA Text
                      </label>
                      <input
                        type="text"
                        value={banner.ctaText || ""}
                        onChange={(e) =>
                          onUpdate(index, {
                            ...banner,
                            ctaText: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Button text"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={banner.description || ""}
                      onChange={(e) =>
                        onUpdate(index, {
                          ...banner,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter banner description"
                    />
                  </div>

                  {/* CTA Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={banner.ctaLink || ""}
                      onChange={(e) =>
                        onUpdate(index, { ...banner, ctaLink: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Button destination URL"
                    />
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banner Image
                    </label>
                    <ImageUploader
                      onUpload={(url: string) => {
                        onUpdate(index, { ...banner, image: url });
                      }}
                      folder="homepage/promotional"
                      maxSize={5}
                    />
                    {banner.image && (
                      <div className="mt-2 relative inline-block">
                        <Image
                          src={banner.image}
                          alt="Banner preview"
                          className="h-32 w-48 object-cover rounded-md border border-gray-200"
                          width={192}
                          height={192}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdate(index, { ...banner, image: "" })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Settings
                    </h4>
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={banner.active}
                        onChange={(checked) =>
                          onUpdate(index, { ...banner, active: checked })
                        }
                        label="Active"
                        description="Show this banner on the website"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={banner.order || 0}
                            onChange={(e) =>
                              onUpdate(index, {
                                ...banner,
                                order: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleCard>
            ))}

            {banners.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="max-w-sm mx-auto">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No promotional banners yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Create promotional banners to highlight special offers,
                    campaigns, and important announcements
                  </p>
                  <button
                    onClick={onAdd}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Your First Banner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// General Settings Section Component
function GeneralSettingsSection({
  settings,
  onUpdate,
}: {
  settings: HomepageSettings;
  onUpdate: (settings: HomepageSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              General Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Configure global homepage display options and features
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {/* Display Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎨</span>
                Display Options
              </h3>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <ToggleSwitch
                  checked={settings.showFeaturedCategories}
                  onChange={(checked) =>
                    onUpdate({
                      ...settings,
                      showFeaturedCategories: checked,
                    })
                  }
                  label="Show Featured Categories"
                  description="Display a section highlighting your most important product categories"
                />

                <ToggleSwitch
                  checked={settings.showNewArrivals}
                  onChange={(checked) =>
                    onUpdate({ ...settings, showNewArrivals: checked })
                  }
                  label="Show New Arrivals"
                  description="Display recently added products on the homepage"
                />

                <ToggleSwitch
                  checked={settings.showBestsellers}
                  onChange={(checked) =>
                    onUpdate({ ...settings, showBestsellers: checked })
                  }
                  label="Show Bestsellers"
                  description="Showcase your most popular and best-selling products"
                />
              </div>
            </div>

            {/* Performance Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>⚡</span>
                Performance & Effects
              </h3>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <ToggleSwitch
                  checked={settings.animation3dEnabled}
                  onChange={(checked) =>
                    onUpdate({ ...settings, animation3dEnabled: checked })
                  }
                  label="Enable 3D Animations"
                  description="Add futuristic 3D effects and animations to enhance visual appeal"
                />
              </div>
            </div>

            {/* Theme Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🌈</span>
                Theme Colors
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.backgroundColor || "#0a0a0f"}
                        onChange={(e) =>
                          onUpdate({
                            ...settings,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={settings.backgroundColor || "#0a0a0f"}
                        onChange={(e) =>
                          onUpdate({
                            ...settings,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                        placeholder="#0a0a0f"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Main background color for dark sections
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.accentColor || "#00f5ff"}
                        onChange={(e) =>
                          onUpdate({ ...settings, accentColor: e.target.value })
                        }
                        className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={settings.accentColor || "#00f5ff"}
                        onChange={(e) =>
                          onUpdate({ ...settings, accentColor: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                        placeholder="#00f5ff"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Primary accent color for highlights and effects
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>💡</span>
                Tips & Best Practices
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li>
                  • Use high-quality images for hero banners (recommended:
                  1920x1080px)
                </li>
                <li>
                  • Keep banner titles concise and impactful (under 50
                  characters)
                </li>
                <li>
                  • Test different CTA button texts to optimize conversions
                </li>
                <li>• Enable 3D animations for a modern, futuristic feel</li>
                <li>• Use contrasting colors for better readability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
