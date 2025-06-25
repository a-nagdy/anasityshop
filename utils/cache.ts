interface CacheItem {
    data: unknown;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private cache: Map<string, CacheItem> = new Map();
    private defaultTTL: number = 300000; // 5 minutes in milliseconds

    set(key: string, data: unknown, ttl?: number): void {
        const item: CacheItem = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        };
        this.cache.set(key, item);
    }

    get(key: string): unknown | null {
        const item = this.cache.get(key);
        if (!item) return null;

        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    size(): number {
        return this.cache.size;
    }

    // Clean up expired items
    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new MemoryCache();

// Cache utility functions
export const cacheHelper = {
    // Generate cache key
    generateKey: (...parts: (string | number)[]): string => {
        return parts.join(':');
    },

    // Cache wrapper for async functions
    withCache: async <T>(
        key: string,
        fn: () => Promise<T>,
        ttl?: number
    ): Promise<T> => {
        const cached = cache.get(key);
        if (cached) return cached as T;

        const result = await fn();
        cache.set(key, result, ttl);
        return result;
    },

    // Invalidate cache by patterns
    invalidateByPattern: (pattern: string): void => {
        cache.invalidatePattern(pattern);
    },

    // Cache keys for different resources
    keys: {
        products: (filters?: unknown) =>
            cacheHelper.generateKey('products', filters ? JSON.stringify(filters) : 'all'),
        product: (id: string) =>
            cacheHelper.generateKey('product', id),
        categories: (filters?: unknown) =>
            cacheHelper.generateKey('categories', filters ? JSON.stringify(filters) : 'all'),
        category: (id: string) =>
            cacheHelper.generateKey('category', id),
        stats: () =>
            cacheHelper.generateKey('stats', 'summary'),
        homepage: () =>
            cacheHelper.generateKey('homepage', 'data')
    }
};

// Auto cleanup every 10 minutes
setInterval(() => {
    cache.cleanup();
}, 600000); 