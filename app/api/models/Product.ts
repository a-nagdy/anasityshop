import { ProductStatus } from '@/app/types/product';
import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';
import { determineProductStatus } from '../../../utils/productStatus';

// Helper function to generate SKU from product name
const generateSKU = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
      maxlength: [100, "A product name cannot exceed 100 characters"],
    },
    sku: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be positive"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price must be positive"],
    },
    status: {
      type: String,
      enum: ["in stock", "out of stock", "draft", "low stock"],
      default: "in stock",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "A product must belong to a category"],
    },
    quantity: {
      type: Number,
      required: [true, "A product must have a quantity"],
      min: [0, "Quantity must be positive"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    image: {
      type: String, // URL of the image
    },
    imageId: {
      type: String, // Cloudinary public_id for main image
    },
    images: [String], // URLs of additional images
    imageIds: [String], // Cloudinary public_ids for additional images
    shipping: {
      type: Boolean,
      default: true,
    },
    color: [String],
    size: [String],
    // Additional product specifications
    weight: {
      type: String,
      default: "N/A",
    },
    dimensions: {
      type: String,
      default: "N/A",
    },
    material: {
      type: String,
      default: "Standard",
    },
    warranty: {
      type: String,
      default: "1 Year",
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Create index for better search performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ sku: 1 });

// Pre-save hook to auto-generate SKU and update status
productSchema.pre("save", async function (next) {
  // Generate SKU if not provided (only for new documents)
  if (this.isNew && !this.sku) {
    const baseSku = generateSKU(this.name);
    let sku = baseSku;
    let counter = 1;

    // Check for duplicates and add incremental number
    while (await mongoose.models.Product.findOne({ sku })) {
      sku = `${baseSku}-${counter}`;
      counter++;
    }

    this.sku = sku;
  }

  // Update status if quantity or active state has changed
  if (this.isModified("quantity") || this.isModified("active")) {
    this.status = determineProductStatus(this.quantity, this.active) as ProductStatus;
  }

  next();
});

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product; 