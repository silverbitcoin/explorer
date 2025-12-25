/**
 * Smart Contracts Page
 * Displays deployed smart contracts and their details
 */

const SmartContractsPage = (() => {
    let contractsList = [];
    let updateInterval = null;
    
    /**
     * Initialize smart contracts page
     */
    async function init() {
        try {
            console.log('Initializing Smart Contracts page...');
            
            const content = document.getElementById('page-content');
            if (!content) {
                throw new Error('Page content container not found');
            }
            
            content.innerHTML = `
                <div class="contracts-container">
                    <div class="page-header">
                        <h1>Smart Contracts</h1>
                        <p>Deployed Slvr smart contracts on the blockchain</p>
                    </div>
                    
                    <div class="contracts-stats">
                        <div class="stat-card">
                            <div class="stat-label">Total Contracts</div>
                            <div class="stat-value" id="total-contracts">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Functions</div>
                            <div class="stat-value" id="total-functions">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Tables</div>
                            <div class="stat-value" id="total-tables">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Language</div>
                            <div class="stat-value">Slvr</div>
                        </div>
                    </div>
                    
                    <div class="contracts-list-container">
                        <div class="list-header">
                            <h2>Deployed Contracts</h2>
                            <button id="refresh-contracts" class="btn-refresh">🔄 Refresh</button>
                        </div>
                        <div id="contracts-list" class="contracts-list">
                            <div class="loading">Loading contracts...</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Setup event listeners
            const refreshBtn = document.getElementById('refresh-contracts');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadContracts);
            }
            
            // Load contracts
            await loadContracts();
            
            // Setup auto-refresh
            updateInterval = setInterval(loadContracts, 60000);
            
            console.log('✅ Smart Contracts page initialized');
        } catch (error) {
            console.error('Error initializing smart contracts page:', error);
            UIRenderer.showError('Failed to load contracts: ' + error.message);
        }
    }
    
    /**
     * Load contracts from RPC
     */
    async function loadContracts() {
        try {
            console.log('Loading smart contracts...');
            
            const contracts = await RPCClient.listSmartContracts();
            
            if (!Array.isArray(contracts)) {
                throw new Error('Invalid contracts response');
            }
            
            contractsList = contracts;
            
            // Update statistics
            updateContractStats();
            
            // Render contracts list
            renderContractsList();
            
            console.log(`✅ Loaded ${contracts.length} contracts`);
        } catch (error) {
            console.error('Error loading contracts:', error);
            UIRenderer.showError('Failed to load contracts: ' + error.message);
        }
    }
    
    /**
     * Update contract statistics
     */
    function updateContractStats() {
        try {
            const totalContracts = contractsList.length;
            
            let totalFunctions = 0;
            let totalTables = 0;
            
            contractsList.forEach(contract => {
                const parsed = SilverBlockchainAPI.parseSmartContract(contract);
                if (parsed.valid) {
                    totalFunctions += parsed.functions;
                    totalTables += parsed.tables;
                }
            });
            
            // Update DOM
            const totalContractsEl = document.getElementById('total-contracts');
            if (totalContractsEl) {
                totalContractsEl.textContent = totalContracts;
            }
            
            const totalFunctionsEl = document.getElementById('total-functions');
            if (totalFunctionsEl) {
                totalFunctionsEl.textContent = totalFunctions;
            }
            
            const totalTablesEl = document.getElementById('total-tables');
            if (totalTablesEl) {
                totalTablesEl.textContent = totalTables;
            }
        } catch (error) {
            console.error('Error updating contract stats:', error);
        }
    }
    
    /**
     * Render contracts list
     */
    function renderContractsList() {
        try {
            const listContainer = document.getElementById('contracts-list');
            if (!listContainer) {
                return;
            }
            
            if (contractsList.length === 0) {
                listContainer.innerHTML = '<div class="empty-state">No contracts deployed yet</div>';
                return;
            }
            
            const html = contractsList.map((contract) => {
                const parsed = SilverBlockchainAPI.parseSmartContract(contract);
                
                if (!parsed.valid) {
                    return '';
                }
                
                const createdDate = new Date(parsed.createdAt * 1000).toLocaleString();
                const updatedDate = new Date(parsed.updatedAt * 1000).toLocaleString();
                
                return `
                    <div class="contract-card">
                        <div class="contract-header">
                            <div class="contract-name">
                                <h3>${parsed.name}</h3>
                                <span class="contract-version">v${parsed.version}</span>
                            </div>
                            <div class="contract-author">
                                <small>by ${parsed.author}</small>
                            </div>
                        </div>
                        
                        <div class="contract-address">
                            <strong>Address:</strong> ${parsed.address.substring(0, 30)}...
                        </div>
                        
                        <div class="contract-details">
                            <div class="detail-row">
                                <span class="label">ID:</span>
                                <span class="value">${parsed.id.substring(0, 20)}...</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Language:</span>
                                <span class="value">${parsed.language}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Created:</span>
                                <span class="value">${createdDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Updated:</span>
                                <span class="value">${updatedDate}</span>
                            </div>
                        </div>
                        
                        <div class="contract-components">
                            <div class="component">
                                <div class="component-label">Functions</div>
                                <div class="component-value">${parsed.functions}</div>
                            </div>
                            <div class="component">
                                <div class="component-label">Tables</div>
                                <div class="component-value">${parsed.tables}</div>
                            </div>
                            <div class="component">
                                <div class="component-label">Capabilities</div>
                                <div class="component-value">${parsed.capabilities.length}</div>
                            </div>
                        </div>
                        
                        <div class="contract-hashes">
                            <div class="hash-item">
                                <small>Code Hash: ${parsed.codeHash.substring(0, 16)}...</small>
                            </div>
                            <div class="hash-item">
                                <small>State Hash: ${parsed.stateHash.substring(0, 16)}...</small>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            listContainer.innerHTML = html;
        } catch (error) {
            console.error('Error rendering contracts list:', error);
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
            console.error('Error cleaning up contracts page:', error);
        }
    }
    
    return {
        init,
        cleanup
    };
})();
