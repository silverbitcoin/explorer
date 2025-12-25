/**
 * Transaction Details Page - Real Blockchain Data
 * PRODUCTION-GRADE IMPLEMENTATION
 * 
 * Displays detailed information about a specific transaction
 * including inputs, outputs, fees, and status
 * 
 */

const TransactionDetailsPage = (() => {
    // ============================================================================
    // STATE
    // ============================================================================
    
    let isInitialized = false;
    let currentTxHash = null;
    let transactionData = null;
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
     * Initialize transaction details page
     * @param {string} txHash - Transaction hash to display
     * @returns {Promise<void>}
     */
    async function init(txHash) {
        try {
            console.log(`🚀 Initializing Transaction Details Page for ${txHash}...`);
            
            // Normalize and validate transaction hash
            const txParsed = SilverBlockchainAPI.parseTransactionHash(txHash);
            if (!txParsed.valid) {
                showError(`Invalid transaction hash: ${txParsed.error}`);
                return;
            }
            
            currentTxHash = txParsed.hash;
            
            // Render page structure
            renderPageStructure();
            
            // Load transaction data
            await loadTransactionData();
            
            // Set up event listeners
            setupEventListeners();
            
            isInitialized = true;
            console.log('✅ Transaction details page initialized');
            
        } catch (error) {
            console.error('Failed to initialize transaction details page:', error);
            showError('Failed to initialize transaction details page: ' + error.message);
        }
    }
    
    /**
     * Render page HTML structure
     * @private
     */
    function renderPageStructure() {
        const container = document.getElementById('page-container');
        
        if (!container) {
            throw new Error('page-container element not found in DOM');
        }
        
        container.innerHTML = `
            <div class="transaction-details-page">
                <!-- Header -->
                <div class="page-header">
                    <h1>Transaction Details</h1>
                    <div class="tx-header">
                        <code class="tx-code">${currentTxHash}</code>
                        <button id="copy-tx-btn" class="btn btn-small">📋 Copy</button>
                    </div>
                </div>
                
                <!-- Transaction Status -->
                <section class="tx-status-section">
                    <div class="status-card">
                        <div class="status-label">Status</div>
                        <div class="status-value" id="tx-status">
                            <span class="loading-skeleton"></span>
                        </div>
                    </div>
                    
                    <div class="status-card">
                        <div class="status-label">Confirmations</div>
                        <div class="status-value" id="tx-confirmations">
                            <span class="loading-skeleton"></span>
                        </div>
                    </div>
                    
                    <div class="status-card">
                        <div class="status-label">Block</div>
                        <div class="status-value" id="tx-block">
                            <span class="loading-skeleton"></span>
                        </div>
                    </div>
                </section>
                
                <!-- Transaction Information -->
                <section class="tx-info-section">
                    <h2>Transaction Information</h2>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-label">From</div>
                            <div class="info-value" id="tx-from">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">To</div>
                            <div class="info-value" id="tx-to">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Value (SLVR)</div>
                            <div class="info-value" id="tx-value-slvr">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Value (MIST)</div>
                            <div class="info-value" id="tx-value-mist">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Gas Used</div>
                            <div class="info-value" id="tx-gas-used">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Gas Price (Gwei)</div>
                            <div class="info-value" id="tx-gas-price">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Transaction Fee (SLVR)</div>
                            <div class="info-value" id="tx-fee-slvr">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Transaction Fee (MIST)</div>
                            <div class="info-value" id="tx-fee-mist">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Nonce</div>
                            <div class="info-value" id="tx-nonce">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <div class="info-label">Timestamp</div>
                            <div class="info-value" id="tx-timestamp">
                                <span class="loading-skeleton"></span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Transaction Data -->
                <section class="tx-data-section">
                    <h2>Transaction Data</h2>
                    <div class="data-card">
                        <div class="data-label">Input Data</div>
                        <div class="data-value">
                            <code id="tx-input-data" class="data-code">
                                <span class="loading-skeleton"></span>
                            </code>
                        </div>
                    </div>
                </section>
                
                <!-- Raw Transaction -->
                <section class="raw-tx-section">
                    <h2>Raw Transaction</h2>
                    <div class="raw-tx-card">
                        <button id="toggle-raw-tx-btn" class="btn btn-secondary">Show Raw</button>
                        <pre id="raw-tx-data" class="raw-tx-data hidden">
                            <code id="raw-tx-code">Loading...</code>
                        </pre>
                    </div>
                </section>
            </div>
        `;
    }
    
    /**
     * Load transaction data using real RPC methods
     * PRODUCTION-GRADE: Uses AdvancedRPCIntegration for all RPC calls
     * @private
     * @returns {Promise<void>}
     */
    async function loadTransactionData() {
        try {
            console.log(`📊 Loading transaction data for ${currentTxHash} via RPC...`);
            
            // Get transaction using real RPC method
            const tx = await AdvancedRPCIntegration.transaction.getRaw(currentTxHash, true).catch(e => {
                console.error('Failed to get transaction:', e);
                return null;
            });
            
            if (!tx) {
                showError('Transaction not found');
                return;
            }
            
            // Get mempool entry if pending
            const mempoolEntry = await AdvancedRPCIntegration.transaction.getMempoolEntry(currentTxHash).catch(() => null);
            
            transactionData = {
                valid: true,
                hash: currentTxHash,
                from: tx.from || '0x0',
                to: tx.to || null,
                value: {
                    slvr: (tx.value / 100_000_000).toFixed(8),
                    mist: tx.value.toString()
                },
                gasUsed: tx.gas || 21000,
                gasPrice: {
                    gwei: (tx.gasPrice / 1_000_000_000).toFixed(9),
                    wei: tx.gasPrice.toString()
                },
                transactionFee: {
                    slvr: ((tx.gas * tx.gasPrice) / 100_000_000).toFixed(8),
                    mist: (tx.gas * tx.gasPrice).toString()
                },
                nonce: tx.nonce || 0,
                timestamp: tx.blocktime || Math.floor(Date.now() / 1000),
                blockNumber: tx.blockNumber || null,
                blockHash: tx.blockHash || null,
                confirmations: tx.confirmations || 0,
                status: tx.confirmations > 0 ? '0x1' : (mempoolEntry ? 'pending' : '0x0'),
                inputData: tx.input || '0x',
                ...tx
            };
            
            // Render transaction information
            renderTransactionInfo();
            
            console.log('✅ Transaction data loaded');
            
        } catch (error) {
            console.error('Failed to load transaction data:', error);
            showError('Failed to load transaction data: ' + error.message);
        }
    }
    
    /**
     * Render transaction information
     * @private
     */
    function renderTransactionInfo() {
        if (!transactionData || !transactionData.valid) {
            showError('Invalid transaction data');
            return;
        }
        
        const tx = transactionData;
        
        // Status
        const statusClass = tx.status === '0x1' ? 'success' : (tx.status === '0x0' ? 'failed' : 'pending');
        const statusText = tx.status === '0x1' ? 'Confirmed' : (tx.status === '0x0' ? 'Failed' : 'Pending');
        document.getElementById('tx-status').innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
        
        // Confirmations
        document.getElementById('tx-confirmations').textContent = tx.confirmations || 'N/A';
        
        // Block
        if (tx.blockNumber) {
            let blockHash = tx.blockHash;
            if (!blockHash.startsWith('0x')) {
                blockHash = '0x' + blockHash;
            }
            if (blockHash.length < 130) {
                blockHash = '0x' + blockHash.substring(2).padStart(128, '0');
            }
            
            document.getElementById('tx-block').innerHTML = `
                <a href="#/block/${tx.blockNumber}" class="link" title="${blockHash}">${tx.blockNumber}</a>
            `;
        } else {
            document.getElementById('tx-block').textContent = 'Pending';
        }
        
        // From
        document.getElementById('tx-from').innerHTML = `
            <a href="#/address/${tx.from}" class="link" title="${tx.from}">
                <code class="address-short">${tx.from}</code>
            </a>
        `;
        
        // To
        if (tx.to) {
            document.getElementById('tx-to').innerHTML = `
                <a href="#/address/${tx.to}" class="link" title="${tx.to}">
                    <code class="address-short">${tx.to}</code>
                </a>
            `;
        } else {
            document.getElementById('tx-to').innerHTML = '<span class="contract-creation">Contract Creation</span>';
        }
        
        // Value
        document.getElementById('tx-value-slvr').textContent = tx.value.slvr;
        document.getElementById('tx-value-mist').textContent = tx.value.mist;
        
        // Gas
        document.getElementById('tx-gas-used').textContent = tx.gasUsed || 'N/A';
        document.getElementById('tx-gas-price').textContent = tx.gasPrice.gwei || 'N/A';
        
        // Fee
        document.getElementById('tx-fee-slvr').textContent = tx.transactionFee.slvr;
        document.getElementById('tx-fee-mist').textContent = tx.transactionFee.mist;
        
        // Nonce
        document.getElementById('tx-nonce').textContent = tx.nonce;
        
        // Timestamp
        if (tx.timestamp) {
            const date = new Date(tx.timestamp * 1000);
            document.getElementById('tx-timestamp').textContent = date.toLocaleString();
        } else {
            document.getElementById('tx-timestamp').textContent = 'N/A';
        }
        
        // Input Data
        const inputData = tx.input || '0x';
        document.getElementById('tx-input-data').textContent = inputData;
        
        // Raw Transaction
        document.getElementById('raw-tx-code').textContent = JSON.stringify(tx, null, 2);
    }
    
    /**
     * Set up event listeners
     * @private
     */
    function setupEventListeners() {
        // Copy transaction hash button
        document.getElementById('copy-tx-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(currentTxHash).then(() => {
                const btn = document.getElementById('copy-tx-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });
        
        // Toggle raw transaction
        document.getElementById('toggle-raw-tx-btn').addEventListener('click', () => {
            const rawTxData = document.getElementById('raw-tx-data');
            const btn = document.getElementById('toggle-raw-tx-btn');
            
            if (rawTxData.classList.contains('hidden')) {
                rawTxData.classList.remove('hidden');
                btn.textContent = 'Hide Raw';
            } else {
                rawTxData.classList.add('hidden');
                btn.textContent = 'Show Raw';
            }
        });
    }
    
    /**
     * Show error message
     * @private
     * @param {string} message - Error message
     */
    function showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
            
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        }
    }
    
    /**
     * Cleanup
     */
    function cleanup() {
        isInitialized = false;
        currentTxHash = null;
        transactionData = null;
    }
    
    // ============================================================================
    // EXPORT PUBLIC API
    // ============================================================================
    
    return {
        init,
        cleanup
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionDetailsPage;
}
