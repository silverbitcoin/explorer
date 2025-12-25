/**
 * Network Peers Page
 * Displays P2P network peers and their statistics
 */

const NetworkPeersPage = (() => {
    let peersList = [];
    let networkStats = null;
    let updateInterval = null;
    
    /**
     * Initialize network peers page
     */
    async function init() {
        try {
            console.log('Initializing Network Peers page...');
            
            const content = document.getElementById('page-content');
            if (!content) {
                throw new Error('Page content container not found');
            }
            
            content.innerHTML = `
                <div class="network-peers-container">
                    <div class="page-header">
                        <h1>Network Peers</h1>
                        <p>P2P network peers and connectivity statistics</p>
                    </div>
                    
                    <div class="network-stats">
                        <div class="stat-card">
                            <div class="stat-label">Connected Peers</div>
                            <div class="stat-value" id="connected-peers">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Peers</div>
                            <div class="stat-value" id="total-peers">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Avg Latency</div>
                            <div class="stat-value" id="avg-latency">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Network Health</div>
                            <div class="stat-value" id="network-health">-</div>
                        </div>
                    </div>
                    
                    <div class="network-details">
                        <div class="detail-card">
                            <h3>Network Traffic</h3>
                            <div class="traffic-stats">
                                <div class="traffic-item">
                                    <span class="label">Messages/sec:</span>
                                    <span class="value" id="messages-per-sec">-</span>
                                </div>
                                <div class="traffic-item">
                                    <span class="label">Bytes/sec:</span>
                                    <span class="value" id="bytes-per-sec">-</span>
                                </div>
                                <div class="traffic-item">
                                    <span class="label">Total Sent:</span>
                                    <span class="value" id="total-sent">-</span>
                                </div>
                                <div class="traffic-item">
                                    <span class="label">Total Received:</span>
                                    <span class="value" id="total-received">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="peers-list-container">
                        <div class="list-header">
                            <h2>Connected Peers</h2>
                            <button id="refresh-peers" class="btn-refresh">🔄 Refresh</button>
                        </div>
                        <div id="peers-list" class="peers-list">
                            <div class="loading">Loading peers...</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Setup event listeners
            const refreshBtn = document.getElementById('refresh-peers');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadNetworkPeers);
            }
            
            // Load peers
            await loadNetworkPeers();
            
            // Setup auto-refresh
            updateInterval = setInterval(loadNetworkPeers, 15000);
            
            console.log('✅ Network Peers page initialized');
        } catch (error) {
            console.error('Error initializing network peers page:', error);
            UIRenderer.showError('Failed to load network peers: ' + error.message);
        }
    }
    
    /**
     * Load network peers from RPC
     */
    async function loadNetworkPeers() {
        try {
            console.log('Loading network peers...');
            
            // Load peers and network stats
            const [peers, stats] = await Promise.all([
                RPCClient.getPeerInfo(),
                RPCClient.getNetworkStats()
            ]);
            
            if (!Array.isArray(peers)) {
                throw new Error('Invalid peers response');
            }
            
            peersList = peers;
            networkStats = stats;
            
            // Update statistics
            updateNetworkStats();
            
            // Render peers list
            renderPeersList();
            
            console.log(`✅ Loaded ${peers.length} peers`);
        } catch (error) {
            console.error('Error loading network peers:', error);
            UIRenderer.showError('Failed to load network peers: ' + error.message);
        }
    }
    
    /**
     * Update network statistics
     */
    function updateNetworkStats() {
        try {
            if (!networkStats) {
                return;
            }
            
            const parsed = SilverBlockchainAPI.parseNetworkStats(networkStats);
            
            if (!parsed.valid) {
                return;
            }
            
            // Update DOM
            const connectedEl = document.getElementById('connected-peers');
            if (connectedEl) {
                connectedEl.textContent = parsed.connectedPeers;
            }
            
            const totalEl = document.getElementById('total-peers');
            if (totalEl) {
                totalEl.textContent = parsed.totalPeers;
            }
            
            const latencyEl = document.getElementById('avg-latency');
            if (latencyEl) {
                latencyEl.textContent = `${parsed.avgLatencyMs}ms`;
            }
            
            const healthEl = document.getElementById('network-health');
            if (healthEl) {
                const health = parsed.connectedPeers > 0 ? 'Good' : 'Poor';
                healthEl.textContent = health;
            }
            
            // Traffic stats
            const messagesEl = document.getElementById('messages-per-sec');
            if (messagesEl) {
                messagesEl.textContent = parsed.messagesPerSec.toFixed(2);
            }
            
            const bytesEl = document.getElementById('bytes-per-sec');
            if (bytesEl) {
                bytesEl.textContent = (parsed.bytesPerSec / 1024).toFixed(2) + ' KB/s';
            }
            
            const sentEl = document.getElementById('total-sent');
            if (sentEl) {
                sentEl.textContent = formatBytes(parsed.totalBytesSent);
            }
            
            const receivedEl = document.getElementById('total-received');
            if (receivedEl) {
                receivedEl.textContent = formatBytes(parsed.totalBytesReceived);
            }
        } catch (error) {
            console.error('Error updating network stats:', error);
        }
    }
    
    /**
     * Render peers list
     */
    function renderPeersList() {
        try {
            const listContainer = document.getElementById('peers-list');
            if (!listContainer) {
                return;
            }
            
            if (peersList.length === 0) {
                listContainer.innerHTML = '<div class="empty-state">No peers connected</div>';
                return;
            }
            
            const html = peersList.map((peer) => {
                const parsed = SilverBlockchainAPI.parsePeerInfo(peer);
                
                if (!parsed.valid) {
                    return '';
                }
                
                const lastSeenDate = new Date(parsed.lastSeen * 1000).toLocaleString();
                const statusClass = parsed.isConnected ? 'connected' : 'disconnected';
                const healthClass = parsed.healthScore >= 80 ? 'healthy' : 
                                   parsed.healthScore >= 50 ? 'fair' : 'poor';
                
                return `
                    <div class="peer-card ${statusClass}">
                        <div class="peer-header">
                            <div class="peer-status ${statusClass}">
                                ${parsed.isConnected ? '🟢' : '🔴'}
                            </div>
                            <div class="peer-address">
                                <strong>${parsed.address}</strong>
                                <span class="peer-role">${parsed.role}</span>
                            </div>
                        </div>
                        
                        <div class="peer-details">
                            <div class="detail-row">
                                <span class="label">Peer ID:</span>
                                <span class="value">${parsed.peerId.substring(0, 16)}...</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Block Height:</span>
                                <span class="value">${parsed.blockHeight}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Latency:</span>
                                <span class="value">${parsed.latencyMs}ms</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Last Seen:</span>
                                <span class="value">${lastSeenDate}</span>
                            </div>
                        </div>
                        
                        <div class="peer-traffic">
                            <div class="traffic">
                                <span class="label">Sent:</span>
                                <span class="value">${formatBytes(parsed.bytesSent)}</span>
                            </div>
                            <div class="traffic">
                                <span class="label">Received:</span>
                                <span class="value">${formatBytes(parsed.bytesReceived)}</span>
                            </div>
                            <div class="traffic">
                                <span class="label">Messages:</span>
                                <span class="value">${parsed.messagesSent + parsed.messagesReceived}</span>
                            </div>
                        </div>
                        
                        <div class="peer-health">
                            <div class="health-bar">
                                <div class="health-fill ${healthClass}" style="width: ${parsed.healthScore}%"></div>
                            </div>
                            <span class="health-score">${parsed.healthScore}%</span>
                        </div>
                    </div>
                `;
            }).join('');
            
            listContainer.innerHTML = html;
        } catch (error) {
            console.error('Error rendering peers list:', error);
        }
    }
    
    /**
     * Format bytes to human readable format
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
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
            console.error('Error cleaning up network peers page:', error);
        }
    }
    
    return {
        init,
        cleanup
    };
})();
