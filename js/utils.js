/**
 * Utility functions for SilverBitcoin Explorer
 */

/**
 * Format large numbers for display
 * @param {number|string} num - Number to format
 * @param {number} decimals - Decimal places to show
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return 'N/A';
    
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(number)) return 'N/A';
    
    // For very large numbers, use scientific notation
    if (Math.abs(number) >= 1e12) {
        return number.toExponential(decimals);
    }
    
    // Format with commas
    return number.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format currency values
 * @param {number|string} value - Value to format
 * @param {string} currency - Currency symbol
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted currency
 */
function formatCurrency(value, currency = 'SBTC', decimals = 4) {
    const formattedValue = formatNumber(value, decimals);
    return `${formattedValue} ${currency}`;
}

/**
 * Format hash/address for display (truncate middle)
 * @param {string} hash - Hash to format
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Formatted hash
 */
function formatHash(hash, startChars = 6, endChars = 4) {
    if (!hash) return 'N/A';
    if (hash.length <= (startChars + endChars + 3)) return hash;
    return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

/**
 * Format timestamp to human-readable date
 * @param {number|string} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Convert to milliseconds if in seconds
    const ms = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    
    try {
        return new Date(ms).toLocaleString();
    } catch (e) {
        return 'Invalid Date';
    }
}

/**
 * Format time difference from now
 * @param {number|string} timestamp - Unix timestamp in seconds
 * @returns {string} Relative time string
 */
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Convert to milliseconds if in seconds
    const ms = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}

/**
 * Validate 512-bit SLVR address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
function validateAddress(address) {
    if (!address) return false;
    if (typeof address !== 'string') return false;
    if (!address.startsWith('SLVR')) return false;
    if (address.length < 90 || address.length > 92) return false;
    
    // Base58 validation (no 0, O, I, l)
    const base58Regex = /^SLVR[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{86,88}$/;
    return base58Regex.test(address);
}

/**
 * Validate 512-bit transaction hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid
 */
function validateTxHash(hash) {
    if (!hash) return false;
    if (typeof hash !== 'string') return false;
    if (!hash.startsWith('0x')) return false;
    if (hash.length !== 130) return false;
    
    // 512-bit SHA512 hash validation (128 hex chars + 0x)
    const hexRegex = /^0x[a-fA-F0-9]{128}$/;
    return hexRegex.test(hash);
}

/**
 * Validate block number
 * @param {number|string} blockNumber - Block number to validate
 * @returns {boolean} True if valid
 */
function validateBlockNumber(blockNumber) {
    if (blockNumber === null || blockNumber === undefined) return false;
    
    const num = typeof blockNumber === 'string' ? parseInt(blockNumber, 10) : blockNumber;
    return !isNaN(num) && num >= 0;
}

/**
 * Convert MIST to SLVR
 * @param {number|string} mist - Amount in MIST (smallest unit)
 * @returns {number} Amount in SLVR
 */
function weiToEther(mist) {
    if (!mist) return 0;
    
    const mistNum = typeof mist === 'string' ? BigInt(mist) : BigInt(mist);
    const slvr = Number(mistNum) / 1e8;
    return slvr;
}

/**
 * Convert SLVR to MIST
 * @param {number} slvr - Amount in SLVR
 * @returns {string} Amount in MIST (as string to handle large numbers)
 */
function etherToWei(slvr) {
    if (!slvr) return '0';
    
    const mist = slvr * 1e8;
    return Math.floor(mist).toString();
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function to limit rate of execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(decimals)}%`;
}

// Export all utility functions