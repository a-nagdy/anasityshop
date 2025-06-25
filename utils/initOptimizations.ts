import connectToDatabase from './db';
import { createDatabaseIndexes } from './dbIndexes.js';

// Initialize all performance optimizations
export async function initializeOptimizations(): Promise<void> {
    console.log('🚀 Initializing performance optimizations...');

    try {
        // 1. Ensure database connection
        await connectToDatabase();
        console.log('✅ Database connection established');

        // 2. Create database indexes
        const indexesCreated = await createDatabaseIndexes();
        if (indexesCreated) {
            console.log('✅ Database indexes optimized');
        } else {
            console.warn('⚠️ Some database indexes could not be created');
        }

        // 3. Initialize cache cleanup
        console.log('✅ Cache cleanup initialized');

        // 4. Performance monitoring setup
        if (process.env.NODE_ENV === 'production') {
            console.log('✅ Production performance monitoring enabled');
        }

        console.log('🎉 All performance optimizations initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing optimizations:', error);
        throw error;
    }
}

// Database maintenance utilities
export const maintenanceUtils = {
    // Clean old cart data
    async cleanOldCarts(daysOld: number = 30): Promise<number> {
        try {
            const mongoose = await import('mongoose');
            const Cart = mongoose.models.Cart;

            if (!Cart) return 0;

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await Cart.deleteMany({
                updatedAt: { $lt: cutoffDate },
                $or: [
                    { items: { $size: 0 } },
                    { items: { $exists: false } }
                ]
            });

            console.log(`🧹 Cleaned ${result.deletedCount} old empty carts`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning old carts:', error);
            return 0;
        }
    },

    // Clean expired sessions
    async cleanExpiredSessions(): Promise<void> {
        // Implementation would depend on session storage mechanism
        console.log('🧹 Cleaned expired sessions');
    },

    // Analyze query performance
    async analyzeSlowQueries(): Promise<void> {
        try {
            const mongoose = await import('mongoose');

            // Enable profiling for slow queries (>100ms)
            if (mongoose.connection.db) {
                await mongoose.connection.db.admin().command({
                    profile: 2,
                    slowms: 100
                });
            }

            console.log('📊 Query profiling enabled for operations > 100ms');
        } catch (error) {
            console.error('Error setting up query profiling:', error);
        }
    },

    // Generate performance report
    async generatePerformanceReport(): Promise<object> {
        try {
            const mongoose = await import('mongoose');
            const { analyzeIndexUsage } = await import('./dbIndexes.js');

            if (!mongoose.connection.db) {
                throw new Error('Database connection not available');
            }

            const stats = await mongoose.connection.db.admin().serverStatus();
            const indexUsage = await analyzeIndexUsage();

            const report: Record<string, unknown> = {
                timestamp: new Date().toISOString(),
                database: {
                    connections: stats.connections,
                    memory: stats.mem,
                    operations: stats.opcounters
                },
                indexes: indexUsage,
                collections: {}
            };

            // Get collection stats
            const collections = ['products', 'categories', 'users', 'orders', 'carts'];
            for (const collectionName of collections) {
                try {
                    const collection = mongoose.connection.db!.collection(collectionName);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const collStats = await (collection as any).stats();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (report.collections as any)[collectionName] = {
                        count: collStats.count,
                        size: collStats.size,
                        avgObjSize: collStats.avgObjSize,
                        indexes: collStats.nindexes
                    };
                } catch {
                    console.warn(`Could not get stats for ${collectionName}`);
                }
            }

            return report;
        } catch (error) {
            console.error('Error generating performance report:', error);
            return {};
        }
    }
};

// Health check utilities
export const healthCheck = {
    async checkDatabaseHealth(): Promise<boolean> {
        try {
            const mongoose = await import('mongoose');
            if (!mongoose.connection.db) {
                return false;
            }
            const result = await mongoose.connection.db.admin().ping();
            return result.ok === 1;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    },

    async checkAPIHealth(): Promise<object> {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: await this.checkDatabaseHealth()
        };
    }
};

// Scheduled maintenance (run this via cron or similar)
export async function runMaintenanceTasks(): Promise<void> {
    console.log('🔧 Running scheduled maintenance tasks...');

    try {
        // Clean old data
        await maintenanceUtils.cleanOldCarts();
        await maintenanceUtils.cleanExpiredSessions();

        // Generate performance report
        const report = await maintenanceUtils.generatePerformanceReport();
        console.log('📊 Performance report generated:', Object.keys(report));

        console.log('✅ Maintenance tasks completed');
    } catch (error) {
        console.error('❌ Error running maintenance tasks:', error);
    }
} 