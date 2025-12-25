/**
 * Storage Utility - Local Storage Management
 * Production-grade storage operations with error handling
 */

const StorageUtil = (() => {
    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} Stored value or default
     */
    function getItem(key, defaultValue = null) {
        try {
            const prefixedKey = EXPLORER_CONFIG.STORAGE.PREFIX + key;
            const item = localStorage.getItem(prefixedKey);
            
            if (item === null) {
                return defaultValue;
            }
            
            // Try to parse as JSON
            try {
                return JSON.parse(item);
            } catch (e) {
                // Return as string if not valid JSON
                return item;
            }
        } catch (error) {
            console.error('Storage getItem error:', error);
            return defaultValue;
        }
    }
    
    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    function setItem(key, value) {
        try {
            const prefixedKey = EXPLORER_CONFIG.STORAGE.PREFIX + key;
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(prefixedKey, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded:', error);
                // Try to clear old cache entries
                clearOldEntries();
                try {
                    const prefixedKey = EXPLORER_CONFIG.STORAGE.PREFIX + key;
                    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
                    localStorage.setItem(prefixedKey, serialized);
                    return true;
                } catch (retryError) {
                    console.error('Storage setItem retry failed:', retryError);
                    return false;
                }
            }
            console.error('Storage setItem error:', error);
            return false;
        }
    }
    
    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    function removeItem(key) {
        try {
            const prefixedKey = EXPLORER_CONFIG.STORAGE.PREFIX + key;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('Storage removeItem error:', error);
            return false;
        }
    }
    
    /**
     * Clear all items with explorer prefix
     * @returns {boolean} Success status
     */
    function clear() {
        try {
            const prefix = EXPLORER_CONFIG.STORAGE.PREFIX;
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
    
    /**
     * Get all items with explorer prefix
     * @returns {Object} All stored items
     */
    function getAll() {
        try {
            const prefix = EXPLORER_CONFIG.STORAGE.PREFIX;
            const items = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const cleanKey = key.substring(prefix.length);
                    items[cleanKey] = getItem(cleanKey);
                }
            }
            
            return items;
        } catch (error) {
            console.error('Storage getAll error:', error);
            return {};
        }
    }
    
    /**
     * Check if key exists in storage
     * @param {string} key - Storage key
     * @returns {boolean} Key exists
     */
    function hasItem(key) {
        try {
            const prefixedKey = EXPLORER_CONFIG.STORAGE.PREFIX + key;
            return localStorage.getItem(prefixedKey) !== null;
        } catch (error) {
            console.error('Storage hasItem error:', error);
            return false;
        }
    }
    
    /**
     * Get storage size in bytes
     * @returns {number} Total size
     */
    function getSize() {
        try {
            let size = 0;
            const prefix = EXPLORER_CONFIG.STORAGE.PREFIX;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    size += key.length + (value ? value.length : 0);
                }
            }
            
            return size;
        } catch (error) {
            console.error('Storage getSize error:', error);
            return 0;
        }
    }
    
    /**
     * Clear old cache entries when quota exceeded
     * @private
     */
    function clearOldEntries() {
        try {
            const prefix = EXPLORER_CONFIG.STORAGE.PREFIX + 'cache_';
            const entries = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    try {
                        const parsed = JSON.parse(value);
                        if (parsed.timestamp) {
                            entries.push({ key, timestamp: parsed.timestamp });
                        }
                    } catch (e) {
                        // Skip invalid entries
                    }
                }
            }
            
            // Sort by timestamp and remove oldest 25%
            entries.sort((a, b) => a.timestamp - b.timestamp);
            const toRemove = Math.ceil(entries.length * 0.25);
            
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(entries[i].key);
            }
        } catch (error) {
            console.error('Error clearing old entries:', error);
        }
    }
    
    /**
     * Add item to search history
     * @param {string} query - Search query
     */
    function addSearchHistory(query) {
        try {
            if (!query || query.trim().length === 0) return;
            
            const history = getItem(EXPLORER_CONFIG.STORAGE.SEARCH_HISTORY_KEY, []);
            const filtered = history.filter(item => item !== query);
            const updated = [query, ...filtered].slice(0, EXPLORER_CONFIG.STORAGE.MAX_SEARCH_HISTORY);
            
            setItem(EXPLORER_CONFIG.STORAGE.SEARCH_HISTORY_KEY, updated);
        } catch (error) {
            console.error('Error adding search history:', error);
        }
    }
    
    /**
     * Get search history
     * @returns {Array} Search history
     */
    function getSearchHistory() {
        return getItem(EXPLORER_CONFIG.STORAGE.SEARCH_HISTORY_KEY, []);
    }
    
    /**
     * Clear search history
     */
    function clearSearchHistory() {
        removeItem(EXPLORER_CONFIG.STORAGE.SEARCH_HISTORY_KEY);
    }
    
    return {
        getItem,
        setItem,
        removeItem,
        clear,
        getAll,
        hasItem,
        getSize,
        addSearchHistory,
        getSearchHistory,
        clearSearchHistory,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtil;
}
