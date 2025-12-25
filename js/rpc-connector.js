/**
 * RPC Connector - Multi-Protocol Connection Manager
 * Tries WebSocket (WSS/WS) first, falls back to HTTP
 * Production-grade for SilverBitcoin 2.0
 */

const RpcConnector = (() => {
    // Connection state
    let currentConnection = null;
    let connectionType = null; // 'websocket' or 'http'
    let isConnected = false;
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 5;
    let reconnectDelay = 1000;
    let reconnectTimeout = null;
    
    // Endpoints configuration
    const endpoints = {
        websocketSecure: 'wss://rpc.silverbitcoin.org',
        websocket: 'ws://rpc.silverbitcoin.org',
        http: 'https://rpc.silverbitcoin.org'
    };
    
    // Connection timeouts
    const timeouts = {
        websocket: 5000,
        http: 10000
    };
    
    // Event listeners
    const listeners = {
        onConnect: [],
        onDisconnect: [],
        onError: [],
        onMessage: []
    };
    
    /**
     * Add event listener
     */
    function addEventListener(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback);
        }
    }
    
    /**
     * Remove event listener
     */
    function removeEventListener(event, callback) {
        if (listeners[event]) {
            listeners[event] = listeners[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * Emit event
     */
    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
    
    /**
     * Try WebSocket Secure connection
     */
    function connectWebSocketSecure() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Attempting WSS connection:', endpoints.websocketSecure);
            
            const timeout = setTimeout(() => {
                reject(new Error('WSS connection timeout'));
            }, timeouts.websocket);
            
            try {
                const ws = new WebSocket(endpoints.websocketSecure);
                
                ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('✅ WSS connection established');
                    setupWebSocketHandlers(ws);
                    resolve(ws);
                };
                
                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('❌ WSS connection error:', error);
                    reject(new Error('WSS connection failed'));
                };
                
                ws.onclose = () => {
                    console.log('⚠️ WSS connection closed');
                    handleDisconnect();
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    
    /**
     * Try WebSocket connection
     */
    function connectWebSocket() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Attempting WS connection:', endpoints.websocket);
            
            const timeout = setTimeout(() => {
                reject(new Error('WS connection timeout'));
            }, timeouts.websocket);
            
            try {
                const ws = new WebSocket(endpoints.websocket);
                
                ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('✅ WS connection established');
                    setupWebSocketHandlers(ws);
                    resolve(ws);
                };
                
                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('❌ WS connection error:', error);
                    reject(new Error('WS connection failed'));
                };
                
                ws.onclose = () => {
                    console.log('⚠️ WS connection closed');
                    handleDisconnect();
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    
    /**
     * Try HTTP connection
     */
    function connectHttp() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Attempting HTTP connection:', endpoints.http);
            
            const timeout = setTimeout(() => {
                reject(new Error('HTTP connection timeout'));
            }, timeouts.http);
            
            try {
                fetch(endpoints.http, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'getblockcount',
                        params: [],
                        id: 1
                    })
                })
                .then(response => {
                    clearTimeout(timeout);
                    if (response.ok) {
                        console.log('✅ HTTP connection established');
                        resolve(endpoints.http);
                    } else {
                        reject(new Error(`HTTP ${response.status}`));
                    }
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    
    /**
     * Setup WebSocket event handlers
     */
    function setupWebSocketHandlers(ws) {
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                emit('onMessage', data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            emit('onError', error);
        };
    }
    
    /**
     * Handle disconnection
     */
    function handleDisconnect() {
        isConnected = false;
        emit('onDisconnect', { type: connectionType });
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Max 30 seconds
            
            console.log(`⏳ Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            
            reconnectTimeout = setTimeout(() => {
                connect();
            }, reconnectDelay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            emit('onError', new Error('Connection lost - max reconnection attempts reached'));
        }
    }
    
    /**
     * Main connection function
     */
    async function connect() {
        try {
            console.log('🚀 Starting RPC connection sequence...');
            
            // Reset reconnect counter on successful connection attempt
            if (isConnected) {
                reconnectAttempts = 0;
                reconnectDelay = 1000;
            }
            
            // Try WSS first
            try {
                currentConnection = await connectWebSocketSecure();
                connectionType = 'websocket-secure';
                isConnected = true;
                reconnectAttempts = 0;
                reconnectDelay = 1000;
                emit('onConnect', { type: connectionType, endpoint: endpoints.websocketSecure });
                return;
            } catch (error) {
                console.warn('WSS failed:', error.message);
            }
            
            // Try WS
            try {
                currentConnection = await connectWebSocket();
                connectionType = 'websocket';
                isConnected = true;
                reconnectAttempts = 0;
                reconnectDelay = 1000;
                emit('onConnect', { type: connectionType, endpoint: endpoints.websocket });
                return;
            } catch (error) {
                console.warn('WS failed:', error.message);
            }
            
            // Try HTTP
            try {
                currentConnection = await connectHttp();
                connectionType = 'http';
                isConnected = true;
                reconnectAttempts = 0;
                reconnectDelay = 1000;
                emit('onConnect', { type: connectionType, endpoint: endpoints.http });
                return;
            } catch (error) {
                console.warn('HTTP failed:', error.message);
            }
            
            // All connections failed
            throw new Error('All RPC endpoints failed');
        } catch (error) {
            console.error('❌ Connection failed:', error);
            isConnected = false;
            emit('onError', error);
            
            // Schedule reconnection
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                reconnectDelay = Math.min(reconnectDelay * 2, 30000);
                
                console.log(`⏳ Retrying in ${reconnectDelay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
                
                reconnectTimeout = setTimeout(() => {
                    connect();
                }, reconnectDelay);
            }
        }
    }
    
    /**
     * Send message via WebSocket
     */
    function sendWebSocketMessage(message) {
        if (connectionType && connectionType.includes('websocket') && currentConnection) {
            try {
                currentConnection.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        }
        return false;
    }
    
    /**
     * Send RPC call
     */
    async function sendRpcCall(method, params = []) {
        if (!isConnected) {
            throw new Error('Not connected to RPC endpoint');
        }
        
        const request = {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: Math.floor(Math.random() * 1000000)
        };
        
        // Use WebSocket if available
        if (connectionType && connectionType.includes('websocket')) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('RPC call timeout'));
                }, 30000);
                
                const messageHandler = (data) => {
                    if (data.id === request.id) {
                        clearTimeout(timeout);
                        removeEventListener('onMessage', messageHandler);
                        
                        if (data.error) {
                            reject(new Error(data.error.message));
                        } else {
                            resolve(data.result);
                        }
                    }
                };
                
                addEventListener('onMessage', messageHandler);
                sendWebSocketMessage(request);
            });
        }
        
        // Fall back to HTTP
        if (connectionType === 'http') {
            try {
                const response = await fetch(currentConnection, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }
                
                return data.result;
            } catch (error) {
                throw error;
            }
        }
        
        throw new Error('No valid connection type');
    }
    
    /**
     * Disconnect
     */
    function disconnect() {
        console.log('🔌 Disconnecting from RPC endpoint');
        
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        
        if (currentConnection && connectionType && connectionType.includes('websocket')) {
            try {
                currentConnection.close();
            } catch (error) {
                console.error('Error closing WebSocket:', error);
            }
        }
        
        currentConnection = null;
        connectionType = null;
        isConnected = false;
        reconnectAttempts = 0;
        reconnectDelay = 1000;
    }
    
    /**
     * Get connection status
     */
    function getStatus() {
        return {
            isConnected: isConnected,
            connectionType: connectionType,
            endpoint: currentConnection ? (
                connectionType === 'http' ? currentConnection : 
                connectionType === 'websocket-secure' ? endpoints.websocketSecure :
                connectionType === 'websocket' ? endpoints.websocket : 'unknown'
            ) : null,
            reconnectAttempts: reconnectAttempts,
            maxReconnectAttempts: maxReconnectAttempts
        };
    }
    
    /**
     * Get current endpoint
     */
    function getCurrentEndpoint() {
        if (connectionType === 'websocket-secure') return endpoints.websocketSecure;
        if (connectionType === 'websocket') return endpoints.websocket;
        if (connectionType === 'http') return endpoints.http;
        return null;
    }
    
    /**
     * Update endpoints
     */
    function setEndpoints(newEndpoints) {
        if (newEndpoints.websocketSecure) endpoints.websocketSecure = newEndpoints.websocketSecure;
        if (newEndpoints.websocket) endpoints.websocket = newEndpoints.websocket;
        if (newEndpoints.http) endpoints.http = newEndpoints.http;
        console.log('📝 Endpoints updated:', endpoints);
    }
    
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    return {
        connect,
        disconnect,
        sendRpcCall,
        sendWebSocketMessage,
        getStatus,
        getCurrentEndpoint,
        setEndpoints,
        addEventListener,
        removeEventListener,
        
        // Direct access to endpoints for configuration
        endpoints: endpoints,
        timeouts: timeouts
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RpcConnector;
}
