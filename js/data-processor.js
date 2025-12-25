/**
 * Data Processor - Data Parsing, Validation, and Formatting
 * Production-grade data processing with comprehensive error handling
 */

const DataProcessor = (() => {
    /**
     * Parse and validate address
     * @param {string} address - Address to parse
     * @returns {Object} Parsed address with validation
     */
    function parseAddress(address) {
        try {
            if (!address || typeof address !== 'string') {
                return { valid: false, error: 'Invalid address type' };
            }
            
            const trimmed = address.trim();
            
            if (!ValidationUtil.isValidAddress(trimmed)) {
                return { valid: false, error: EXPLORER_CONFIG.ERRORS.INVALID_ADDRESS };
            }
            
            return {
                valid: true,
                address: trimmed,
                checksummed: FormatUtil.formatAddress(trimmed),
                lowercase: trimmed.toLowerCase(),
            };
        } catch (error) {
            console.error('Error parsing address:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse block number (hex or decimal)
     * @param {string|number} blockNumber - Block number to parse
     * @returns {Object} Parsed block number
     */
    function parseBlockNumber(blockNumber) {
        try {
            if (blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest') {
                return { valid: true, value: blockNumber, type: 'tag' };
            }
            
            if (!ValidationUtil.isValidBlockNumber(blockNumber)) {
                return { valid: false, error: EXPLORER_CONFIG.ERRORS.INVALID_BLOCK_NUMBER };
            }
            
            let decimal;
            let hex;
            
            if (typeof blockNumber === 'string' && blockNumber.startsWith('0x')) {
                hex = blockNumber;
                decimal = BigInt(blockNumber).toString();
            } else {
                decimal = blockNumber.toString();
                hex = '0x' + BigInt(blockNumber).toString(16);
            }
            
            return {
                valid: true,
                decimal: parseInt(decimal),
                hex: hex,
                bigint: BigInt(decimal),
                type: 'number',
            };
        } catch (error) {
            console.error('Error parsing block number:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse transaction hash
     * @param {string} hash - Transaction hash to parse
     * @returns {Object} Parsed transaction hash
     */
    function parseTransactionHash(hash) {
        try {
            if (!hash || typeof hash !== 'string') {
                return { valid: false, error: 'Invalid hash type' };
            }
            
            const trimmed = hash.trim();
            
            if (!ValidationUtil.isValidTransactionHash(trimmed)) {
                return { valid: false, error: EXPLORER_CONFIG.ERRORS.INVALID_TRANSACTION_HASH };
            }
            
            return {
                valid: true,
                hash: trimmed,
                short: trimmed.substring(0, 10) + '...' + trimmed.substring(trimmed.length - 8),
            };
        } catch (error) {
            console.error('Error parsing transaction hash:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse balance from MIST (smallest unit)
     * @param {string|number|BigInt} mist - Balance in MIST (10^-8 SLVR)
     * @returns {Object} Parsed balance
     */
    function parseBalance(mist) {
        try {
            if (!ValidationUtil.isValidWeiAmount(mist)) {
                return { valid: false, error: 'Invalid balance amount' };
            }
            
            const mistBig = typeof mist === 'bigint' ? mist : BigInt(mist);
            const tokenDecimals = EXPLORER_CONFIG.TOKEN_DECIMALS;
            const divisor = BigInt(10) ** BigInt(tokenDecimals);
            
            const slvr = mistBig / divisor;
            const remainder = mistBig % divisor;
            
            return {
                valid: true,
                mist: mistBig.toString(),
                slvr: slvr.toString(),
                remainder: remainder.toString(),
                formatted: FormatUtil.formatBalance(mist),
            };
        } catch (error) {
            console.error('Error parsing balance:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse fuel price (transaction cost)
     * @param {string|number|BigInt} mist - Fuel price in MIST
     * @returns {Object} Parsed fuel price
     */
    function parseGasPrice(mist) {
        try {
            if (!ValidationUtil.isValidGasPrice(mist)) {
                return { valid: false, error: 'Invalid fuel price' };
            }
            
            const mistBig = typeof mist === 'bigint' ? mist : BigInt(mist);
            const mistDivisor = BigInt(10) ** BigInt(8);
            
            const slvr = mistBig / mistDivisor;
            const remainder = mistBig % mistDivisor;
            
            return {
                valid: true,
                mist: mistBig.toString(),
                slvr: slvr.toString(),
                remainder: remainder.toString(),
                formatted: FormatUtil.formatGasPrice(mist),
            };
        } catch (error) {
            console.error('Error parsing fuel price:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse timestamp
     * @param {number|string} unix - Unix timestamp in seconds
     * @returns {Object} Parsed timestamp
     */
    function parseTimestamp(unix) {
        try {
            if (!ValidationUtil.isValidTimestamp(unix)) {
                return { valid: false, error: 'Invalid timestamp' };
            }
            
            const timestamp = typeof unix === 'string' ? parseInt(unix, 10) : unix;
            const date = new Date(timestamp * 1000);
            
            return {
                valid: true,
                unix: timestamp,
                iso: date.toISOString(),
                readable: FormatUtil.formatTimestampReadable(timestamp),
                date: date,
            };
        } catch (error) {
            console.error('Error parsing timestamp:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse hex string
     * @param {string} hex - Hex string to parse
     * @returns {Object} Parsed hex string
     */
    function parseHexString(hex) {
        try {
            if (!ValidationUtil.isValidHexString(hex)) {
                return { valid: false, error: 'Invalid hex string' };
            }
            
            const cleaned = hex.startsWith('0x') ? hex.substring(2) : hex;
            
            return {
                valid: true,
                hex: '0x' + cleaned,
                cleaned: cleaned,
                length: cleaned.length,
                bytes: cleaned.length / 2,
            };
        } catch (error) {
            console.error('Error parsing hex string:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Decode transaction data
     * @param {string} data - Transaction input data
     * @returns {Object} Decoded transaction data
     */
    function decodeTransactionData(data) {
        try {
            if (!ValidationUtil.isValidHexString(data)) {
                return { valid: false, error: 'Invalid transaction data' };
            }
            
            const cleaned = data.startsWith('0x') ? data.substring(2) : data;
            
            // Extract function selector (first 4 bytes = 8 hex chars)
            const functionSelector = cleaned.length >= 8 ? '0x' + cleaned.substring(0, 8) : null;
            
            // Extract parameters (remaining bytes)
            const parameters = cleaned.length > 8 ? '0x' + cleaned.substring(8) : null;
            
            return {
                valid: true,
                raw: data,
                functionSelector: functionSelector,
                parameters: parameters,
                length: cleaned.length / 2,
                isContractCreation: cleaned.length > 0,
            };
        } catch (error) {
            console.error('Error decoding transaction data:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Calculate confirmation count
     * @param {number|string} txBlockNumber - Transaction block number
     * @param {number|string} currentBlockNumber - Current block number
     * @returns {Object} Confirmation count
     */
    function calculateConfirmations(txBlockNumber, currentBlockNumber) {
        try {
            const txBlock = typeof txBlockNumber === 'string' ? parseInt(txBlockNumber, 16) : txBlockNumber;
            const currentBlock = typeof currentBlockNumber === 'string' ? parseInt(currentBlockNumber, 16) : currentBlockNumber;
            
            if (txBlock > currentBlock) {
                return { valid: false, error: 'Transaction block is in the future' };
            }
            
            const confirmations = currentBlock - txBlock + 1;
            
            return {
                valid: true,
                confirmations: Math.max(0, confirmations),
                isConfirmed: confirmations >= 12, // 12 confirmations = finalized
                isFinalized: confirmations >= 128, // 128 confirmations = highly finalized
            };
        } catch (error) {
            console.error('Error calculating confirmations:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Format transaction status from receipt
     * @param {Object} receipt - Transaction receipt
     * @returns {Object} Transaction status
     */
    function formatTransactionStatus(receipt) {
        try {
            if (!receipt) {
                return { valid: false, status: TRANSACTION_STATUS.UNKNOWN };
            }
            
            let status = TRANSACTION_STATUS.UNKNOWN;
            
            if (receipt.status === '0x0' || receipt.status === 0) {
                status = TRANSACTION_STATUS.FAILED;
            } else if (receipt.status === '0x1' || receipt.status === 1) {
                status = TRANSACTION_STATUS.CONFIRMED;
            }
            
            return {
                valid: true,
                status: status,
                gasUsed: receipt.gasUsed,
                cumulativeGasUsed: receipt.cumulativeGasUsed,
                contractAddress: receipt.contractAddress,
                logs: receipt.logs || [],
            };
        } catch (error) {
            console.error('Error formatting transaction status:', error);
            return { valid: false, status: TRANSACTION_STATUS.UNKNOWN };
        }
    }
    
    /**
     * Parse transaction object
     * @param {Object} tx - Transaction object
     * @returns {Object} Parsed transaction
     */
    function parseTransaction(tx) {
        try {
            if (!tx || typeof tx !== 'object') {
                return { valid: false, error: 'Invalid transaction object' };
            }
            
            const parsed = {
                valid: true,
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: parseBalance(tx.value || '0'),
                gas: tx.gas,
                gasPrice: parseGasPrice(tx.gasPrice || '0'),
                nonce: tx.nonce,
                blockNumber: tx.blockNumber,
                blockHash: tx.blockHash,
                transactionIndex: tx.transactionIndex,
                input: tx.input,
                v: tx.v,
                r: tx.r,
                s: tx.s,
            };
            
            return parsed;
        } catch (error) {
            console.error('Error parsing transaction:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Parse block object
     * @param {Object} block - Block object
     * @returns {Object} Parsed block
     */
    function parseBlock(block) {
        try {
            if (!block || typeof block !== 'object') {
                return { valid: false, error: 'Invalid block object' };
            }
            
            const parsed = {
                valid: true,
                number: parseBlockNumber(block.number),
                hash: block.hash,
                parentHash: block.parentHash,
                timestamp: parseTimestamp(block.timestamp),
                miner: block.miner,
                difficulty: block.difficulty,
                gasLimit: block.gasLimit,
                gasUsed: block.gasUsed,
                transactions: block.transactions || [],
                transactionCount: (block.transactions || []).length,
                size: block.size,
                extraData: block.extraData,
            };
            
            return parsed;
        } catch (error) {
            console.error('Error parsing block:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Validate and parse account object
     * @param {Object} account - Account object
     * @returns {Object} Parsed account
     */
    function parseAccount(account) {
        try {
            if (!account || typeof account !== 'object') {
                return { valid: false, error: 'Invalid account object' };
            }
            
            const parsed = {
                valid: true,
                address: parseAddress(account.address),
                balance: parseBalance(account.balance || '0'),
                nonce: account.nonce,
                code: account.code,
                storage: account.storage || {},
            };
            
            return parsed;
        } catch (error) {
            console.error('Error parsing account:', error);
            return { valid: false, error: error.message };
        }
    }
    
    /**
     * Calculate transaction fee
     * @param {string|number|BigInt} fuelUsed - Fuel used
     * @param {string|number|BigInt} fuelPrice - Fuel price in MIST
     * @returns {Object} Transaction fee
     */
    function calculateTransactionFee(fuelUsed, fuelPrice) {
        try {
            if (!ValidationUtil.isValidWeiAmount(fuelUsed) || !ValidationUtil.isValidWeiAmount(fuelPrice)) {
                return { valid: false, error: 'Invalid fuel parameters' };
            }
            
            const fuelUsedBig = typeof fuelUsed === 'bigint' ? fuelUsed : BigInt(fuelUsed);
            const fuelPriceBig = typeof fuelPrice === 'bigint' ? fuelPrice : BigInt(fuelPrice);
            
            const fee = fuelUsedBig * fuelPriceBig;
            
            return {
                valid: true,
                fee: fee.toString(),
                formatted: FormatUtil.formatBalance(fee),
                fuelUsed: fuelUsedBig.toString(),
                fuelPrice: fuelPriceBig.toString(),
            };
        } catch (error) {
            console.error('Error calculating transaction fee:', error);
            return { valid: false, error: error.message };
        }
    }
    
    return {
        parseAddress,
        parseBlockNumber,
        parseTransactionHash,
        parseBalance,
        parseGasPrice,
        parseTimestamp,
        parseHexString,
        decodeTransactionData,
        calculateConfirmations,
        formatTransactionStatus,
        parseTransaction,
        parseBlock,
        parseAccount,
        calculateTransactionFee,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataProcessor;
}
