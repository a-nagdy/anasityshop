import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for Website Theme Settings
export interface WebsiteThemeSettings {
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

// Define the interface for the Hero Banner
export interface HeroBanner {
  _id?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageId?: string;
  active: boolean;
}

// Define the interface for Category Slider
export interface CategorySlider {
  _id?: string;
  title: string;
  subtitle?: string;
  categories: string[]; // Array of category IDs
  active: boolean;
}

// Define the interface for Product Slider
export interface ProductSlider {
  _id?: string;
  title: string;
  subtitle?: string;
  products: string[]; // Array of product IDs
  type: 'featured' | 'bestseller' | 'new' | 'sale' | 'custom';
  active: boolean;
}

// Define the interface for Homepage Settings
export interface HomepageSettingsValue {
  heroBanners: HeroBanner[];
  categorySliders: CategorySlider[];
  productSliders: ProductSlider[];
  showFeaturedCategories: boolean;
  showNewArrivals: boolean;
  showBestsellers: boolean;
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
  emailConfig?: {
    gmailUser?: string;
    gmailAppPassword?: string;
  };
}

// Define the interface for Settings document
export interface SettingsDocument extends Document {
  name: string;
  value: WebsiteThemeSettings | HomepageSettingsValue | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Website Theme Settings
const WebsiteThemeSettingsSchema = new Schema({
  // Primary Colors
  primaryColor: { type: String, default: '#00f5ff' },
  secondaryColor: { type: String, default: '#8b5cf6' },
  accentColor: { type: String, default: '#ec4899' },

  // Button Colors
  buttonPrimaryColor: { type: String, default: '#00f5ff' },
  buttonSecondaryColor: { type: String, default: '#8b5cf6' },
  buttonHoverColor: { type: String, default: '#00d9ff' },
  buttonTextColor: { type: String, default: '#ffffff' },

  // Header Colors
  headerBackgroundColor: { type: String, default: 'rgba(10, 10, 15, 0.95)' },
  headerTextColor: { type: String, default: '#ffffff' },
  headerBorderColor: { type: String, default: 'rgba(0, 245, 255, 0.2)' },

  // Footer Colors
  footerBackgroundColor: { type: String, default: 'rgba(10, 10, 15, 0.98)' },
  footerTextColor: { type: String, default: '#ffffff' },
  footerLinkColor: { type: String, default: '#00f5ff' },

  // Background Colors
  backgroundColor: { type: String, default: '#0a0a0f' },
  surfaceColor: { type: String, default: 'rgba(255, 255, 255, 0.05)' },

  // Text Colors
  textPrimaryColor: { type: String, default: '#ffffff' },
  textSecondaryColor: { type: String, default: '#a1a1aa' },

  // Border and Shadow
  borderColor: { type: String, default: 'rgba(255, 255, 255, 0.1)' },
  shadowColor: { type: String, default: 'rgba(0, 245, 255, 0.2)' },

  // Effects
  animation3dEnabled: { type: Boolean, default: true },
  glassmorphismEnabled: { type: Boolean, default: true },
  particleEffectsEnabled: { type: Boolean, default: true }
});

// Define the schema for Hero Banner
const HeroBannerSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  image: { type: String, required: true },
  imageId: { type: String },
  active: { type: Boolean, default: true }
});

// Define the schema for Category Slider
const CategorySliderSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  active: { type: Boolean, default: true }
});

// Define the schema for Product Slider
const ProductSliderSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  type: {
    type: String,
    enum: ['featured', 'bestseller', 'new', 'sale', 'custom'],
    default: 'featured'
  },
  active: { type: Boolean, default: true }
});

// Define the schema for Homepage Settings
const HomepageSettingsSchema = new Schema({
  heroBanners: [HeroBannerSchema],
  categorySliders: [CategorySliderSchema],
  productSliders: [ProductSliderSchema],
  showFeaturedCategories: { type: Boolean, default: true },
  showNewArrivals: { type: Boolean, default: true },
  showBestsellers: { type: Boolean, default: true },
  backgroundColor: { type: String, default: '#ffffff' },
  accentColor: { type: String, default: '#3b82f6' },
  animation3dEnabled: { type: Boolean, default: true },
  emailConfig: {
    gmailUser: { type: String },
    gmailAppPassword: { type: String }
  }
});

// Define the schema for Settings
const SettingsSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

// Create and export the Settings model
const Settings = mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', SettingsSchema);
export const HomepageSettings = mongoose.models.HomepageSettings || mongoose.model('HomepageSettings', HomepageSettingsSchema);
export const WebsiteThemeSettings = mongoose.models.WebsiteThemeSettings || mongoose.model('WebsiteThemeSettings', WebsiteThemeSettingsSchema);
export default Settings;
