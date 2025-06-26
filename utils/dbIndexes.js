import mongoose from "mongoose";
import connectToDatabase from "./db";

// Database indexing for optimal performance
export async function createDatabaseIndexes() {
  try {
    await connectToDatabase();

    console.log("Creating database indexes for performance optimization...");

    // Helper function to safely create indexes
    const safeCreateIndex = async (collection, indexSpec, options = {}) => {
      try {
        // Generate a custom name to avoid conflicts
        const indexName = options.name || generateIndexName(indexSpec);

        // Check if index already exists
        const existingIndexes = await collection.indexes();
        const existingIndex = existingIndexes.find(
          (idx) =>
            idx.name === indexName ||
            JSON.stringify(idx.key) === JSON.stringify(indexSpec)
        );

        if (existingIndex) {
          console.log(`Index ${indexName} already exists, skipping...`);
          return;
        }

        await collection.createIndex(indexSpec, {
          ...options,
          name: indexName,
        });
        console.log(`✅ Created index: ${indexName}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          console.log(
            `⚠️ Index conflict for ${JSON.stringify(indexSpec)}, skipping...`
          );
        } else {
          console.error(
            `❌ Error creating index ${JSON.stringify(indexSpec)}:`,
            error.message
          );
        }
      }
    };

    // Generate index name from spec
    const generateIndexName = (indexSpec) => {
      return Object.keys(indexSpec)
        .map((key) => `${key}_${indexSpec[key]}`)
        .join("_")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .substring(0, 63); // MongoDB index name limit
    };

    // Product indexes
    const productModel = mongoose.models.Product;
    if (productModel) {
      const collection = productModel.collection;
      console.log("📦 Creating Product indexes...");

      // Text search index (avoid conflicts with existing)
      await safeCreateIndex(
        collection,
        { name: "text", description: "text" },
        {
          weights: { name: 10, description: 5 },
          name: "product_search_text",
        }
      );

      // Performance indexes
      await safeCreateIndex(
        collection,
        { status: 1, active: 1 },
        { name: "product_status_active" }
      );
      await safeCreateIndex(
        collection,
        { category: 1, active: 1, status: 1 },
        { name: "product_category_filter" }
      );
      await safeCreateIndex(
        collection,
        { featured: 1, active: 1, status: 1 },
        { name: "product_featured" }
      );
      await safeCreateIndex(
        collection,
        { createdAt: -1 },
        { name: "product_created_desc" }
      );
      await safeCreateIndex(
        collection,
        { price: 1, active: 1 },
        { name: "product_price_filter" }
      );
      await safeCreateIndex(
        collection,
        { sold: -1, active: 1 },
        { name: "product_bestsellers" }
      );
      await safeCreateIndex(
        collection,
        { discountPrice: 1, active: 1 },
        { name: "product_discounts" }
      );
    }

    // Category indexes
    const categoryModel = mongoose.models.Category;
    if (categoryModel) {
      const collection = categoryModel.collection;
      console.log("📁 Creating Category indexes...");

      await safeCreateIndex(
        collection,
        { parent: 1, active: 1 },
        { name: "category_parent_active" }
      );
      await safeCreateIndex(
        collection,
        { active: 1 },
        { name: "category_active" }
      );
      // Note: name and slug indexes are created by schema (unique: true)
    }

    // User indexes
    const userModel = mongoose.models.User;
    if (userModel) {
      const collection = userModel.collection;
      console.log("👤 Creating User indexes...");

      await safeCreateIndex(
        collection,
        { role: 1, active: 1 },
        { name: "user_role_active" }
      );
      await safeCreateIndex(
        collection,
        { createdAt: -1 },
        { name: "user_created_desc" }
      );
      // Note: email index is created by schema (unique: true)
    }

    // Order indexes
    const orderModel = mongoose.models.Order;
    if (orderModel) {
      const collection = orderModel.collection;
      console.log("📋 Creating Order indexes...");

      await safeCreateIndex(
        collection,
        { user: 1, status: 1 },
        { name: "order_user_status" }
      );
      await safeCreateIndex(
        collection,
        { status: 1, createdAt: -1 },
        { name: "order_status_date" }
      );
      await safeCreateIndex(
        collection,
        { isPaid: 1, status: 1, createdAt: -1 },
        { name: "order_payment_status" }
      );
      await safeCreateIndex(
        collection,
        { user: 1, createdAt: -1 },
        { name: "order_user_history" }
      );
    }

    // Cart indexes
    const cartModel = mongoose.models.Cart;
    if (cartModel) {
      const collection = cartModel.collection;
      console.log("🛒 Creating Cart indexes...");

      await safeCreateIndex(collection, { user: 1 }, { name: "cart_user" });
      await safeCreateIndex(
        collection,
        { updatedAt: -1 },
        { name: "cart_updated_desc" }
      );
    }

    // Address indexes
    const addressModel = mongoose.models.Address;
    if (addressModel) {
      const collection = addressModel.collection;
      console.log("📍 Creating Address indexes...");

      await safeCreateIndex(
        collection,
        { user: 1, isDefault: 1 },
        { name: "address_user_default" }
      );
      await safeCreateIndex(
        collection,
        { user: 1, type: 1 },
        { name: "address_user_type" }
      );
    }

    // Settings indexes
    const settingsModel = mongoose.models.Settings;
    if (settingsModel) {
      const collection = settingsModel.collection;
      console.log("⚙️ Creating Settings indexes...");

      await safeCreateIndex(
        collection,
        { name: 1 },
        { name: "settings_name", unique: true }
      );
    }

    console.log("✅ Database indexes created successfully");
    return true;
  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
    return false;
  }
}

// Clean up problematic indexes
export async function cleanupConflictingIndexes() {
  try {
    await connectToDatabase();
    console.log("🧹 Cleaning up conflicting database indexes...");

    const collections = [
      "products",
      "categories",
      "users",
      "orders",
      "carts",
      "addresses",
      "settings",
    ];

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        if (!collection) continue;

        console.log(`📋 Analyzing ${collectionName} collection...`);

        // Get all existing indexes
        const indexes = await collection.indexes();

        // Find problematic indexes (duplicates or conflicts)
        const problematicIndexes = [];
        const seenKeys = new Map();

        for (const index of indexes) {
          // Skip the default _id index
          if (index.name === "_id_") continue;

          const keyString = JSON.stringify(index.key);

          if (seenKeys.has(keyString)) {
            // Found duplicate key, mark the newer one for deletion
            problematicIndexes.push(index.name);
            console.log(
              `⚠️ Found duplicate index: ${index.name} (key: ${keyString})`
            );
          } else {
            seenKeys.set(keyString, index.name);
          }

          // Check for indexes that might conflict with schema definitions
          if (
            index.unique &&
            ((collectionName === "users" && "email" in index.key) ||
              (collectionName === "categories" &&
                ("name" in index.key || "slug" in index.key)) ||
              (collectionName === "settings" && "name" in index.key))
          ) {
            // These should be managed by schema, check if they conflict
            if (!index.background) {
              console.log(
                `⚠️ Non-background unique index found: ${index.name}`
              );
            }
          }
        }

        // Drop problematic indexes
        for (const indexName of problematicIndexes) {
          try {
            await collection.dropIndex(indexName);
            console.log(`🗑️ Dropped conflicting index: ${indexName}`);
          } catch (dropError) {
            console.log(
              `⚠️ Could not drop index ${indexName}:`,
              dropError.message
            );
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${collectionName}:`, error.message);
      }
    }

    console.log("✅ Index cleanup completed");
    return true;
  } catch (error) {
    console.error("❌ Error cleaning up indexes:", error);
    return false;
  }
}

// Analyze and report on index usage
export async function analyzeIndexUsage() {
  try {
    await connectToDatabase();
    console.log("📊 Analyzing index usage...");

    const collections = [
      "products",
      "categories",
      "users",
      "orders",
      "carts",
      "addresses",
      "settings",
    ];
    const report = {};

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        if (!collection) continue;

        const indexes = await collection.indexes();
        let stats = [];
        try {
          stats = await collection.aggregate([{ $indexStats: {} }]).toArray();
        } catch (error) {
          console.warn(
            `Could not get index stats for ${collectionName}:`,
            error.message
          );
        }

        report[collectionName] = {
          totalIndexes: indexes.length,
          indexes: indexes.map((idx) => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique || false,
            background: idx.background || false,
            usage: stats.find((s) => s.name === idx.name)?.accesses?.ops || 0,
          })),
        };

        console.log(`📋 ${collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${collectionName}:`, error.message);
        report[collectionName] = { error: error.message };
      }
    }

    return report;
  } catch (error) {
    console.error("❌ Error analyzing indexes:", error);
    return {};
  }
}

// Clean up unused indexes (use with caution in production)
export async function cleanupUnusedIndexes() {
  try {
    await connectToDatabase();
    console.log("🧹 Cleaning up unused indexes...");

    const collections = [
      "products",
      "categories",
      "users",
      "orders",
      "carts",
      "addresses",
      "settings",
    ];
    let totalDropped = 0;

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        if (!collection) continue;

        let indexStats = [];
        try {
          indexStats = await collection
            .aggregate([{ $indexStats: {} }])
            .toArray();
        } catch (error) {
          console.warn(
            `Could not get index stats for ${collectionName}:`,
            error.message
          );
        }

        // Find indexes that have never been used (0 operations)
        const unusedIndexes = indexStats.filter(
          (stat) => stat.accesses?.ops === 0 && stat.name !== "_id_"
        );

        console.log(
          `📋 ${collectionName}: ${unusedIndexes.length} unused indexes found`
        );

        for (const unusedIndex of unusedIndexes) {
          try {
            await collection.dropIndex(unusedIndex.name);
            console.log(
              `🗑️ Dropped unused index: ${unusedIndex.name} from ${collectionName}`
            );
            totalDropped++;
          } catch (dropError) {
            console.log(
              `⚠️ Could not drop ${unusedIndex.name}:`,
              dropError.message
            );
          }
        }
      } catch (error) {
        console.warn(
          `⚠️ Could not clean indexes for ${collectionName}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ Cleanup completed. Dropped ${totalDropped} unused indexes.`
    );
    return totalDropped;
  } catch (error) {
    console.error("❌ Error cleaning up indexes:", error);
    return 0;
  }
}

// Main function to run complete index maintenance
export async function maintainDatabaseIndexes() {
  console.log("🔧 Starting database index maintenance...");

  try {
    // Step 1: Clean up conflicts
    await cleanupConflictingIndexes();

    // Step 2: Create optimized indexes
    await createDatabaseIndexes();

    // Step 3: Analyze current state
    const report = await analyzeIndexUsage();

    console.log("✅ Database index maintenance completed!");
    return { success: true, report };
  } catch (error) {
    console.error("❌ Index maintenance failed:", error);
    return { success: false, error: error.message };
  }
}
