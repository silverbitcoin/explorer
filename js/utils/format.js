/**
 * Format Utility - Data Formatting and Conversion
 * Production-grade formatting with precision handling
 */

const FormatUtil = (() => {
    /**
     * Convert Wei to SBTC with proper decimal formatting
     * @param {string|number|BigInt} wei - Amount in Wei
     * @param {number} decimals - Decimal places to display
     * @returns {string} Formatted SBTC amount
     */
    function formatBalance(wei, decimals = EXPLORER_CONFIG.FORMAT.BALANCE_DECIMALS) {
        try {
            if (!ValidationUtil.isValidWeiAmount(wei)) {
                return '0 SBTC';
            }
            
            let weiStr = typeof wei === 'bigint' ? wei.toString() : wei.toString();
            
            // Handle negative values
            const isNegative = weiStr.startsWith('-');
            if (isNegative) {
                weiStr = weiStr.substring(1);
            }
            
            // Pad with zeros if necessary
            const tokenDecimals = EXPLORER_CONFIG.TOKEN_DECIMALS;
            if (weiStr.length <= tokenDecimals) {
                weiStr = weiStr.padStart(tokenDecimals + 1, '0');
            }
            
            // Split into integer and decimal parts
            const integerPart = weiStr.substring(0, weiStr.length - tokenDecimals);
            let decimalPart = weiStr.substring(weiStr.length - tokenDecimals);
            
            // Trim trailing zeros from decimal part
            decimalPart = decimalPart.replace(/0+$/, '');
            
            // Format with commas
            const formattedInteger = parseInt(integerPart || '0').toLocaleString('en-US');
            
            // Combine parts
            let result = formattedInteger;
            if (decimalPart.length > 0) {
                const displayDecimals = Math.min(decimalPart.length, decimals);
                result += '.' + decimalPart.substring(0, displayDecimals);
            }
            
            if (isNegative) {
                result = '-' + result;
            }
            
            return result + ' ' + EXPLORER_CONFIG.TOKEN_NAME;
        } catch (error) {
            console.error('Error formatting balance:', error);
            return '0 SBTC';
        }
    }
    
    /**
     * Format gas price in MIST
     * @param {string|number|BigInt} mist - Fuel price in MIST
     * @param {number} decimals - Decimal places to display
     * @returns {string} Formatted fuel price
     */
    function formatGasPrice(mist, decimals = EXPLORER_CONFIG.FORMAT.GAS_PRICE_DECIMALS) {
        try {
            if (!ValidationUtil.isValidGasPrice(mist)) {
                return '0 MIST';
            }
            
            let mistStr = typeof mist === 'bigint' ? mist.toString() : mist.toString();
            
            // Convert MIST to SLVR (1 SLVR = 10^8 MIST)
            const slvrDecimals = 8;
            if (mistStr.length <= slvrDecimals) {
                mistStr = mistStr.padStart(slvrDecimals + 1, '0');
            }
            
            const integerPart = mistStr.substring(0, mistStr.length - slvrDecimals);
            let decimalPart = mistStr.substring(mistStr.length - slvrDecimals);
            
            // Trim trailing zeros
            decimalPart = decimalPart.replace(/0+$/, '');
            
            let result = parseInt(integerPart || '0').toLocaleString('en-US');
            if (decimalPart.length > 0) {
                const displayDecimals = Math.min(decimalPart.length, decimals);
                result += '.' + decimalPart.substring(0, displayDecimals);
            }
            
            return result + ' SLVR';
        } catch (error) {
            console.error('Error formatting fuel price:', error);
            return '0 SLVR';
        }
    }
    
    /**
     * Format address (SLVR addresses don't need checksum, already base58 encoded)
     * @param {string} address - Address to format
     * @returns {string} Formatted address
     */
    function formatAddress(address) {
        try {
            if (!ValidationUtil.isValidAddress(address)) {
                return address;
            }
            
            // SLVR addresses are already in base58 format with SLVR prefix
            // No checksum calculation needed (unlike Ethereum)
            return address.trim();
        } catch (error) {
            console.error('Error formatting address:', error);
            return address;
        }
    }
    
    /**
     * Format timestamp to ISO 8601 format
     * @param {number|string} unix - Unix timestamp in seconds
     * @returns {string} ISO 8601 formatted timestamp
     */
    function formatTimestamp(unix) {
        try {
            if (!ValidationUtil.isValidTimestamp(unix)) {
                return 'Invalid timestamp';
            }
            
            const timestamp = typeof unix === 'string' ? parseInt(unix, 10) : unix;
            const date = new Date(timestamp * 1000);
            
            return date.toISOString();
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Invalid timestamp';
        }
    }
    
    /**
     * Format timestamp to readable date string
     * @param {number|string} unix - Unix timestamp in seconds, milliseconds, or hex format
     * @returns {string} Readable date string
     */
    function formatTimestampReadable(unix) {
        try {
            if (unix === null || unix === undefined || unix === '') {
                return 'Invalid timestamp';
            }
            
            let timestamp;
            
            // Handle hex format (e.g., "0x6789abcd")
            if (typeof unix === 'string' && unix.startsWith('0x')) {
                timestamp = parseInt(unix, 16);
            } else if (typeof unix === 'string') {
                timestamp = parseInt(unix, 10);
            } else {
                timestamp = unix;
            }
            
            // Validate timestamp is a number
            if (isNaN(timestamp)) {
                return 'Invalid timestamp';
            }
            
            // WORKAROUND: RPC sometimes returns milliseconds instead of seconds
            // If timestamp is very large (> year 2100 in seconds), assume it's milliseconds
            if (timestamp > 4102444800) {
                console.warn('⚠️  Timestamp appears to be in milliseconds, converting to seconds:', timestamp);
                timestamp = Math.floor(timestamp / 1000);
            }
            
            // Validate timestamp is reasonable (between 1970 and year 2100)
            if (timestamp < 0 || timestamp > 4102444800) {
                console.warn('⚠️  Timestamp out of valid range:', timestamp);
                return 'Invalid timestamp';
            }
            
            // Create date from seconds (multiply by 1000 for milliseconds)
            const date = new Date(timestamp * 1000);
            
            // Validate date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid timestamp';
            }
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
        } catch (error) {
            console.error('Error formatting timestamp:', error, 'Input:', unix);
            return 'Invalid timestamp';
        }
    }
    
    /**
     * Format block number from hex to decimal
     * @param {string|number} blockNumber - Block number in hex or decimal
     * @returns {string} Formatted block number
     */
    function formatBlockNumber(blockNumber) {
        try {
            if (blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest') {
                return blockNumber;
            }
            
            if (typeof blockNumber === 'string' && blockNumber.startsWith('0x')) {
                const decimal = BigInt(blockNumber).toString();
                return parseInt(decimal).toLocaleString('en-US');
            }
            
            if (typeof blockNumber === 'number') {
                return blockNumber.toLocaleString('en-US');
            }
            
            if (typeof blockNumber === 'string') {
                return parseInt(blockNumber).toLocaleString('en-US');
            }
            
            return blockNumber.toString();
        } catch (error) {
            console.error('Error formatting block number:', error);
            return blockNumber.toString();
        }
    }
    
    /**
     * Format transaction hash with truncation option
     * @param {string} hash - Transaction hash
     * @param {boolean} truncate - Whether to truncate
     * @returns {string} Formatted hash
     */
    function formatHash(hash, truncate = false) {
        try {
            if (!ValidationUtil.isValidHexString(hash)) {
                return hash;
            }
            
            if (truncate) {
                return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
            }
            
            return hash;
        } catch (error) {
            console.error('Error formatting hash:', error);
            return hash;
        }
    }
    
    /**
     * Format percentage value
     * @param {number} value - Percentage value (0-100)
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    function formatPercentage(value, decimals = EXPLORER_CONFIG.FORMAT.PERCENTAGE_DECIMALS) {
        try {
            if (!ValidationUtil.isValidPercentage(value)) {
                return '0%';
            }
            
            return value.toFixed(decimals) + '%';
        } catch (error) {
            console.error('Error formatting percentage:', error);
            return '0%';
        }
    }
    
    /**
     * Format large number with commas
     * @param {number|string|BigInt} num - Number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        try {
            if (typeof num === 'bigint') {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            
            const parsed = typeof num === 'string' ? parseInt(num, 10) : num;
            if (isNaN(parsed)) return num.toString();
            
            return parsed.toLocaleString('en-US');
        } catch (error) {
            console.error('Error formatting number:', error);
            return num.toString();
        }
    }
    
    /**
     * Format transaction status
     * @param {Object} receipt - Transaction receipt
     * @returns {string} Transaction status
     */
    function formatTransactionStatus(receipt) {
        try {
            if (!receipt) return TRANSACTION_STATUS.UNKNOWN;
            
            if (receipt.status === '0x0' || receipt.status === 0) {
                return TRANSACTION_STATUS.FAILED;
            }
            
            if (receipt.status === '0x1' || receipt.status === 1) {
                return TRANSACTION_STATUS.CONFIRMED;
            }
            
            return TRANSACTION_STATUS.UNKNOWN;
        } catch (error) {
            console.error('Error formatting transaction status:', error);
            return TRANSACTION_STATUS.UNKNOWN;
        }
    }
    
    /**
     * Format confirmation count
     * @param {number|string} txBlock - Transaction block number
     * @param {number|string} currentBlock - Current block number
     * @returns {number} Confirmation count
     */
    function formatConfirmationCount(txBlock, currentBlock) {
        try {
            const txBlockNum = typeof txBlock === 'string' ? parseInt(txBlock, 16) : txBlock;
            const currentBlockNum = typeof currentBlock === 'string' ? parseInt(currentBlock, 16) : currentBlock;
            
            const confirmations = currentBlockNum - txBlockNum + 1;
            return Math.max(0, confirmations);
        } catch (error) {
            console.error('Error formatting confirmation count:', error);
            return 0;
        }
    }
    
    /**
     * Format transaction fee
     * @param {string|number|BigInt} gasUsed - Gas used
     * @param {string|number|BigInt} gasPrice - Gas price in Wei
     * @returns {string} Formatted fee
     */
    function formatTransactionFee(gasUsed, gasPrice) {
        try {
            if (!ValidationUtil.isValidWeiAmount(gasUsed) || !ValidationUtil.isValidWeiAmount(gasPrice)) {
                return '0 SBTC';
            }
            
            const gasUsedBig = typeof gasUsed === 'bigint' ? gasUsed : BigInt(gasUsed);
            const gasPriceBig = typeof gasPrice === 'bigint' ? gasPrice : BigInt(gasPrice);
            
            const fee = gasUsedBig * gasPriceBig;
            return formatBalance(fee);
        } catch (error) {
            console.error('Error formatting transaction fee:', error);
            return '0 SBTC';
        }
    }
    
    /**
     * Format duration in seconds to readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string} Readable duration
     */
    function formatDuration(seconds) {
        try {
            if (seconds < 60) {
                return seconds + 's';
            }
            
            if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60);
                return minutes + 'm';
            }
            
            if (seconds < 86400) {
                const hours = Math.floor(seconds / 3600);
                return hours + 'h';
            }
            
            const days = Math.floor(seconds / 86400);
            return days + 'd';
        } catch (error) {
            console.error('Error formatting duration:', error);
            return '0s';
        }
    }
    
    /**
     * Format bytes to readable size
     * @param {number} bytes - Size in bytes
     * @returns {string} Readable size
     */
    function formatBytes(bytes) {
        try {
            if (bytes === 0) return '0 B';
            
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        } catch (error) {
            console.error('Error formatting bytes:', error);
            return '0 B';
        }
    }
    
    return {
        formatBalance,
        formatGasPrice,
        formatAddress,
        formatTimestamp,
        formatTimestampReadable,
        formatBlockNumber,
        formatHash,
        formatPercentage,
        formatNumber,
        formatTransactionStatus,
        formatConfirmationCount,
        formatTransactionFee,
        formatDuration,
        formatBytes,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormatUtil;
}
