/**
 * Privacy Transactions Page
 * Displays Lelantus JoinSplit and MimbleWimble transactions
 */

const PrivacyTransactionsPage = (() => {
    let privacyTransactions = [];
    let updateInterval = null;
    let filterType = 'all'; // all, lelantus, mimblewimble
    
    /**
     * Initialize privacy transactions page
     */
    async function init() {
        try {
            console.log('Initializing Privacy Transactions page...');
            
            const content = document.getElementById('page-content');
            if (!content) {
                throw new Error('Page content container not found');
            }
            
            content.innerHTML = `
                <div class="privacy-transactions-container">
                    <div class="page-header">
                        <h1>Privacy Transactions</h1>
                        <p>Lelantus JoinSplit and MimbleWimble transactions</p>
                    </div>
                    
                    <div class="privacy-stats">
                        <div class="stat-card">
                            <div class="stat-label">Total Privacy Tx</div>
                            <div class="stat-value" id="total-privacy-tx">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Lelantus Tx</div>
                            <div class="stat-value" id="lelantus-count">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">MimbleWimble Tx</div>
                            <div class="stat-value" id="mimblewimble-count">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Privacy Level</div>
                            <div class="stat-value">High</div>
                        </div>
                    </div>
                    
                    <div class="privacy-filters">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="lelantus">Lelantus</button>
                        <button class="filter-btn" data-filter="mimblewimble">MimbleWimble</button>
                    </div>
                    
                    <div class="privacy-list-container">
                        <div class="list-header">
                            <h2>Privacy Transactions</h2>
                            <button id="refresh-privacy" class="btn-refresh">🔄 Refresh</button>
                        </div>
                        <div id="privacy-list" class="privacy-list">
                            <div class="loading">Loading privacy transactions...</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Setup event listeners
            const refreshBtn = document.getElementById('refresh-privacy');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadPrivacyTransactions);
            }
            
            // Setup filter buttons
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    filterType = e.target.getAttribute('data-filter');
                    renderPrivacyList();
                });
            });
            
            // Load transactions
            await loadPrivacyTransactions();
            
            // Setup auto-refresh
            updateInterval = setInterval(loadPrivacyTransactions, 30000);
            
            console.log('✅ Privacy Transactions page initialized');
        } catch (error) {
            console.error('Error initializing privacy transactions page:', error);
            UIRenderer.showError('Failed to load privacy transactions: ' + error.message);
        }
    }
    
    /**
     * Load privacy transactions from RPC
     */
    async function loadPrivacyTransactions() {
        try {
            console.log('Loading privacy transactions...');
            
            // Load both Lelantus and MimbleWimble transactions
            const query = {
                type: 'privacy',
                limit: 100
            };
            
            const transactions = await RPCClient.queryTransactions(query);
            
            if (!Array.isArray(transactions)) {
                throw new Error('Invalid transactions response');
            }
            
            privacyTransactions = transactions;
            
            // Update statistics
            updatePrivacyStats();
            
            // Render list
            renderPrivacyList();
            
            console.log(`✅ Loaded ${transactions.length} privacy transactions`);
        } catch (error) {
            console.error('Error loading privacy transactions:', error);
            UIRenderer.showError('Failed to load privacy transactions: ' + error.message);
        }
    }
    
    /**
     * Update privacy transaction statistics
     */
    function updatePrivacyStats() {
        try {
            let lelantusCount = 0;
            let mimblewimbleCount = 0;
            
            privacyTransactions.forEach(tx => {
                if (tx.type === 'lelantus_joinsplit') {
                    lelantusCount++;
                } else if (tx.type === 'mimblewimble') {
                    mimblewimbleCount++;
                }
            });
            
            // Update DOM
            const totalEl = document.getElementById('total-privacy-tx');
            if (totalEl) {
                totalEl.textContent = privacyTransactions.length;
            }
            
            const lelantusEl = document.getElementById('lelantus-count');
            if (lelantusEl) {
                lelantusEl.textContent = lelantusCount;
            }
            
            const mimblewimbleEl = document.getElementById('mimblewimble-count');
            if (mimblewimbleEl) {
                mimblewimbleEl.textContent = mimblewimbleCount;
            }
        } catch (error) {
            console.error('Error updating privacy stats:', error);
        }
    }
    
    /**
     * Render privacy transactions list
     */
    function renderPrivacyList() {
        try {
            const listContainer = document.getElementById('privacy-list');
            if (!listContainer) {
                return;
            }
            
            // Filter transactions
            let filtered = privacyTransactions;
            if (filterType !== 'all') {
                const typeMap = {
                    'lelantus': 'lelantus_joinsplit',
                    'mimblewimble': 'mimblewimble'
                };
                filtered = privacyTransactions.filter(tx => tx.type === typeMap[filterType]);
            }
            
            if (filtered.length === 0) {
                listContainer.innerHTML = '<div class="empty-state">No privacy transactions found</div>';
                return;
            }
            
            const html = filtered.map((tx) => {
                let parsed;
                if (tx.type === 'lelantus_joinsplit') {
                    parsed = SilverBlockchainAPI.parseJoinSplit(tx);
                } else if (tx.type === 'mimblewimble') {
                    parsed = SilverBlockchainAPI.parseMimblewimbleTransaction(tx);
                } else {
                    return '';
                }
                
                if (!parsed.valid) {
                    return '';
                }
                
                const timestamp = new Date(parsed.timestamp * 1000).toLocaleString();
                const typeLabel = tx.type === 'lelantus_joinsplit' ? 'Lelantus' : 'MimbleWimble';
                
                return `
                    <div class="privacy-tx-card ${tx.type}">
                        <div class="tx-header">
                            <div class="tx-type-badge">${typeLabel}</div>
                            <div class="tx-id">
                                <strong>${parsed.txid.substring(0, 20)}...</strong>
                            </div>
                            <div class="tx-time">
                                <small>${timestamp}</small>
                            </div>
                        </div>
                        
                        <div class="tx-details">
                            <div class="detail-row">
                                <span class="label">Inputs:</span>
                                <span class="value">${parsed.inputCount}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Outputs:</span>
                                <span class="value">${parsed.outputCount}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Fee:</span>
                                <span class="value">${parsed.fee.slvr}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Confirmations:</span>
                                <span class="value">${parsed.confirmations}</span>
                            </div>
                        </div>
                        
                        <div class="tx-properties">
                            ${tx.type === 'lelantus_joinsplit' ? `
                                <div class="property">
                                    <span class="label">Privacy Level:</span>
                                    <span class="value">${parsed.privacyLevel}</span>
                                </div>
                                <div class="property">
                                    <span class="label">Proof Verified:</span>
                                    <span class="value ${parsed.proofVerified ? 'verified' : 'unverified'}">
                                        ${parsed.proofVerified ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                            ` : `
                                <div class="property">
                                    <span class="label">Kernels:</span>
                                    <span class="value">${parsed.kernelCount}</span>
                                </div>
                                <div class="property">
                                    <span class="label">Scalability:</span>
                                    <span class="value">Extreme</span>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
            
            listContainer.innerHTML = html;
        } catch (error) {
            console.error('Error rendering privacy list:', error);
        }
    }
    
    /**
     * Cleanup
     */
    function cleanup() {
        try {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        } catch (error) {
            console.error('Error cleaning up privacy transactions page:', error);
        }
    }
    
    return {
        init,
        cleanup
    };
})();
