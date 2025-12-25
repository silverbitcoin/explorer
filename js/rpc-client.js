/**
 * RPC Client - JSON-RPC 2.0 Protocol Implementation
 * Production-Grade for SilverBitcoin 2.0 Pure PoW Blockchain
 * Pure PoW Mining with SHA-512
 * 
 * Uses RpcConnector for multi-protocol support:
 * 1. WebSocket Secure (WSS)
 * 2. WebSocket (WS)
 * 3. HTTP/HTTPS (fallback)
 */

const RPCClient = (() => {
    let requestId = 1;
    const activeRequests = new Map();
    let useConnector = false; // Will be set to true after connector is ready
    
    /**
     * Generate unique request ID
     * @private
     * @returns {number} Request ID
     */
    function generateRequestId() {
        return requestId++;
    }
    
    /**
     * Create JSON-RPC 2.0 request object
     * @private
     * @param {string} method - RPC method name
     * @param {Array} params - Method parameters
     * @returns {Object} JSON-RPC request
     */
    function createRequest(method, params = []) {
        return {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: generateRequestId(),
        };
    }
    
    /**
     * Validate JSON-RPC 2.0 response
     * @private
     * @param {Object} response - Response object
     * @returns {Object} Validation result
     */
    function validateResponse(response) {
        if (!response || typeof response !== 'object') {
            return {
                valid: false,
                error: EXPLORER_CONFIG.ERRORS.RPC_INVALID_RESPONSE,
            };
        }
        
        if (response.jsonrpc !== '2.0') {
            return {
                valid: false,
                error: EXPLORER_CONFIG.ERRORS.RPC_INVALID_RESPONSE,
            };
        }
        
        if (response.error) {
            return {
                valid: false,
                error: response.error.message || EXPLORER_CONFIG.ERRORS.RPC_INTERNAL_ERROR,
            };
        }
        
        if (response.result === undefined && response.error === undefined) {
            return {
                valid: false,
                error: EXPLORER_CONFIG.ERRORS.RPC_INVALID_RESPONSE,
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Execute RPC call with retry logic
     * @private
     * @param {Object} request - JSON-RPC request
     * @returns {Promise<Object>} Response object
     */
    async function executeWithRetry(request) {
        let lastError = null;
        
        // Try using RpcConnector if available
        if (useConnector && typeof RpcConnector !== 'undefined') {
            try {
                console.log(`📡 Using RpcConnector for ${request.method}`);
                const result = await RpcConnector.sendRpcCall(request.method, request.params);
                return {
                    jsonrpc: '2.0',
                    result: result,
                    id: request.id
                };
            } catch (error) {
                console.warn('RpcConnector failed, falling back to HTTP:', error.message);
                lastError = error;
            }
        }
        
        // Fall back to HTTP with retry logic
        for (let attempt = 0; attempt < EXPLORER_CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), EXPLORER_CONFIG.RPC_TIMEOUT);
                
                const response = await fetch(EXPLORER_CONFIG.RPC_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const validation = validateResponse(data);
                
                if (!validation.valid) {
                    throw new Error(validation.error);
                }
                
                return data;
            } catch (error) {
                lastError = error;
                
                if (attempt < EXPLORER_CONFIG.RETRY.MAX_ATTEMPTS - 1) {
                    const delay = Math.min(
                        EXPLORER_CONFIG.RETRY.INITIAL_DELAY * Math.pow(EXPLORER_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt),
                        EXPLORER_CONFIG.RETRY.MAX_DELAY
                    );
                    console.warn(`RPC retry attempt ${attempt + 1}/${EXPLORER_CONFIG.RETRY.MAX_ATTEMPTS} after ${delay}ms:`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError || new Error(EXPLORER_CONFIG.ERRORS.RPC_CONNECTION_FAILED);
    }
    
    /**
     * Execute RPC method call
     * @param {string} method - RPC method name
     * @param {Array} params - Method parameters
     * @returns {Promise<*>} Method result
     */
    async function call(method, params = []) {
        try {
            console.log(`Executing RPC call: ${method}`, params);
            
            const request = createRequest(method, params);
            const response = await executeWithRetry(request);
            
            if (!response || response.result === undefined) {
                throw new Error(`Invalid response for ${method}: ${JSON.stringify(response)}`);
            }
            
            const result = response.result;
            
            // Cache result based on method
            let ttl = EXPLORER_CONFIG.CACHE_TTL.NETWORK_INFO;
            
            if (method === SILVER_RPC_METHODS.GET_BLOCK) {
                ttl = EXPLORER_CONFIG.CACHE_TTL.BLOCK;
            } else if (method === SILVER_RPC_METHODS.GET_TRANSACTION) {
                ttl = EXPLORER_CONFIG.CACHE_TTL.TRANSACTION;
            } else if (method === SILVER_RPC_METHODS.GET_BALANCE) {
                ttl = EXPLORER_CONFIG.CACHE_TTL.BALANCE;
            } else if (method === SILVER_RPC_METHODS.GET_MINING_INFO) {
                ttl = EXPLORER_CONFIG.CACHE_TTL.MINING_INFO;
            }
            
            const cacheKey = `rpc_${method}_${JSON.stringify(params)}`;
            if (typeof CacheManager !== 'undefined' && CacheManager.set) {
                CacheManager.set(cacheKey, result, ttl);
            }
            
            console.log(`RPC call successful: ${method}`, result);
            return result;
        } catch (error) {
            console.error(`RPC call failed for ${method}:`, error);
            throw error;
        }
    }
    
    /**
     * Execute batch RPC calls
     * @param {Array} calls - Array of {method, params} objects
     * @returns {Promise<Array>} Array of results
     */
    async function batch(calls) {
        try {
            if (!Array.isArray(calls) || calls.length === 0) {
                return [];
            }
            
            // Split large batches into smaller chunks
            const chunks = [];
            for (let i = 0; i < calls.length; i += EXPLORER_CONFIG.RPC_MAX_BATCH_SIZE) {
                chunks.push(calls.slice(i, i + EXPLORER_CONFIG.RPC_MAX_BATCH_SIZE));
            }
            
            const allResults = [];
            
            for (const chunk of chunks) {
                const requests = chunk.map(call => createRequest(call.method, call.params || []));
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), EXPLORER_CONFIG.RPC_TIMEOUT);
                
                const response = await fetch(EXPLORER_CONFIG.RPC_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requests),
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error('Batch response is not an array');
                }
                
                const results = data.map(item => {
                    if (item.error) {
                        console.error('Batch item error:', item.error);
                        return null;
                    }
                    return item.result;
                });
                
                allResults.push(...results);
            }
            
            return allResults;
        } catch (error) {
            console.error('Batch RPC call failed:', error);
            throw error;
        }
    }
    
    /**
     * Check RPC connection
     * @returns {Promise<boolean>} True if connected
     */
    async function checkConnection() {
        try {
            console.log('Checking RPC connection...');
            
            // Check RpcConnector status if available
            if (typeof RpcConnector !== 'undefined') {
                const status = RpcConnector.getStatus();
                console.log('RpcConnector status:', status);
                
                if (status.isConnected) {
                    console.log('✅ RPC connection successful via', status.connectionType);
                    useConnector = true;
                    return true;
                }
            }
            
            // Try getblockcount first (simpler method)
            try {
                const blockCount = await call(SILVER_RPC_METHODS.GET_BLOCK_COUNT);
                
                if (typeof blockCount === 'number' && blockCount >= 0) {
                    console.log('✅ RPC connection successful, block count:', blockCount);
                    return true;
                }
            } catch (blockCountError) {
                console.warn('⚠️ getblockcount failed, trying getnetworkinfo:', blockCountError.message);
                
                // Fallback to getnetworkinfo
                try {
                    const networkInfo = await call(SILVER_RPC_METHODS.GET_NETWORK_INFO);
                    if (networkInfo && typeof networkInfo === 'object') {
                        console.log('✅ RPC connection successful via getnetworkinfo');
                        return true;
                    }
                } catch (networkError) {
                    console.error('❌ Both getblockcount and getnetworkinfo failed');
                    throw networkError;
                }
            }
            
            console.error('❌ RPC returned invalid response');
            return false;
        } catch (error) {
            console.error('❌ RPC connection check failed:', error);
            return false;
        }
    }
    
    /**
     * Get current block count
     * @returns {Promise<number>} Current block count
     */
    async function getBlockCount() {
        return await call(SILVER_RPC_METHODS.GET_BLOCK_COUNT);
    }
    
    /**
     * Get block by hash or height
     * @param {string|number} blockIdentifier - Block hash or height
     * @returns {Promise<Object>} Block data
     */
    async function getBlock(blockIdentifier) {
        return await call(SILVER_RPC_METHODS.GET_BLOCK, [blockIdentifier]);
    }
    
    /**
     * Get transaction
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>} Transaction data
     */
    async function getTransaction(txHash) {
        return await call(SILVER_RPC_METHODS.GET_TRANSACTION, [txHash]);
    }
    
    /**
     * Get address balance
     * @param {string} address - Address
     * @returns {Promise<number>} Balance in MIST
     */
    async function getBalance(address) {
        return await call(SILVER_RPC_METHODS.GET_BALANCE, [address]);
    }
    
    /**
     * Get mining info
     * @returns {Promise<Object>} Mining information
     */
    async function getMiningInfo() {
        return await call(SILVER_RPC_METHODS.GET_MINING_INFO);
    }
    
    /**
     * Get network info
     * @returns {Promise<Object>} Network information
     */
    async function getNetworkInfo() {
        return await call(SILVER_RPC_METHODS.GET_NETWORK_INFO);
    }
    
    /**
     * Get blockchain info
     * @returns {Promise<Object>} Blockchain information
     */
    async function getBlockchainInfo() {
        return await call(SILVER_RPC_METHODS.GET_BLOCKCHAIN_INFO);
    }
    
    /**
     * Get difficulty
     * @returns {Promise<number>} Current difficulty
     */
    async function getDifficulty() {
        return await call(SILVER_RPC_METHODS.GET_DIFFICULTY);
    }
    
    /**
     * Get hashrate
     * @returns {Promise<number>} Current hashrate
     */
    async function getHashrate() {
        return await call(SILVER_RPC_METHODS.GET_HASHRATE);
    }
    
    /**
     * Get mempool info
     * @returns {Promise<Object>} Mempool information
     */
    async function getMempoolInfo() {
        return await call(SILVER_RPC_METHODS.GET_MEMPOOL_INFO);
    }
    
    /**
     * Validate address
     * @param {string} address - Address to validate
     * @returns {Promise<Object>} Validation result
     */
    async function validateAddress(address) {
        return await call(SILVER_RPC_METHODS.VALIDATE_ADDRESS, [address]);
    }
    
    /**
     * List transactions
     * @param {number} count - Number of transactions
     * @param {number} skip - Number to skip
     * @returns {Promise<Array>} Transactions
     */
    async function listTransactions(count = 10, skip = 0) {
        return await call(SILVER_RPC_METHODS.LIST_TRANSACTIONS, [count, skip]);
    }
    
    /**
     * List unspent outputs (UTXO)
     * @param {number} minconf - Minimum confirmations
     * @param {number} maxconf - Maximum confirmations
     * @returns {Promise<Array>} Unspent outputs
     */
    async function listUnspent(minconf = 0, maxconf = 9999999) {
        return await call(SILVER_RPC_METHODS.LIST_UNSPENT, [minconf, maxconf]);
    }
    
    /**
     * Get smart contract information
     * @param {string} contractId - Contract ID
     * @returns {Promise<Object>} Contract data
     */
    async function getSmartContract(contractId) {
        return await call('getsmartcontract', [contractId]);
    }
    
    /**
     * List all smart contracts
     * @returns {Promise<Array>} All contracts
     */
    async function listSmartContracts() {
        return await call('listsmartcontracts', []);
    }
    
    /**
     * Get validator information
     * @param {string} validatorAddress - Validator address
     * @returns {Promise<Object>} Validator data
     */
    async function getValidator(validatorAddress) {
        return await call('getvalidator', [validatorAddress]);
    }
    
    /**
     * List all validators
     * @returns {Promise<Array>} All validators
     */
    async function listValidators() {
        return await call('listvalidators', []);
    }
    
    /**
     * Get consensus batch information
     * @param {string} batchId - Batch ID
     * @returns {Promise<Object>} Batch data
     */
    async function getConsensusBatch(batchId) {
        return await call('getconsensusbatch', [batchId]);
    }
    
    /**
     * Get P2P peer information
     * @returns {Promise<Array>} Peer list
     */
    async function getPeerInfo() {
        return await call('getpeerinfo', []);
    }
    
    /**
     * Get network statistics
     * @returns {Promise<Object>} Network stats
     */
    async function getNetworkStats() {
        return await call('getnetworkstats', []);
    }
    
    /**
     * Get Lelantus JoinSplit transaction
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>} JoinSplit data
     */
    async function getJoinSplit(txHash) {
        return await call('getjoinsplit', [txHash]);
    }
    
    /**
     * Get MimbleWimble transaction
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>} MW transaction data
     */
    async function getMimblewimbleTransaction(txHash) {
        return await call('getmimblewimbletx', [txHash]);
    }
    
    /**
     * Get advanced transaction query results
     * @param {Object} query - Query parameters
     * @returns {Promise<Array>} Query results
     */
    async function queryTransactions(query) {
        return await call('querytransactions', [query]);
    }
    
    /**
     * Get advanced block query results
     * @param {Object} query - Query parameters
     * @returns {Promise<Array>} Query results
     */
    async function queryBlocks(query) {
        return await call('queryblocks', [query]);
    }
    
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    return {
        call,
        batch,
        checkConnection,
        getBlockCount,
        getBlock,
        getTransaction,
        getBalance,
        getMiningInfo,
        getNetworkInfo,
        getBlockchainInfo,
        getDifficulty,
        getHashrate,
        getMempoolInfo,
        validateAddress,
        listTransactions,
        listUnspent,
        getSmartContract,
        listSmartContracts,
        getValidator,
        listValidators,
        getConsensusBatch,
        getPeerInfo,
        getNetworkStats,
        getJoinSplit,
        getMimblewimbleTransaction,
        queryTransactions,
        queryBlocks,
    };
})();
