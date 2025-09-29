const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/elyanashop"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 32,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    hasChildren: {
      type: Boolean,
      default: false,
    },
    image: String,
    imageId: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
      required: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["in stock", "out of stock", "draft", "low stock"],
      default: "in stock",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    image: String,
    imageId: String,
    images: [String],
    imageIds: [String],
    shipping: {
      type: Boolean,
      default: true,
    },
    color: [String],
    size: [String],
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
  { timestamps: true }
);

// Pre-save hooks
categorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const generateSKU = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
};

productSchema.pre("save", async function (next) {
  if (this.isNew && !this.sku) {
    const baseSku = generateSKU(this.name);
    let sku = baseSku;
    let counter = 1;

    while (await mongoose.models.Product.findOne({ sku })) {
      sku = `${baseSku}-${counter}`;
      counter++;
    }

    this.sku = sku;
  }

  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  next();
});

// Models
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

// Sample Categories Data
const categoriesData = [
  // Parent Categories
  {
    name: "Electronics",
    description: "Latest electronic devices and gadgets",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=300&fit=crop",
    parent: null,
  },
  {
    name: "Clothing",
    description: "Fashion and apparel for all occasions",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop",
    parent: null,
  },
  {
    name: "Home & Garden",
    description: "Everything for your home and garden",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
    parent: null,
  },
  {
    name: "Sports & Fitness",
    description: "Sports equipment and fitness gear",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
    parent: null,
  },
  {
    name: "Books & Media",
    description: "Books, movies, music and more",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop",
    parent: null,
  },
];

// Subcategories will be added after parent categories are created
const subcategoriesData = [
  // Electronics subcategories
  {
    name: "Smartphones",
    description: "Latest smartphones and mobile devices",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=300&fit=crop",
    parentName: "Electronics",
  },
  {
    name: "Laptops",
    description: "Laptops and portable computers",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=300&fit=crop",
    parentName: "Electronics",
  },
  {
    name: "Audio & Headphones",
    description: "Speakers, headphones and audio equipment",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop",
    parentName: "Electronics",
  },

  // Clothing subcategories
  {
    name: "Men's Clothing",
    description: "Fashion for men",
    image:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&h=300&fit=crop",
    parentName: "Clothing",
  },
  {
    name: "Women's Clothing",
    description: "Fashion for women",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=300&fit=crop",
    parentName: "Clothing",
  },
  {
    name: "Shoes & Accessories",
    description: "Footwear and fashion accessories",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=300&fit=crop",
    parentName: "Clothing",
  },

  // Home & Garden subcategories
  {
    name: "Furniture",
    description: "Home and office furniture",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
    parentName: "Home & Garden",
  },
  {
    name: "Kitchen & Dining",
    description: "Kitchen appliances and dining accessories",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop",
    parentName: "Home & Garden",
  },
];

// Sample Products Data
const productsData = [
  // Electronics - Smartphones
  {
    name: "iPhone 15 Pro Max",
    description:
      "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features a 6.7-inch Super Retina XDR display with ProMotion technology.",
    price: 1199.99,
    discountPrice: 1099.99,
    quantity: 50,
    categoryName: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
    color: [
      "Titanium Natural",
      "Titanium Blue",
      "Titanium White",
      "Titanium Black",
    ],
    size: ["128GB", "256GB", "512GB", "1TB"],
    featured: true,
    weight: "221 grams",
    dimensions: "6.30 × 3.02 × 0.32 inches",
    warranty: "1 Year Apple Warranty",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Premium Android flagship with S Pen, 200MP camera, and AI-powered features. Built with titanium for durability.",
    price: 1299.99,
    quantity: 45,
    categoryName: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop",
    color: ["Titanium Gray", "Titanium Black", "Titanium Violet"],
    size: ["256GB", "512GB", "1TB"],
    featured: true,
    weight: "232 grams",
    dimensions: "6.40 × 3.11 × 0.34 inches",
  },

  // Electronics - Laptops
  {
    name: "MacBook Pro 16-inch M3",
    description:
      "Powerful laptop with M3 chip, Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for professionals and creators.",
    price: 2499.99,
    discountPrice: 2299.99,
    quantity: 25,
    categoryName: "Laptops",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
    color: ["Space Gray", "Silver"],
    size: ["512GB", "1TB", "2TB"],
    featured: true,
    weight: "4.7 pounds",
    dimensions: "14.01 × 9.77 × 0.66 inches",
    warranty: "1 Year Apple Warranty",
  },
  {
    name: "Dell XPS 13 Plus",
    description:
      "Ultra-thin laptop with 12th Gen Intel processors, stunning InfinityEdge display, and premium build quality.",
    price: 1399.99,
    quantity: 30,
    categoryName: "Laptops",
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=500&fit=crop",
    color: ["Platinum Silver", "Graphite"],
    size: ["512GB SSD", "1TB SSD"],
    weight: "2.73 pounds",
    dimensions: "11.63 × 7.84 × 0.57 inches",
  },

  // Electronics - Audio
  {
    name: "AirPods Pro (3rd Gen)",
    description:
      "Premium wireless earbuds with active noise cancellation, spatial audio, and adaptive transparency mode.",
    price: 249.99,
    discountPrice: 199.99,
    quantity: 100,
    categoryName: "Audio & Headphones",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop",
    color: ["White"],
    featured: true,
    weight: "5.4 grams each",
    warranty: "1 Year Apple Warranty",
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description:
      "Industry-leading noise canceling wireless headphones with premium sound quality and 30-hour battery life.",
    price: 399.99,
    discountPrice: 349.99,
    quantity: 60,
    categoryName: "Audio & Headphones",
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop",
    color: ["Black", "Silver"],
    weight: "250 grams",
    warranty: "1 Year Sony Warranty",
  },

  // Clothing - Men's
  {
    name: "Premium Cotton T-Shirt",
    description:
      "100% organic cotton t-shirt with perfect fit and superior comfort. Sustainably made with eco-friendly materials.",
    price: 29.99,
    discountPrice: 24.99,
    quantity: 200,
    categoryName: "Men's Clothing",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    color: ["White", "Black", "Navy", "Gray", "Olive"],
    size: ["XS", "S", "M", "L", "XL", "XXL"],
    material: "100% Organic Cotton",
    weight: "150 grams",
  },
  {
    name: "Slim Fit Denim Jeans",
    description:
      "Classic slim-fit jeans made from premium denim with stretch for comfort and style.",
    price: 89.99,
    discountPrice: 69.99,
    quantity: 150,
    categoryName: "Men's Clothing",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    color: ["Dark Blue", "Light Blue", "Black"],
    size: ["28", "30", "32", "34", "36", "38"],
    material: "98% Cotton, 2% Elastane",
  },

  // Clothing - Women's
  {
    name: "Elegant Summer Dress",
    description:
      "Flowing summer dress perfect for casual and semi-formal occasions. Made with breathable fabric.",
    price: 79.99,
    discountPrice: 59.99,
    quantity: 120,
    categoryName: "Women's Clothing",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    color: ["Floral Blue", "Solid Black", "Sunset Orange", "Mint Green"],
    size: ["XS", "S", "M", "L", "XL"],
    material: "95% Viscose, 5% Elastane",
  },
  {
    name: "Professional Blazer",
    description:
      "Tailored blazer perfect for office and professional settings. Classic design with modern fit.",
    price: 129.99,
    quantity: 80,
    categoryName: "Women's Clothing",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
    color: ["Navy", "Black", "Charcoal"],
    size: ["XS", "S", "M", "L", "XL"],
    material: "70% Polyester, 30% Wool",
  },

  // Home & Garden - Furniture
  {
    name: "Modern Coffee Table",
    description:
      "Sleek modern coffee table with tempered glass top and solid wood legs. Perfect centerpiece for any living room.",
    price: 299.99,
    discountPrice: 249.99,
    quantity: 40,
    categoryName: "Furniture",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
    color: ["Natural Wood", "Dark Walnut", "White Oak"],
    dimensions: '48" × 24" × 16"',
    material: "Tempered Glass, Solid Wood",
    weight: "45 pounds",
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.",
    price: 399.99,
    discountPrice: 329.99,
    quantity: 35,
    categoryName: "Furniture",
    image:
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=500&fit=crop",
    color: ["Black", "Gray", "Blue"],
    dimensions: '26" × 26" × 40-44"',
    material: "Mesh, Steel, Foam",
    warranty: "5 Year Warranty",
  },

  // Sports & Fitness
  {
    name: "Professional Yoga Mat",
    description:
      "Premium non-slip yoga mat with superior grip and cushioning. Perfect for all types of yoga and exercise.",
    price: 49.99,
    discountPrice: 39.99,
    quantity: 80,
    categoryName: "Sports & Fitness",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
    color: ["Purple", "Blue", "Pink", "Black", "Green"],
    dimensions: '72" × 24" × 0.25"',
    material: "TPE (Thermoplastic Elastomer)",
    weight: "2.5 pounds",
  },
];

// Seeding functions
async function clearDatabase() {
  console.log("🧹 Clearing existing data...");
  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log("✅ Database cleared");
}

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  // First, create parent categories
  const parentCategories = {};
  for (const categoryData of categoriesData) {
    try {
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      parentCategories[savedCategory.name] = savedCategory._id;
      console.log(`✅ Created parent category: ${savedCategory.name}`);
    } catch (error) {
      console.error(
        `❌ Error creating category ${categoryData.name}:`,
        error.message
      );
    }
  }

  // Then, create subcategories
  for (const subcategoryData of subcategoriesData) {
    try {
      const parentId = parentCategories[subcategoryData.parentName];
      if (!parentId) {
        console.error(
          `❌ Parent category not found: ${subcategoryData.parentName}`
        );
        continue;
      }

      const subcategory = new Category({
        ...subcategoryData,
        parent: parentId,
      });
      delete subcategory.parentName; // Remove the helper field

      const savedSubcategory = await subcategory.save();
      parentCategories[savedSubcategory.name] = savedSubcategory._id;

      // Update parent's hasChildren status
      await Category.findByIdAndUpdate(parentId, { hasChildren: true });

      console.log(`✅ Created subcategory: ${savedSubcategory.name}`);
    } catch (error) {
      console.error(
        `❌ Error creating subcategory ${subcategoryData.name}:`,
        error.message
      );
    }
  }

  return parentCategories;
}

async function seedProducts(categories) {
  console.log("🌱 Seeding products...");

  for (const productData of productsData) {
    try {
      const categoryId = categories[productData.categoryName];
      if (!categoryId) {
        console.error(`❌ Category not found: ${productData.categoryName}`);
        continue;
      }

      const product = new Product({
        ...productData,
        category: categoryId,
      });
      delete product.categoryName; // Remove the helper field

      const savedProduct = await product.save();
      console.log(`✅ Created product: ${savedProduct.name}`);
    } catch (error) {
      console.error(
        `❌ Error creating product ${productData.name}:`,
        error.message
      );
    }
  }
}

async function seedDatabase() {
  try {
    await connectToDatabase();

    console.log("🚀 Starting database seeding...");

    // Clear existing data
    await clearDatabase();

    // Seed categories
    const categories = await seedCategories();

    // Seed products
    await seedProducts(categories);

    console.log("🎉 Database seeding completed successfully!");

    // Print summary
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    console.log("\n📊 Summary:");
    console.log(`📁 Categories created: ${categoryCount}`);
    console.log(`📦 Products created: ${productCount}`);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, clearDatabase };
