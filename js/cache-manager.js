/**
 * Cache Manager - Response Caching System
 * Production-grade caching with TTL and localStorage management
 */

const CacheManager = (() => {
    const CACHE_PREFIX = EXPLORER_CONFIG.STORAGE.PREFIX + 'cache_';
    
    /**
     * Create cache entry with metadata
     * @private
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     * @returns {Object} Cache entry
     */
    function createCacheEntry(value, ttl) {
        return {
            value: value,
            timestamp: Date.now(),
            ttl: ttl,
            expires: Date.now() + ttl,
        };
    }
    
    /**
     * Check if cache entry is expired
     * @private
     * @param {Object} entry - Cache entry
     * @returns {boolean} Is expired
     */
    function isExpired(entry) {
        if (!entry || !entry.expires) {
            return true;
        }
        return Date.now() > entry.expires;
    }
    
    /**
     * Set cache value with TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     * @returns {boolean} Success status
     */
    function set(key, value, ttl = EXPLORER_CONFIG.CACHE_TTL.NETWORK_INFO) {
        try {
            if (!key || ttl <= 0) {
                return false;
            }
            
            const entry = createCacheEntry(value, ttl);
            const cacheKey = CACHE_PREFIX + key;
            
            return StorageUtil.setItem(cacheKey, entry);
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    
    /**
     * Get cache value if not expired
     * @param {string} key - Cache key
     * @returns {*} Cached value or null
     */
    function get(key) {
        try {
            if (!key) {
                return null;
            }
            
            const cacheKey = CACHE_PREFIX + key;
            const entry = StorageUtil.getItem(cacheKey);
            
            if (!entry) {
                return null;
            }
            
            // Check if expired
            if (isExpired(entry)) {
                removeItem(key);
                return null;
            }
            
            return entry.value;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    
    /**
     * Remove cache entry
     * @param {string} key - Cache key
     * @returns {boolean} Success status
     */
    function removeItem(key) {
        try {
            if (!key) {
                return false;
            }
            
            const cacheKey = CACHE_PREFIX + key;
            return StorageUtil.removeItem(cacheKey);
        } catch (error) {
            console.error('Cache removeItem error:', error);
            return false;
        }
    }
    
    /**
     * Check if cache key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} Key exists and valid
     */
    function has(key) {
        try {
            if (!key) {
                return false;
            }
            
            const cacheKey = CACHE_PREFIX + key;
            const entry = StorageUtil.getItem(cacheKey);
            
            if (!entry) {
                return false;
            }
            
            if (isExpired(entry)) {
                removeItem(key);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Cache has error:', error);
            return false;
        }
    }
    
    /**
     * Get cache entry metadata
     * @param {string} key - Cache key
     * @returns {Object} Cache metadata or null
     */
    function getMetadata(key) {
        try {
            if (!key) {
                return null;
            }
            
            const cacheKey = CACHE_PREFIX + key;
            const entry = StorageUtil.getItem(cacheKey);
            
            if (!entry) {
                return null;
            }
            
            return {
                timestamp: entry.timestamp,
                ttl: entry.ttl,
                expires: entry.expires,
                age: Date.now() - entry.timestamp,
                isExpired: isExpired(entry),
            };
        } catch (error) {
            console.error('Cache getMetadata error:', error);
            return null;
        }
    }
    
    /**
     * Clear all cache entries
     * @returns {boolean} Success status
     */
    function clear() {
        try {
            const allItems = StorageUtil.getAll();
            let cleared = 0;
            
            for (const key in allItems) {
                if (key.startsWith('cache_')) {
                    if (StorageUtil.removeItem(key)) {
                        cleared++;
                    }
                }
            }
            
            return cleared > 0;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }
    
    /**
     * Clear expired cache entries
     * @returns {number} Number of entries cleared
     */
    function clearExpired() {
        try {
            const allItems = StorageUtil.getAll();
            let cleared = 0;
            
            for (const key in allItems) {
                if (key.startsWith('cache_')) {
                    const cacheKey = CACHE_PREFIX + key.substring(6);
                    const entry = StorageUtil.getItem(cacheKey);
                    
                    if (entry && isExpired(entry)) {
                        if (StorageUtil.removeItem(cacheKey)) {
                            cleared++;
                        }
                    }
                }
            }
            
            return cleared;
        } catch (error) {
            console.error('Cache clearExpired error:', error);
            return 0;
        }
    }
    
    /**
     * Invalidate cache by pattern
     * @param {string|RegExp} pattern - Pattern to match keys
     * @returns {number} Number of entries invalidated
     */
    function invalidateByPattern(pattern) {
        try {
            const allItems = StorageUtil.getAll();
            let invalidated = 0;
            const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
            
            for (const key in allItems) {
                if (key.startsWith('cache_')) {
                    const cleanKey = key.substring(6);
                    if (regex.test(cleanKey)) {
                        if (StorageUtil.removeItem(cleanKey)) {
                            invalidated++;
                        }
                    }
                }
            }
            
            return invalidated;
        } catch (error) {
            console.error('Cache invalidateByPattern error:', error);
            return 0;
        }
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    function getStats() {
        try {
            const allItems = StorageUtil.getAll();
            let totalEntries = 0;
            let expiredEntries = 0;
            let totalSize = 0;
            let oldestEntry = null;
            let newestEntry = null;
            
            for (const key in allItems) {
                if (key.startsWith('cache_')) {
                    const cacheKey = CACHE_PREFIX + key.substring(6);
                    const entry = StorageUtil.getItem(cacheKey);
                    
                    if (entry) {
                        totalEntries++;
                        
                        if (isExpired(entry)) {
                            expiredEntries++;
                        }
                        
                        // Estimate size
                        totalSize += JSON.stringify(entry).length;
                        
                        // Track oldest and newest
                        if (!oldestEntry || entry.timestamp < oldestEntry.timestamp) {
                            oldestEntry = entry;
                        }
                        if (!newestEntry || entry.timestamp > newestEntry.timestamp) {
                            newestEntry = entry;
                        }
                    }
                }
            }
            
            return {
                totalEntries,
                expiredEntries,
                validEntries: totalEntries - expiredEntries,
                totalSize,
                oldestEntry: oldestEntry ? oldestEntry.timestamp : null,
                newestEntry: newestEntry ? newestEntry.timestamp : null,
            };
        } catch (error) {
            console.error('Cache getStats error:', error);
            return {
                totalEntries: 0,
                expiredEntries: 0,
                validEntries: 0,
                totalSize: 0,
            };
        }
    }
    
    /**
     * Warm cache with common queries
     * @returns {Promise<void>}
     */
    async function warmCache() {
        try {
            const commonQueries = [
                { method: SILVER_RPC_METHODS.GET_BLOCK_COUNT, params: [] },
                { method: SILVER_RPC_METHODS.GET_DIFFICULTY, params: [] },
                { method: SILVER_RPC_METHODS.GET_BLOCKCHAIN_INFO, params: [] },
                { method: SILVER_RPC_METHODS.GET_NETWORK_INFO, params: [] },
            ];
            
            for (const query of commonQueries) {
                try {
                    await RPCClient.call(query.method, query.params);
                } catch (error) {
                    console.error('Error warming cache for', query.method, error);
                }
            }
        } catch (error) {
            console.error('Cache warmCache error:', error);
        }
    }
    
    /**
     * Optimize cache by removing expired entries
     * @returns {Object} Optimization results
     */
    function optimize() {
        try {
            const statsBefore = getStats();
            const cleared = clearExpired();
            const statsAfter = getStats();
            
            return {
                cleared,
                before: statsBefore,
                after: statsAfter,
                sizeSaved: statsBefore.totalSize - statsAfter.totalSize,
            };
        } catch (error) {
            console.error('Cache optimize error:', error);
            return { cleared: 0 };
        }
    }
    
    // Set up periodic cleanup
    setInterval(() => {
        clearExpired();
    }, 60000); // Every minute
    
    return {
        set,
        get,
        removeItem,
        has,
        getMetadata,
        clear,
        clearExpired,
        invalidateByPattern,
        getStats,
        warmCache,
        optimize,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
}
