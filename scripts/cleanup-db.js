#!/usr/bin/env node

// Database cleanup script
// Run with: node scripts/cleanup-db.js

async function runCleanup() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Set up the environment
    process.env.NODE_ENV = process.env.NODE_ENV || "development";

    // Import the database utilities with require
    const {
      maintainDatabaseIndexes,
      cleanupConflictingIndexes,
      analyzeIndexUsage,
    } = await import("../utils/dbIndexes.js");

    console.log("\n🔍 Step 1: Analyzing current indexes...");
    const beforeReport = await analyzeIndexUsage();

    // Only show a summary to avoid too much output
    const summary = Object.keys(beforeReport).reduce((acc, collection) => {
      if (beforeReport[collection].totalIndexes) {
        acc[collection] = `${beforeReport[collection].totalIndexes} indexes`;
      } else if (beforeReport[collection].error) {
        acc[collection] = `Error: ${beforeReport[collection].error}`;
      }
      return acc;
    }, {});

    console.log("Current state:", summary);

    console.log("\n🧹 Step 2: Cleaning up conflicting indexes...");
    await cleanupConflictingIndexes();

    console.log("\n🔧 Step 3: Running full index maintenance...");
    const result = await maintainDatabaseIndexes();

    if (result.success) {
      console.log("\n✅ Database cleanup completed successfully!");

      // Show final summary
      const finalSummary = Object.keys(result.report).reduce(
        (acc, collection) => {
          if (result.report[collection].totalIndexes) {
            acc[
              collection
            ] = `${result.report[collection].totalIndexes} indexes`;
          } else if (result.report[collection].error) {
            acc[collection] = `Error: ${result.report[collection].error}`;
          }
          return acc;
        },
        {}
      );

      console.log("Final state:", finalSummary);
    } else {
      console.error("\n❌ Database cleanup failed:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the cleanup
runCleanup()
  .then(() => {
    console.log("\n🎉 Cleanup script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Cleanup script failed:", error);
    process.exit(1);
  });
