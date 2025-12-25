/**
 * SilverBitcoin Explorer - Main Application
 * Production-grade single-page application
 */

const App = (() => {
    let currentPage = null;
    let connectionCheckInterval = null;
    
    /**
     * Initialize application
     */
    async function init() {
        try {
            console.log('Initializing SilverBitcoin Explorer...');
            
            // Initialize RPC Connector first
            await initializeRpcConnector();
            
            // Check RPC connection
            await checkRPCConnection();
            
            // Setup event listeners
            setupEventListeners();
            
            // Setup theme
            setupTheme();
            
            // Setup real-time connection monitoring
            setupConnectionMonitoring();
            
            // Handle initial route
            handleRoute();
            
            // Listen for hash changes
            window.addEventListener('hashchange', handleRoute);
            
            console.log('SilverBitcoin Explorer initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            UIRenderer.showError('Failed to initialize application');
        }
    }
    
    /**
     * Initialize RPC Connector
     */
    async function initializeRpcConnector() {
        try {
            if (typeof RpcConnector === 'undefined') {
                console.warn('⚠️ RpcConnector not available, will use HTTP fallback');
                return;
            }
            
            console.log('🚀 Initializing RPC Connector...');
            
            // Detect network and set endpoints
            const hostname = window.location.hostname;
            let network = 'MAINNET';
            
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
                network = 'LOCAL';
            } else if (hostname.includes('testnet')) {
                network = 'TESTNET';
            }
            
            console.log(`📍 Detected network: ${network}`);
            
            // Set endpoints based on network
            if (typeof RPC_CONNECTOR_ENDPOINTS !== 'undefined' && RPC_CONNECTOR_ENDPOINTS[network]) {
                const endpoints = RPC_CONNECTOR_ENDPOINTS[network];
                RpcConnector.setEndpoints(endpoints);
                console.log(`🔗 RPC Connector endpoints configured for ${network}:`, endpoints);
            }
            
            // Setup event listeners
            RpcConnector.addEventListener('onConnect', (data) => {
                console.log('✅ RpcConnector connected:', data);
                UIRenderer.updateConnectionStatus(true);
            });
            
            RpcConnector.addEventListener('onDisconnect', (data) => {
                console.log('⚠️ RpcConnector disconnected:', data);
                UIRenderer.updateConnectionStatus(false);
            });
            
            RpcConnector.addEventListener('onError', (error) => {
                console.error('❌ RpcConnector error:', error);
                UIRenderer.showError('Connection error: ' + error.message);
            });
            
            // Start connection
            await RpcConnector.connect();
            
            console.log('✅ RPC Connector initialized');
        } catch (error) {
            console.error('Error initializing RPC Connector:', error);
            console.log('Falling back to HTTP-only mode');
        }
    }
    
    /**
     * Check RPC connection
     */
    async function checkRPCConnection() {
        try {
            console.log('Checking RPC connection to:', EXPLORER_CONFIG.RPC_ENDPOINT);
            const connected = await RPCClient.checkConnection();
            console.log('RPC connection status:', connected);
            UIRenderer.updateConnectionStatus(connected);
            
            if (!connected) {
                console.error('RPC endpoint is not responding');
                UIRenderer.showError('Unable to connect to RPC endpoint. Some features may not work.');
            } else {
                console.log('RPC connection successful');
            }
        } catch (error) {
            console.error('Error checking RPC connection:', error);
            UIRenderer.updateConnectionStatus(false);
        }
    }
    
    /**
     * Setup connection monitoring
     */
    function setupConnectionMonitoring() {
        try {
            // Don't check connection too frequently - causes slowdown
            // Only check every 60 seconds instead of 30
            connectionCheckInterval = setInterval(async () => {
                try {
                    // Skip connection check if on dashboard page (it's already checking)
                    if (currentPage === DashboardPage) {
                        console.log('⏭️  Skipping connection check (dashboard is active)');
                        return;
                    }
                    await checkRPCConnection();
                } catch (error) {
                    console.error('Error in connection monitoring:', error);
                }
            }, 60000); // Check every 60 seconds instead of 30
        } catch (error) {
            console.error('Error setting up connection monitoring:', error);
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        try {
            // Global search
            const searchBtn = document.getElementById('search-btn');
            const searchInput = document.getElementById('global-search');
            
            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', () => {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.hash = '#/search/' + encodeURIComponent(query);
                    }
                });
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.hash = '#/search/' + encodeURIComponent(query);
                        }
                    }
                });
            }
            
            // Theme toggle
            const themeBtn = document.getElementById('theme-btn');
            if (themeBtn) {
                themeBtn.addEventListener('click', toggleTheme);
            }
            
            // Navigation links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    if (page) {
                        window.location.hash = '#/' + page;
                    }
                });
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }
    
    /**
     * Setup theme
     */
    function setupTheme() {
        try {
            const savedTheme = StorageUtil.getItem(EXPLORER_CONFIG.STORAGE.THEME_KEY, DEFAULT_THEME);
            applyTheme(savedTheme);
        } catch (error) {
            console.error('Error setting up theme:', error);
        }
    }
    
    /**
     * Toggle theme
     */
    function toggleTheme() {
        try {
            const currentTheme = StorageUtil.getItem(EXPLORER_CONFIG.STORAGE.THEME_KEY, DEFAULT_THEME);
            const newTheme = currentTheme === THEME_TYPES.DARK ? THEME_TYPES.LIGHT : THEME_TYPES.DARK;
            applyTheme(newTheme);
            StorageUtil.setItem(EXPLORER_CONFIG.STORAGE.THEME_KEY, newTheme);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }
    
    /**
     * Apply theme
     */
    function applyTheme(theme) {
        try {
            const root = document.documentElement;
            
            if (theme === THEME_TYPES.DARK) {
                root.setAttribute('data-theme', 'dark');
                const themeBtn = document.getElementById('theme-btn');
                if (themeBtn) {
                    themeBtn.querySelector('.theme-icon').textContent = '☀️';
                }
            } else {
                root.setAttribute('data-theme', 'light');
                const themeBtn = document.getElementById('theme-btn');
                if (themeBtn) {
                    themeBtn.querySelector('.theme-icon').textContent = '🌙';
                }
            }
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }
    
    /**
     * Handle route
     */
    async function handleRoute() {
        try {
            const hash = window.location.hash.substring(1) || '/';
            const parts = hash.split('/').filter(p => p);
            const page = parts[0] || 'dashboard';
            const param = parts[1] ? decodeURIComponent(parts[1]) : null;
            
            console.log(`📍 Routing to page: ${page}, param: ${param}`);
            
            // Cleanup previous page
            if (currentPage && currentPage.cleanup) {
                try {
                    currentPage.cleanup();
                } catch (e) {
                    console.warn('Error cleaning up previous page:', e);
                }
            }
            
            // Update active nav
            UIRenderer.setActiveNav(page);
            
            // Route to page
            switch (page) {
                case 'dashboard':
                    console.log('Loading DashboardPage...');
                    if (!DashboardPage) {
                        throw new Error('DashboardPage not loaded');
                    }
                    currentPage = DashboardPage;
                    await DashboardPage.init();
                    break;
                    
                case 'blocks':
                    console.log('Loading BlocksPage...');
                    if (!BlocksPage) {
                        throw new Error('BlocksPage not loaded');
                    }
                    currentPage = BlocksPage;
                    await BlocksPage.init();
                    break;
                    
                case 'transactions':
                    console.log('Loading TransactionsPage...');
                    if (!TransactionsPage) {
                        throw new Error('TransactionsPage not loaded');
                    }
                    currentPage = TransactionsPage;
                    await TransactionsPage.init();
                    break;
                    
                case 'accounts':
                    console.log('Loading AccountsPage...');
                    if (!AccountsPage) {
                        throw new Error('AccountsPage not loaded');
                    }
                    currentPage = AccountsPage;
                    await AccountsPage.init();
                    break;
                    
                case 'address':
                    console.log('Loading AddressDetailsPage...');
                    if (!AddressDetailsPage) {
                        throw new Error('AddressDetailsPage not loaded');
                    }
                    currentPage = AddressDetailsPage;
                    await AddressDetailsPage.init(param);
                    break;
                    
                case 'tx':
                    console.log('Loading TransactionDetailsPage...');
                    if (!TransactionDetailsPage) {
                        throw new Error('TransactionDetailsPage not loaded');
                    }
                    currentPage = TransactionDetailsPage;
                    await TransactionDetailsPage.init(param);
                    break;
                    
                case 'block':
                    console.log('Loading BlockDetailsPage...');
                    if (!BlockDetailsPage) {
                        throw new Error('BlockDetailsPage not loaded');
                    }
                    currentPage = BlockDetailsPage;
                    await BlockDetailsPage.init(param);
                    break;
                    
                case 'analytics':
                    console.log('Loading AnalyticsDashboardPage...');
                    if (!AnalyticsDashboardPage) {
                        throw new Error('AnalyticsDashboardPage not loaded');
                    }
                    currentPage = AnalyticsDashboardPage;
                    if (AnalyticsDashboardPage.activate) {
                        AnalyticsDashboardPage.activate();
                    } else if (AnalyticsDashboardPage.init) {
                        await AnalyticsDashboardPage.init();
                    }
                    break;
                    
                case 'mining':
                    console.log('Loading MiningDetailsPage...');
                    if (!MiningDetailsPage) {
                        throw new Error('MiningDetailsPage not loaded');
                    }
                    currentPage = MiningDetailsPage;
                    if (MiningDetailsPage.activate) {
                        MiningDetailsPage.activate();
                    } else if (MiningDetailsPage.init) {
                        await MiningDetailsPage.init();
                    }
                    break;
                    
                case 'validators':
                    console.log('Loading ValidatorsPage...');
                    if (!ValidatorsPage) {
                        throw new Error('ValidatorsPage not loaded');
                    }
                    currentPage = ValidatorsPage;
                    await ValidatorsPage.init();
                    break;
                    
                case 'contracts':
                    console.log('Loading SmartContractsPage...');
                    if (!SmartContractsPage) {
                        throw new Error('SmartContractsPage not loaded');
                    }
                    currentPage = SmartContractsPage;
                    await SmartContractsPage.init();
                    break;
                    
                case 'privacy':
                    console.log('Loading PrivacyTransactionsPage...');
                    if (!PrivacyTransactionsPage) {
                        throw new Error('PrivacyTransactionsPage not loaded');
                    }
                    currentPage = PrivacyTransactionsPage;
                    await PrivacyTransactionsPage.init();
                    break;
                    
                case 'peers':
                    console.log('Loading NetworkPeersPage...');
                    if (!NetworkPeersPage) {
                        throw new Error('NetworkPeersPage not loaded');
                    }
                    currentPage = NetworkPeersPage;
                    await NetworkPeersPage.init();
                    break;
                    
                default:
                    console.log('Unknown page, redirecting to dashboard');
                    window.location.hash = '#/dashboard';
                    break;
            }
            
            console.log(`✅ Page loaded: ${page}`);
        } catch (error) {
            console.error('Error handling route:', error);
            UIRenderer.showError('Failed to load page: ' + error.message);
        }
    }
    
    /**
     * Cleanup
     */
    function cleanup() {
        try {
            if (connectionCheckInterval) {
                clearInterval(connectionCheckInterval);
                connectionCheckInterval = null;
            }
            
            if (currentPage && currentPage.cleanup) {
                currentPage.cleanup();
            } else if (currentPage && currentPage.deactivate) {
                currentPage.deactivate();
            }
            
            Subscriptions.cleanup();
            window.removeEventListener('hashchange', handleRoute);
        } catch (error) {
            console.error('Error cleaning up app:', error);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    return {
        init,
        cleanup,
    };
})();
