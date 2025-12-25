/**
 * Validation Utility - Input and Data Validation
 * Production-grade validation with comprehensive error handling
 */

const ValidationUtil = (() => {
    /**
     * Validate 512-bit SLVR address format
     * @param {string} address - Address to validate
     * @returns {boolean} Valid address
     */
    function isValidAddress(address) {
        if (typeof address !== 'string') return false;
        
        // Check format: SLVR prefix followed by 86-88 base58 characters (512-bit quantum-resistant)
        const addressRegex = /^SLVR[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{86,88}$/;
        return addressRegex.test(address);
    }
    
    /**
     * Validate block number (hex or decimal)
     * @param {string|number} blockNumber - Block number to validate
     * @returns {boolean} Valid block number
     */
    function isValidBlockNumber(blockNumber) {
        if (blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest') {
            return true;
        }
        
        if (typeof blockNumber === 'number') {
            return Number.isInteger(blockNumber) && blockNumber >= 0;
        }
        
        if (typeof blockNumber === 'string') {
            // Check if hex format
            if (blockNumber.startsWith('0x')) {
                const hexRegex = /^0x[0-9a-fA-F]+$/;
                if (!hexRegex.test(blockNumber)) return false;
                
                try {
                    const num = BigInt(blockNumber);
                    return num >= 0n;
                } catch (e) {
                    return false;
                }
            }
            
            // Check if decimal format
            const decimalRegex = /^\d+$/;
            if (decimalRegex.test(blockNumber)) {
                try {
                    const num = BigInt(blockNumber);
                    return num >= 0n;
                } catch (e) {
                    return false;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Validate transaction hash format (512-bit SHA512)
     * @param {string} hash - Transaction hash to validate
     * @returns {boolean} Valid transaction hash
     */
    function isValidTransactionHash(hash) {
        if (typeof hash !== 'string') return false;
        
        // Check format: 0x followed by 128 hex characters (512-bit SHA512)
        const hashRegex = /^0x[0-9a-fA-F]{128}$/;
        return hashRegex.test(hash);
    }
    
    /**
     * Validate block hash format (512-bit SHA512)
     * @param {string} hash - Block hash to validate
     * @returns {boolean} Valid block hash
     */
    function isValidBlockHash(hash) {
        if (typeof hash !== 'string') return false;
        
        // Check format: 0x followed by 128 hex characters (512-bit SHA512)
        const hashRegex = /^0x[0-9a-fA-F]{128}$/;
        return hashRegex.test(hash);
    }
    
    /**
     * Validate hex string format
     * @param {string} str - String to validate
     * @returns {boolean} Valid hex string
     */
    function isValidHexString(str) {
        if (typeof str !== 'string') return false;
        
        if (!str.startsWith('0x')) return false;
        
        const hexRegex = /^0x[0-9a-fA-F]*$/;
        return hexRegex.test(str);
    }
    
    /**
     * Validate Wei amount (large number)
     * @param {string|number|BigInt} amount - Amount in Wei
     * @returns {boolean} Valid Wei amount
     */
    function isValidWeiAmount(amount) {
        try {
            if (typeof amount === 'string') {
                const num = BigInt(amount);
                return num >= 0n;
            }
            
            if (typeof amount === 'number') {
                return Number.isInteger(amount) && amount >= 0;
            }
            
            if (typeof amount === 'bigint') {
                return amount >= 0n;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate gas price
     * @param {string|number} gasPrice - Gas price in Wei
     * @returns {boolean} Valid gas price
     */
    function isValidGasPrice(gasPrice) {
        return isValidWeiAmount(gasPrice);
    }
    
    /**
     * Validate gas limit
     * @param {string|number} gasLimit - Gas limit
     * @returns {boolean} Valid gas limit
     */
    function isValidGasLimit(gasLimit) {
        try {
            if (typeof gasLimit === 'string') {
                const num = BigInt(gasLimit);
                return num > 0n && num <= BigInt('0xffffffffffffffff');
            }
            
            if (typeof gasLimit === 'number') {
                return Number.isInteger(gasLimit) && gasLimit > 0 && gasLimit <= Number.MAX_SAFE_INTEGER;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate nonce
     * @param {string|number} nonce - Nonce value
     * @returns {boolean} Valid nonce
     */
    function isValidNonce(nonce) {
        try {
            if (typeof nonce === 'string') {
                const num = BigInt(nonce);
                return num >= 0n;
            }
            
            if (typeof nonce === 'number') {
                return Number.isInteger(nonce) && nonce >= 0;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate chain ID
     * @param {string|number} chainId - Chain ID
     * @returns {boolean} Valid chain ID
     */
    function isValidChainId(chainId) {
        try {
            if (typeof chainId === 'string') {
                const num = BigInt(chainId);
                return num > 0n;
            }
            
            if (typeof chainId === 'number') {
                return Number.isInteger(chainId) && chainId > 0;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate timestamp
     * @param {number|string} timestamp - Unix timestamp (decimal or hex)
     * @returns {boolean} Valid timestamp
     */
    function isValidTimestamp(timestamp) {
        try {
            // Allow null/undefined to be handled by format function
            if (timestamp === null || timestamp === undefined || timestamp === '') {
                return false;
            }
            
            let num;
            
            if (typeof timestamp === 'string') {
                // Handle hex format
                if (timestamp.startsWith('0x')) {
                    num = parseInt(timestamp, 16);
                } else {
                    num = parseInt(timestamp, 10);
                }
                
                if (isNaN(num)) return false;
            } else if (typeof timestamp === 'number') {
                num = timestamp;
                if (!Number.isInteger(num)) return false;
            } else {
                return false;
            }
            
            // Allow timestamps from 0 (genesis/epoch) to year 2100
            // Year 2100 in seconds: 4102444800
            const maxTimestamp = 4102444800;
            
            return num >= 0 && num <= maxTimestamp;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate search query
     * @param {string} query - Search query
     * @returns {Object} Validation result with type and isValid
     */
    function validateSearchQuery(query) {
        if (typeof query !== 'string' || query.trim().length === 0) {
            return { isValid: false, type: QUERY_TYPES.UNKNOWN };
        }
        
        const trimmed = query.trim();
        
        // Check if block number (decimal)
        if (/^\d+$/.test(trimmed)) {
            return { isValid: true, type: QUERY_TYPES.BLOCK_NUMBER, value: trimmed };
        }
        
        // Check if block hash
        if (isValidBlockHash(trimmed)) {
            return { isValid: true, type: QUERY_TYPES.BLOCK_HASH, value: trimmed };
        }
        
        // Check if transaction hash
        if (isValidTransactionHash(trimmed)) {
            return { isValid: true, type: QUERY_TYPES.TRANSACTION_HASH, value: trimmed };
        }
        
        // Check if address
        if (isValidAddress(trimmed)) {
            return { isValid: true, type: QUERY_TYPES.ADDRESS, value: trimmed };
        }
        
        return { isValid: false, type: QUERY_TYPES.UNKNOWN };
    }
    
    /**
     * Validate transaction object
     * @param {Object} tx - Transaction object
     * @returns {boolean} Valid transaction
     */
    function isValidTransaction(tx) {
        if (typeof tx !== 'object' || tx === null) return false;
        
        // Check required fields
        if (!isValidAddress(tx.from)) return false;
        if (tx.to && !isValidAddress(tx.to)) return false;
        if (!isValidWeiAmount(tx.value)) return false;
        if (!isValidGasLimit(tx.gas)) return false;
        if (!isValidGasPrice(tx.gasPrice)) return false;
        if (!isValidNonce(tx.nonce)) return false;
        
        return true;
    }
    
    /**
     * Validate block object
     * @param {Object} block - Block object
     * @returns {boolean} Valid block
     */
    function isValidBlock(block) {
        if (typeof block !== 'object' || block === null) return false;
        
        // Check required fields
        if (!isValidBlockNumber(block.number)) return false;
        if (!isValidBlockHash(block.hash)) return false;
        if (block.parentHash && !isValidBlockHash(block.parentHash)) return false;
        if (!isValidTimestamp(block.timestamp)) return false;
        if (!isValidAddress(block.miner)) return false;
        
        return true;
    }
    
    /**
     * Validate account object
     * @param {Object} account - Account object
     * @returns {boolean} Valid account
     */
    function isValidAccount(account) {
        if (typeof account !== 'object' || account === null) return false;
        
        // Check required fields
        if (!isValidAddress(account.address)) return false;
        if (!isValidWeiAmount(account.balance)) return false;
        if (!isValidNonce(account.nonce)) return false;
        
        return true;
    }
    
    /**
     * Validate percentage value
     * @param {number} value - Percentage value
     * @returns {boolean} Valid percentage
     */
    function isValidPercentage(value) {
        if (typeof value !== 'number') return false;
        return value >= 0 && value <= 100;
    }
    
    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} Valid URL
     */
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Validate JSON string
     * @param {string} str - String to validate
     * @returns {boolean} Valid JSON
     */
    function isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    return {
        isValidAddress,
        isValidBlockNumber,
        isValidTransactionHash,
        isValidBlockHash,
        isValidHexString,
        isValidWeiAmount,
        isValidGasPrice,
        isValidGasLimit,
        isValidNonce,
        isValidChainId,
        isValidTimestamp,
        validateSearchQuery,
        isValidTransaction,
        isValidBlock,
        isValidAccount,
        isValidPercentage,
        isValidUrl,
        isValidJson,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtil;
}
