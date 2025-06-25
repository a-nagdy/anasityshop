import mongoose from "mongoose";
import connectToDatabase from "./db";

// Database indexing for optimal performance
export async function createDatabaseIndexes() {
  try {
    await connectToDatabase();

    console.log("Creating database indexes for performance optimization...");

    // Product indexes
    const productModel = mongoose.models.Product;
    if (productModel) {
      const collection = productModel.collection;

      // Text search index
      await collection.createIndex(
        { name: "text", description: "text" },
        { weights: { name: 10, description: 5 } }
      );

      // Individual field indexes
      await collection.createIndex({ active: 1, status: 1 });
      await collection.createIndex({ category: 1, active: 1 });
      await collection.createIndex({ featured: 1, active: 1 });
      await collection.createIndex({ slug: 1 });
      await collection.createIndex({ createdAt: -1 });
      await collection.createIndex({ price: 1 });
      await collection.createIndex({ sold: -1 });
      await collection.createIndex({ name: 1 });

      // Compound indexes for common queries
      await collection.createIndex({ active: 1, status: 1, category: 1 });
      await collection.createIndex({ featured: 1, active: 1, status: 1 });
      await collection.createIndex({ active: 1, status: 1, createdAt: -1 });
      await collection.createIndex({ discountPrice: 1, active: 1 });
    }

    // Category indexes
    const categoryModel = mongoose.models.Category;
    if (categoryModel) {
      const collection = categoryModel.collection;
      await collection.createIndex({ active: 1 });
      await collection.createIndex({ parent: 1 });
      await collection.createIndex({ slug: 1 });
      await collection.createIndex({ name: 1 });
      await collection.createIndex({ parent: 1, active: 1 });
      await collection.createIndex({ active: 1, name: 1 });
    }

    // User indexes
    const userModel = mongoose.models.User;
    if (userModel) {
      const collection = userModel.collection;
      await collection.createIndex({ email: 1 });
      await collection.createIndex({ role: 1 });
      await collection.createIndex({ active: 1 });
      await collection.createIndex({ createdAt: -1 });
      await collection.createIndex({ email: 1, active: 1 });
      await collection.createIndex({ role: 1, active: 1 });
    }

    // Order indexes
    const orderModel = mongoose.models.Order;
    if (orderModel) {
      const collection = orderModel.collection;
      await collection.createIndex({ user: 1 });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ isPaid: 1 });
      await collection.createIndex({ isDelivered: 1 });
      await collection.createIndex({ createdAt: -1 });
      await collection.createIndex({ orderNumber: 1 });
      await collection.createIndex({ status: 1, createdAt: -1 });
      await collection.createIndex({ user: 1, status: 1 });
      await collection.createIndex({ user: 1, createdAt: -1 });
      await collection.createIndex({ isPaid: 1, status: 1 });
      await collection.createIndex({ isPaid: 1, status: 1, createdAt: -1 });
    }

    // Cart indexes
    const cartModel = mongoose.models.Cart;
    if (cartModel) {
      const collection = cartModel.collection;
      await collection.createIndex({ user: 1 });
      await collection.createIndex({ updatedAt: -1 });
      await collection.createIndex({ updatedAt: 1 });
    }

    // Address indexes
    const addressModel = mongoose.models.Address;
    if (addressModel) {
      const collection = addressModel.collection;
      await collection.createIndex({ user: 1 });
      await collection.createIndex({ isDefault: 1 });
      await collection.createIndex({ type: 1 });
      await collection.createIndex({ user: 1, isDefault: 1 });
      await collection.createIndex({ user: 1, type: 1 });
    }

    // Settings indexes
    const settingsModel = mongoose.models.Settings;
    if (settingsModel) {
      const collection = settingsModel.collection;
      await collection.createIndex({ name: 1 });
    }

    console.log("Database indexes created successfully");

    return true;
  } catch (error) {
    console.error("Error creating database indexes:", error);
    return false;
  }
}

// Analyze and report on index usage
export async function analyzeIndexUsage() {
  try {
    await connectToDatabase();

    const collections = ["products", "categories", "users", "orders", "carts"];
    const indexStats = {};

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        const stats = await collection.indexStats();
        indexStats[collectionName] = stats;
      } catch (error) {
        console.warn(`Could not get index stats for ${collectionName}:`, error);
      }
    }

    return indexStats;
  } catch (error) {
    console.error("Error analyzing index usage:", error);
    return {};
  }
}

// Clean up unused indexes
export async function cleanupUnusedIndexes() {
  try {
    await connectToDatabase();

    const collections = ["products", "categories", "users", "orders", "carts"];

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        const indexStats = await collection?.indexStats();

        // Find indexes that have never been used
        const unusedIndexes = indexStats.filter(
          (stat) => stat.accesses?.ops === 0 && stat.name !== "_id_" // Never drop the default _id index
        );

        for (const unusedIndex of unusedIndexes) {
          console.log(
            `Dropping unused index: ${unusedIndex.name} from ${collectionName}`
          );
          await collection.dropIndex(unusedIndex.name);
        }
      } catch (error) {
        console.warn(`Could not clean indexes for ${collectionName}:`, error);
      }
    }

    return true;
  } catch (error) {
    console.error("Error cleaning up indexes:", error);
    return false;
  }
}
