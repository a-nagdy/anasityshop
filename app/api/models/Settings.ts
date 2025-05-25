import mongoose, { Schema, Document } from 'mongoose';

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
}

// Define the interface for Settings document
export interface SettingsDocument extends Document {
  name: string;
  value: HomepageSettingsValue | any;
  createdAt: Date;
  updatedAt: Date;
}

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
  animation3dEnabled: { type: Boolean, default: true }
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
export default Settings;
