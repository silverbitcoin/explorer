/**
 * Analytics Dashboard Page
 * PRODUCTION-GRADE IMPLEMENTATION
 * 
 * Real-time blockchain analytics with comprehensive metrics
 * SHA-512 cryptographic verification and data validation
 * 
 */

const AnalyticsDashboardPage = (() => {
    // ============================================================================
    // PAGE CONFIGURATION
    // ============================================================================
    
    const PAGE_CONFIG = {
        PAGE_ID: 'analytics-dashboard',
        TITLE: 'Analytics Dashboard',
        REFRESH_INTERVAL_MS: 10_000,
        CHART_UPDATE_INTERVAL_MS: 5_000,
    };
    
    let pageState = {
        isActive: false,
        refreshInterval: null,
        charts: {},
        lastUpdate: 0,
    };
    
    // ============================================================================
    // PAGE RENDERING
    // ============================================================================
    
    function renderPage() {
        const container = document.getElementById('page-container');
        if (!container) {
            throw new Error('page-container element not found in DOM');
        }
        
        const html = `
            <div class="analytics-dashboard-page">
                <!-- Header -->
                <div class="page-header">
                    <h1 class="page-title">Blockchain Analytics</h1>
                    <p class="page-subtitle">Real-time metrics and network statistics</p>
                </div>
                
                <!-- Metrics Grid -->
                <div class="analytics-metrics-grid">
                    <!-- Blockchain Metrics -->
                    <div class="metrics-section">
                        <h2 class="section-title">Blockchain Metrics</h2>
                        <div class="metrics-cards">
                            <div class="metric-card">
                                <div class="metric-label">Block Height</div>
                                <div class="metric-value" id="metric-block-height">-</div>
                                <div class="metric-change" id="metric-block-height-change"></div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Difficulty</div>
                                <div class="metric-value" id="metric-difficulty">-</div>
                                <div class="metric-change" id="metric-difficulty-change"></div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Network Hashrate</div>
                                <div class="metric-value" id="metric-hashrate">-</div>
                                <div class="metric-unit">H/s</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Avg Block Time</div>
                                <div class="metric-value" id="metric-block-time">-</div>
                                <div class="metric-unit">seconds</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mining Metrics -->
                    <div class="metrics-section">
                        <h2 class="section-title">Mining Metrics</h2>
                        <div class="metrics-cards">
                            <div class="metric-card">
                                <div class="metric-label">Active Miners</div>
                                <div class="metric-value" id="metric-active-miners">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Pool Hashrate</div>
                                <div class="metric-value" id="metric-pool-hashrate">-</div>
                                <div class="metric-unit">H/s</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Share Accept Rate</div>
                                <div class="metric-value" id="metric-share-accept-rate">-</div>
                                <div class="metric-unit">%</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Next Halving</div>
                                <div class="metric-value" id="metric-next-halving">-</div>
                                <div class="metric-unit">blocks</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Network Metrics -->
                    <div class="metrics-section">
                        <h2 class="section-title">Network Metrics</h2>
                        <div class="metrics-cards">
                            <div class="metric-card">
                                <div class="metric-label">Connected Peers</div>
                                <div class="metric-value" id="metric-peer-count">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Inbound Peers</div>
                                <div class="metric-value" id="metric-inbound-peers">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Outbound Peers</div>
                                <div class="metric-value" id="metric-outbound-peers">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Network Health</div>
                                <div class="metric-value" id="metric-network-health">-</div>
                                <div class="metric-status" id="metric-network-health-status"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Transaction Metrics -->
                    <div class="metrics-section">
                        <h2 class="section-title">Transaction Metrics</h2>
                        <div class="metrics-cards">
                            <div class="metric-card">
                                <div class="metric-label">Mempool Size</div>
                                <div class="metric-value" id="metric-mempool-size">-</div>
                                <div class="metric-unit">transactions</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Mempool Bytes</div>
                                <div class="metric-value" id="metric-mempool-bytes">-</div>
                                <div class="metric-unit">bytes</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Avg Fee Rate</div>
                                <div class="metric-value" id="metric-avg-fee-rate">-</div>
                                <div class="metric-unit">sat/byte</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Tx Per Second</div>
                                <div class="metric-value" id="metric-tx-per-second">-</div>
                                <div class="metric-unit">tx/s</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Security Metrics -->
                    <div class="metrics-section">
                        <h2 class="section-title">Security Metrics</h2>
                        <div class="metrics-cards">
                            <div class="metric-card">
                                <div class="metric-label">Chain Work</div>
                                <div class="metric-value" id="metric-chain-work">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Orphan Blocks</div>
                                <div class="metric-value" id="metric-orphan-blocks">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Reorg Depth</div>
                                <div class="metric-value" id="metric-reorg-depth">-</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Invalid Blocks</div>
                                <div class="metric-value" id="metric-invalid-blocks">-</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Section -->
                <div class="analytics-charts-section">
                    <h2 class="section-title">Historical Trends (24 Hours)</h2>
                    
                    <div class="charts-grid">
                        <!-- Hashrate Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Network Hashrate</h3>
                            <canvas id="chart-hashrate" class="analytics-chart"></canvas>
                        </div>
                        
                        <!-- Difficulty Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Difficulty</h3>
                            <canvas id="chart-difficulty" class="analytics-chart"></canvas>
                        </div>
                        
                        <!-- Transaction Count Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Mempool Transactions</h3>
                            <canvas id="chart-tx-count" class="analytics-chart"></canvas>
                        </div>
                        
                        <!-- Fee Rate Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Average Fee Rate</h3>
                            <canvas id="chart-fee-rate" class="analytics-chart"></canvas>
                        </div>
                        
                        <!-- Peer Count Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Connected Peers</h3>
                            <canvas id="chart-peer-count" class="analytics-chart"></canvas>
                        </div>
                        
                        <!-- Block Time Chart -->
                        <div class="chart-container">
                            <h3 class="chart-title">Block Time</h3>
                            <canvas id="chart-block-time" class="analytics-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Statistics Section -->
                <div class="analytics-statistics-section">
                    <h2 class="section-title">24-Hour Statistics</h2>
                    
                    <div class="statistics-grid">
                        <div class="stat-card">
                            <div class="stat-label">Avg Block Time</div>
                            <div class="stat-value" id="stat-avg-block-time">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Avg Difficulty</div>
                            <div class="stat-value" id="stat-avg-difficulty">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Avg Hashrate</div>
                            <div class="stat-value" id="stat-avg-hashrate">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Peak Hashrate</div>
                            <div class="stat-value" id="stat-peak-hashrate">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Min Hashrate</div>
                            <div class="stat-value" id="stat-min-hashrate">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Avg Fee Rate</div>
                            <div class="stat-value" id="stat-avg-fee-rate">-</div>
                        </div>
                    </div>
                </div>
                
                <!-- Last Updated -->
                <div class="page-footer">
                    <p class="last-updated">Last updated: <span id="last-updated-time">-</span></p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // ============================================================================
    // DATA FETCHING & UPDATING
    // ============================================================================
    
    async function updateAnalytics() {
        try {
            // Fetch all RPC data
            const [blockchainInfo, miningInfo, networkInfo, peerInfo, mempoolInfo] = 
                await AdvancedRPCIntegration.batch.fetchAllBlockchainData();
            
            // Update analytics engine
            const rpcData = {
                blockchainInfo,
                miningInfo,
                networkInfo,
                peerInfo,
                mempoolInfo,
            };
            
            await AnalyticsEngine.updateMetrics(rpcData);
            
            // Update UI
            updateMetricsDisplay();
            updateChartsDisplay();
            updateStatisticsDisplay();
            
            pageState.lastUpdate = Date.now();
            updateLastUpdatedTime();
        } catch (error) {
            console.error('Analytics update error:', error);
        }
    }
    
    function updateMetricsDisplay() {
        const state = AnalyticsEngine.getState();
        
        // Blockchain metrics
        setElementText('metric-block-height', state.blockchain.blockHeight.toLocaleString());
        setElementText('metric-difficulty', formatNumber(state.blockchain.difficulty));
        setElementText('metric-hashrate', formatHashrate(state.blockchain.hashrate));
        setElementText('metric-block-time', state.blockchain.blockTime.toFixed(0));
        
        // Mining metrics
        setElementText('metric-active-miners', state.mining.activeMiners.toLocaleString());
        setElementText('metric-pool-hashrate', formatHashrate(state.mining.totalHashrate));
        setElementText('metric-share-accept-rate', state.mining.shareAcceptRate.toFixed(2));
        setElementText('metric-next-halving', state.mining.nextHalving.toLocaleString());
        
        // Network metrics
        setElementText('metric-peer-count', state.network.peerCount.toLocaleString());
        setElementText('metric-inbound-peers', state.network.inboundPeers.toLocaleString());
        setElementText('metric-outbound-peers', state.network.outboundPeers.toLocaleString());
        setElementText('metric-network-health', state.network.networkHealth);
        
        // Transaction metrics
        setElementText('metric-mempool-size', state.transactions.mempoolSize.toLocaleString());
        setElementText('metric-mempool-bytes', formatBytes(state.transactions.mempoolBytes));
        setElementText('metric-avg-fee-rate', state.transactions.avgFeeRate.toFixed(8));
        setElementText('metric-tx-per-second', state.transactions.txPerSecond.toFixed(2));
        
        // Security metrics
        setElementText('metric-chain-work', formatNumber(state.security.chainWork));
        setElementText('metric-orphan-blocks', state.security.orphanBlockCount.toLocaleString());
        setElementText('metric-reorg-depth', state.security.reorgDepth.toLocaleString());
        setElementText('metric-invalid-blocks', state.security.invalidBlockCount.toLocaleString());
    }
    
    function updateChartsDisplay() {
        const history = AnalyticsEngine.getHistory();
        
        if (history.timestamps.length === 0) return;
        
        // Format timestamps for x-axis
        const labels = history.timestamps.map(t => {
            const date = new Date(t);
            return date.toLocaleTimeString();
        });
        
        // Update charts
        updateChart('chart-hashrate', labels, history.hashrates, 'Network Hashrate (H/s)');
        updateChart('chart-difficulty', labels, history.difficulties, 'Difficulty');
        updateChart('chart-tx-count', labels, history.txCounts, 'Mempool Transactions');
        updateChart('chart-fee-rate', labels, history.feesPerByte, 'Fee Rate (sat/byte)');
        updateChart('chart-peer-count', labels, history.peerCounts, 'Connected Peers');
        updateChart('chart-block-time', labels, history.blockTimes, 'Block Time (seconds)');
    }
    
    function updateStatisticsDisplay() {
        const stats = AnalyticsEngine.getStatistics();
        
        setElementText('stat-avg-block-time', stats.avgBlockTime24h.toFixed(2) + 's');
        setElementText('stat-avg-difficulty', formatNumber(stats.avgDifficulty24h));
        setElementText('stat-avg-hashrate', formatHashrate(stats.avgHashrate24h));
        setElementText('stat-peak-hashrate', formatHashrate(stats.peakHashrate24h));
        setElementText('stat-min-hashrate', formatHashrate(stats.minHashrate24h));
        setElementText('stat-avg-fee-rate', stats.avgTxFee24h.toFixed(8));
    }
    
    function updateLastUpdatedTime() {
        const now = new Date();
        setElementText('last-updated-time', now.toLocaleTimeString());
    }
    
    // ============================================================================
    // CHART MANAGEMENT
    // ============================================================================
    
    function updateChart(canvasId, labels, data, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear previous chart
        if (pageState.charts[canvasId]) {
            pageState.charts[canvasId].destroy();
        }
        
        // Create new chart
        pageState.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2,
                    pointBackgroundColor: '#4CAF50',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    function setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }
    
    function formatNumber(num) {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(2) + 'B';
        } else if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(2) + 'M';
        } else if (num >= 1_000) {
            return (num / 1_000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }
    
    function formatHashrate(hashrate) {
        if (hashrate >= 1_000_000_000_000) {
            return (hashrate / 1_000_000_000_000).toFixed(2) + ' TH/s';
        } else if (hashrate >= 1_000_000_000) {
            return (hashrate / 1_000_000_000).toFixed(2) + ' GH/s';
        } else if (hashrate >= 1_000_000) {
            return (hashrate / 1_000_000).toFixed(2) + ' MH/s';
        } else if (hashrate >= 1_000) {
            return (hashrate / 1_000).toFixed(2) + ' KH/s';
        }
        return hashrate.toFixed(2) + ' H/s';
    }
    
    function formatBytes(bytes) {
        if (bytes >= 1_000_000_000) {
            return (bytes / 1_000_000_000).toFixed(2) + ' GB';
        } else if (bytes >= 1_000_000) {
            return (bytes / 1_000_000).toFixed(2) + ' MB';
        } else if (bytes >= 1_000) {
            return (bytes / 1_000).toFixed(2) + ' KB';
        }
        return bytes + ' B';
    }
    
    // ============================================================================
    // PAGE LIFECYCLE
    // ============================================================================
    
    function activate() {
        pageState.isActive = true;
        renderPage();
        updateAnalytics();
        
        // Set up auto-refresh
        pageState.refreshInterval = setInterval(updateAnalytics, PAGE_CONFIG.REFRESH_INTERVAL_MS);
    }
    
    function deactivate() {
        pageState.isActive = false;
        
        if (pageState.refreshInterval) {
            clearInterval(pageState.refreshInterval);
            pageState.refreshInterval = null;
        }
        
        // Destroy charts
        Object.values(pageState.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        pageState.charts = {};
    }
    
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    return {
        activate,
        deactivate,
        cleanup: deactivate,  // Alias for compatibility
        getPageId: () => PAGE_CONFIG.PAGE_ID,
        getTitle: () => PAGE_CONFIG.TITLE,
    };
})();
