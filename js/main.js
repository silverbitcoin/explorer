/**
 * Main Application Logic for SilverBitcoin Explorer
 */

// Import the API client
// Note: In a real application, you might use ES6 modules or a bundler
// For simplicity, we're assuming api.js is loaded before this file

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Section elements
    const homeSection = document.getElementById('home');
    const blocksSection = document.getElementById('blocks');
    const transactionsSection = document.getElementById('transactions');
    const validatorsSection = document.getElementById('validators');
    const blockDetailsSection = document.getElementById('blockDetails');
    const transactionDetailsSection = document.getElementById('transactionDetails');
    const addressDetailsSection = document.getElementById('addressDetails');
    
    // Stats elements
    const currentBlockHeightEl = document.getElementById('currentBlockHeight');
    const totalTransactionsEl = document.getElementById('totalTransactions');
    const activeValidatorsEl = document.getElementById('activeValidators');
    const networkStatusEl = document.getElementById('networkStatus');
    
    // Table bodies
    const blocksTableBody = document.querySelector('#blocksTable tbody');
    const transactionsTableBody = document.querySelector('#transactionsTable tbody');
    const validatorsTableBody = document.querySelector('#validatorsTable tbody');
    
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    
    // Initialize the application
    initApp();
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
    
    /**
     * Initialize the application
     */
    async function initApp() {
        try {
            // Load initial data
            await loadNetworkStats();
            await loadLatestBlocks();
            await loadLatestTransactions();
            await loadValidators();
            
            // Show home section by default
            showSection('home');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            showError('Failed to load initial data. Please try again later.');
        }
    }
    
    /**
     * Load network statistics
     */
    async function loadNetworkStats() {
        try {
            // Show loading states
            currentBlockHeightEl.textContent = 'Loading...';
            totalTransactionsEl.textContent = 'Loading...';
            activeValidatorsEl.textContent = 'Loading...';
            networkStatusEl.textContent = 'Loading...';
            
            // Fetch data in parallel
            const [blockHeight, networkInfo, validators] = await Promise.all([
                silverBitcoinAPI.getCurrentBlockHeight(),
                silverBitcoinAPI.getNetworkInfo(),
                silverBitcoinAPI.getValidators()
            ]);
            
            // Update UI
            currentBlockHeightEl.textContent = blockHeight.toLocaleString();
            totalTransactionsEl.textContent = 'N/A'; // Would need to calculate from blocks
            activeValidatorsEl.textContent = validators ? validators.length : 'N/A';
            networkStatusEl.textContent = networkInfo.isListening ? 'Active' : 'Inactive';
        } catch (error) {
            console.error('Failed to load network stats:', error);
            currentBlockHeightEl.textContent = 'Error';
            totalTransactionsEl.textContent = 'Error';
            activeValidatorsEl.textContent = 'Error';
            networkStatusEl.textContent = 'Error';
        }
    }
    
    /**
     * Load latest blocks
     */
    async function loadLatestBlocks() {
        try {
            const blocks = await silverBitcoinAPI.getLatestBlocks(10);
            
            // Clear existing content
            blocksTableBody.innerHTML = '';
            
            // Populate table
            blocks.forEach(block => {
                const row = document.createElement('tr');
                
                // Format timestamp
                const timestamp = block.timestamp ? new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString() : 'N/A';
                
                // Count transactions
                const txCount = block.transactions ? block.transactions.length : 0;
                
                row.innerHTML = `
                    <td>${parseInt(block.number, 16).toLocaleString()}</td>
                    <td>${timestamp}</td>
                    <td>${txCount}</td>
                    <td>${block.size ? parseInt(block.size, 16) : 'N/A'}</td>
                    <td>${block.miner || 'N/A'}</td>
                `;
                
                // Add click event to view block details
                row.addEventListener('click', () => {
                    showBlockDetails(block);
                });
                
                blocksTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load blocks:', error);
            blocksTableBody.innerHTML = `<tr><td colspan="5">Failed to load blocks: ${error.message}</td></tr>`;
        }
    }
    
    /**
     * Load latest transactions
     * PRODUCTION-GRADE REAL IMPLEMENTATION
     */
    async function loadLatestTransactions() {
        try {
            // Use real RPC data from AdvancedRPCIntegration
            if (typeof AdvancedRPCIntegration === 'undefined') {
                console.error('AdvancedRPCIntegration not available');
                transactionsTableBody.innerHTML = '<tr><td colspan="6">RPC integration not available</td></tr>';
                return;
            }
            
            // Get raw mempool for latest transactions
            const mempool = await AdvancedRPCIntegration.transaction.getRawMempool();
            
            if (!mempool || mempool.length === 0) {
                transactionsTableBody.innerHTML = '<tr><td colspan="6">No transactions in mempool</td></tr>';
                return;
            }
            
            // Clear existing content
            transactionsTableBody.innerHTML = '';
            
            // Fetch details for first 10 mempool transactions
            const txHashes = mempool.slice(0, 10);
            const txDetails = await Promise.allSettled(
                txHashes.map(hash => AdvancedRPCIntegration.transaction.getMempoolEntry(hash))
            );
            
            // Populate table with real data
            txDetails.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const tx = result.value;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${FormatUtil.formatHash(txHashes[index], true)}</td>
                        <td>Mempool</td>
                        <td>${tx.from || 'N/A'}</td>
                        <td>${tx.to || 'N/A'}</td>
                        <td>${FormatUtil.formatBalance(tx.value || 0)}</td>
                        <td>${FormatUtil.formatGasPrice(tx.fee || 0)}</td>
                    `;
                    
                    // Add click event to view transaction details
                    row.addEventListener('click', () => {
                        showTransactionDetails({hash: txHashes[index]});
                    });
                    
                    transactionsTableBody.appendChild(row);
                }
            });
            
            if (transactionsTableBody.children.length === 0) {
                transactionsTableBody.innerHTML = '<tr><td colspan="6">No transaction details available</td></tr>';
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
            transactionsTableBody.innerHTML = `<tr><td colspan="6">Failed to load transactions: ${error.message}</td></tr>`;
        }
    }
    
    /**
     * Load validators
     * PRODUCTION-GRADE REAL IMPLEMENTATION
     * Note: SilverBitcoin is Pure PoW - NO validators/staking
     * This section shows mining pool operators instead
     */
    async function loadValidators() {
        try {
            // SilverBitcoin is Pure Proof-of-Work - no validators
            // Instead, show mining pool information from MiningDashboard
            if (typeof MiningDashboard === 'undefined') {
                validatorsTableBody.innerHTML = '<tr><td colspan="5">Mining dashboard not available</td></tr>';
                return;
            }
            
            // Get top miners/pool operators
            const topMiners = MiningDashboard.getTopMiners();
            
            // Clear existing content
            validatorsTableBody.innerHTML = '';
            
            if (!topMiners || topMiners.length === 0) {
                validatorsTableBody.innerHTML = '<tr><td colspan="5">No mining data available</td></tr>';
                return;
            }
            
            // Populate table with real mining pool data
            topMiners.slice(0, 10).forEach((miner, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${FormatUtil.formatHash(miner.address, true)}</td>
                    <td>Pool ${index + 1}</td>
                    <td>${FormatUtil.formatNumber(miner.hashrate)} H/s</td>
                    <td>${FormatUtil.formatPercentage(miner.poolShare)}</td>
                    <td>Active</td>
                `;
                
                validatorsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load mining pool data:', error);
            validatorsTableBody.innerHTML = `<tr><td colspan="5">Failed to load mining data: ${error.message}</td></tr>`;
        }
    }
    
    /**
     * Handle search functionality
     */
    async function handleSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        try {
            // Determine what type of entity we're searching for
            if (query.startsWith('0x') && query.length === 66) {
                // Likely a transaction hash
                showTransactionDetails({hash: query});
            } else if (query.startsWith('0x') && query.length === 42) {
                // Likely an address
                showAddressDetails(query);
            } else if (!isNaN(query)) {
                // Likely a block number
                const block = await silverBitcoinAPI.getBlockByNumber(parseInt(query));
                if (block) {
                    showBlockDetails(block);
                } else {
                    showError('Block not found');
                }
            } else {
                // Try to search for object
                try {
                    const object = await silverBitcoinAPI.getObject(query);
                    if (object) {
                        showObjectDetails(object);
                    } else {
                        showError('No results found for your search');
                    }
                } catch (e) {
                    showError('No results found for your search');
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
            showError('Search failed. Please try again.');
        }
    }
    
    /**
     * Show specific section and hide others
     * @param {string} sectionId - ID of section to show
     */
    function showSection(sectionId) {
        // Hide all sections
        homeSection.classList.add('hidden');
        blocksSection.classList.add('hidden');
        transactionsSection.classList.add('hidden');
        validatorsSection.classList.add('hidden');
        blockDetailsSection.classList.add('hidden');
        transactionDetailsSection.classList.add('hidden');
        addressDetailsSection.classList.add('hidden');
        
        // Show requested section
        document.getElementById(sectionId).classList.remove('hidden');
        
        // Update navigation active state
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Show block details
     * @param {Object} block - Block data
     */
    function showBlockDetails(block) {
        const blockInfo = document.getElementById('blockInfo');
        const blockTransactionsTableBody = document.querySelector('#blockTransactionsTable tbody');
        
        // Format block data
        const blockNumber = parseInt(block.number, 16);
        const timestamp = new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString();
        const txCount = block.transactions ? block.transactions.length : 0;
        
        // Display block info
        blockInfo.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Block Height:</div>
                <div class="detail-value">${blockNumber.toLocaleString()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Timestamp:</div>
                <div class="detail-value">${timestamp}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Transactions:</div>
                <div class="detail-value">${txCount}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Hash:</div>
                <div class="detail-value">${block.hash}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Parent Hash:</div>
                <div class="detail-value">${block.parentHash}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Miner:</div>
                <div class="detail-value">${block.miner || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gas Used:</div>
                <div class="detail-value">${block.gasUsed ? parseInt(block.gasUsed, 16).toLocaleString() : 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gas Limit:</div>
                <div class="detail-value">${block.gasLimit ? parseInt(block.gasLimit, 16).toLocaleString() : 'N/A'}</div>
            </div>
        `;
        
        // Clear transactions table
        blockTransactionsTableBody.innerHTML = '';
        
        // Populate transactions if available
        if (block.transactions && block.transactions.length > 0) {
            block.transactions.slice(0, 10).forEach(tx => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatHash(tx.hash)}</td>
                    <td>${tx.from ? formatHash(tx.from) : 'N/A'}</td>
                    <td>${tx.to ? formatHash(tx.to) : 'N/A'}</td>
                    <td>${tx.value ? formatValue(tx.value) : 'N/A'}</td>
                `;
                blockTransactionsTableBody.appendChild(row);
            });
        } else {
            blockTransactionsTableBody.innerHTML = '<tr><td colspan="4">No transactions in this block</td></tr>';
        }
        
        // Show block details section
        showSection('blockDetails');
    }
    
    /**
     * Show transaction details
     * @param {Object} tx - Transaction data
     */
    function showTransactionDetails(tx) {
        const transactionInfo = document.getElementById('transactionInfo');
        
        // Display transaction info
        transactionInfo.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Transaction Hash:</div>
                <div class="detail-value">${tx.hash}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">Success</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Block:</div>
                <div class="detail-value">${tx.blockNumber ? parseInt(tx.blockNumber, 16).toLocaleString() : 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Timestamp:</div>
                <div class="detail-value">N/A</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">From:</div>
                <div class="detail-value">${tx.from || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">To:</div>
                <div class="detail-value">${tx.to || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Value:</div>
                <div class="detail-value">${tx.value || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gas Price:</div>
                <div class="detail-value">${tx.gasPrice || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gas Limit:</div>
                <div class="detail-value">${tx.gas || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Nonce:</div>
                <div class="detail-value">${tx.nonce || 'N/A'}</div>
            </div>
        `;
        
        // Show transaction details section
        showSection('transactionDetails');
    }
    
    /**
     * Show address details
     * @param {string} address - Address to show details for
     */
    async function showAddressDetails(address) {
        try {
            // Fetch address info
            const [balance, txCount] = await Promise.all([
                silverBitcoinAPI.getBalance(address),
                silverBitcoinAPI.getTransactionCount(address)
            ]);
            
            const addressInfo = document.getElementById('addressInfo');
            
            // Display address info
            addressInfo.innerHTML = `
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div class="detail-value">${address}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Balance:</div>
                    <div class="detail-value">${formatValue(balance)} SBTC</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Transaction Count:</div>
                    <div class="detail-value">${parseInt(txCount, 16).toLocaleString()}</div>
                </div>
            `;
            
            // Load transaction history
            await loadAddressTransactions(address);
            
            // Show address details section
            showSection('addressDetails');
        } catch (error) {
            console.error('Failed to load address details:', error);
            showError('Failed to load address details');
        }
    }
    
    /**
     * Load transaction history for address
     * PRODUCTION-GRADE REAL IMPLEMENTATION
     * @param {string} address - Address to load transactions for
     */
    async function loadAddressTransactions(address) {
        try {
            if (typeof AdvancedRPCIntegration === 'undefined') {
                const addressTransactionsTableBody = document.querySelector('#addressTransactionsTable tbody');
                addressTransactionsTableBody.innerHTML = '<tr><td colspan="6">RPC integration not available</td></tr>';
                return;
            }
            
            const addressTransactionsTableBody = document.querySelector('#addressTransactionsTable tbody');
            
            // Get real transaction history from RPC
            const transactions = await AdvancedRPCIntegration.address.listTransactions(address);
            
            // Clear existing content
            addressTransactionsTableBody.innerHTML = '';
            
            if (!transactions || transactions.length === 0) {
                addressTransactionsTableBody.innerHTML = '<tr><td colspan="6">No transactions found for this address</td></tr>';
                return;
            }
            
            // Populate table with real data
            transactions.slice(0, 20).forEach(tx => {
                const row = document.createElement('tr');
                const timestamp = FormatUtil.formatTimestampReadable(tx.time || tx.blocktime || 0);
                
                row.innerHTML = `
                    <td>${FormatUtil.formatHash(tx.txid || tx.hash, true)}</td>
                    <td>${tx.blockheight || 'Mempool'}</td>
                    <td>${FormatUtil.formatHash(tx.from || address, true)}</td>
                    <td>${FormatUtil.formatHash(tx.to || address, true)}</td>
                    <td>${FormatUtil.formatBalance(tx.amount || tx.value || 0)}</td>
                    <td>${timestamp}</td>
                `;
                
                addressTransactionsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load address transactions:', error);
            const addressTransactionsTableBody = document.querySelector('#addressTransactionsTable tbody');
            addressTransactionsTableBody.innerHTML = `<tr><td colspan="6">Failed to load transaction history: ${error.message}</td></tr>`;
        }
    }
    
    /**
     * Show object details
     * PRODUCTION-GRADE REAL IMPLEMENTATION
     * @param {Object} object - Object data
     */
    function showObjectDetails(object) {
        // SilverBitcoin Pure PoW blockchain - handle address lookups
        if (object.id && object.id.startsWith('0x') && object.id.length === 42) {
            showAddressDetails(object.id);
        } else if (object.id && object.id.length === 64) {
            // Likely a transaction hash
            showTransactionDetails({hash: object.id});
        } else {
            showError('Object type not recognized. Please search for a valid address or transaction hash.');
        }
    }
    
    /**
     * Format hash for display (truncate middle)
     * @param {string} hash - Hash to format
     * @returns {string} Formatted hash
     */
    function formatHash(hash) {
        if (!hash) return 'N/A';
        if (hash.length <= 20) return hash;
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    
    /**
     * Format value from hex wei to readable ETH
     * @param {string} value - Hex value in wei
     * @returns {string} Formatted value
     */
    function formatValue(value) {
        if (!value) return 'N/A';
        if (!value.startsWith('0x')) return value;
        
        // Convert hex to decimal
        const wei = parseInt(value, 16);
        const eth = wei / 1e18;
        return eth.toFixed(4);
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        alert(message); // Simple alert for now, could be enhanced with modal or toast
    }
});