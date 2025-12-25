/**
 * SilverBitcoin WebSocket Client
 * Real-time blockchain data streaming from Node.js backend
 * 
 * Features:
 * - Real-time block updates
 * - Real-time transaction updates
 * - Real-time balance updates
 * - Automatic reconnection
 * - Subscription management
 * - Event-based architecture
 */

class WebSocketClient {
    constructor(endpoint = EXPLORER_CONFIG.WS_ENDPOINT) {
        this.endpoint = endpoint;
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.subscriptions = new Set();
        this.eventListeners = new Map();
        this.messageQueue = [];
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        
        console.log('🔌 WebSocket Client initialized');
        console.log('   Endpoint:', this.endpoint);
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔗 Connecting to WebSocket server:', this.endpoint);
                
                this.ws = new WebSocket(this.endpoint);

                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    
                    // Start heartbeat
                    this.startHeartbeat();
                    
                    // Flush message queue
                    this.flushMessageQueue();
                    
                    // Re-subscribe to previous subscriptions
                    this.resubscribe();
                    
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.connected = false;
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    this.connected = false;
                    this.stopHeartbeat();
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        console.log('🔌 Disconnecting from WebSocket server');
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }

    /**
     * Subscribe to blockchain events
     */
    subscribe(channel) {
        if (this.subscriptions.has(channel)) {
            console.log(`Already subscribed to: ${channel}`);
            return;
        }

        const message = {
            action: 'subscribe',
            channel: channel
        };

        console.log(`📡 Subscribing to: ${channel}`);
        this.subscriptions.add(channel);
        this.send(message);
    }

    /**
     * Unsubscribe from blockchain events
     */
    unsubscribe(channel) {
        if (!this.subscriptions.has(channel)) {
            console.log(`Not subscribed to: ${channel}`);
            return;
        }

        const message = {
            action: 'unsubscribe',
            channel: channel
        };

        console.log(`📡 Unsubscribing from: ${channel}`);
        this.subscriptions.delete(channel);
        this.send(message);
    }

    /**
     * Subscribe to all important channels
     */
    subscribeAll() {
        console.log('📡 Subscribing to all channels');
        this.subscribe('blocks');
        this.subscribe('transactions');
        this.subscribe('difficulty');
        this.subscribe('network_stats');
    }

    /**
     * Send message to WebSocket server
     */
    send(message) {
        if (!this.connected || !this.ws) {
            console.log('⏳ WebSocket not connected, queuing message:', message);
            this.messageQueue.push(message);
            return;
        }

        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send message:', error);
            this.messageQueue.push(message);
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'connected':
                    console.log('✅ Connected to WebSocket server');
                    this.emit('connected', message);
                    break;

                case 'subscribed':
                    console.log(`✅ Subscribed to: ${message.channel}`);
                    this.emit('subscribed', message);
                    break;

                case 'block':
                    console.log('📦 New block:', message.hash);
                    this.emit('block', message);
                    break;

                case 'transaction':
                    console.log('💸 New transaction:', message.txid);
                    this.emit('transaction', message);
                    break;

                case 'transaction_confirmed':
                    console.log('✅ Transaction confirmed:', message.txid);
                    this.emit('transaction_confirmed', message);
                    break;

                case 'balance_changed':
                    console.log('💰 Balance changed:', message.address);
                    this.emit('balance_changed', message);
                    break;

                case 'difficulty_adjusted':
                    console.log('⚙️ Difficulty adjusted:', message.new_difficulty);
                    this.emit('difficulty_adjusted', message);
                    break;

                case 'network_stats':
                    console.log('🌐 Network stats:', message.peers, 'peers');
                    this.emit('network_stats', message);
                    break;

                case 'pong':
                    console.log('💓 Heartbeat pong');
                    this.resetHeartbeatTimeout();
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    }

    /**
     * Register event listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Emit event to all listeners
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    /**
     * Re-subscribe to previous subscriptions
     */
    resubscribe() {
        this.subscriptions.forEach(channel => {
            const message = {
                action: 'subscribe',
                channel: channel
            };
            this.send(message);
        });
    }

    /**
     * Start heartbeat to detect connection loss
     */
    startHeartbeat() {
        console.log('💓 Starting heartbeat');
        this.heartbeatInterval = setInterval(() => {
            if (this.connected) {
                this.send({ action: 'ping' });
                this.resetHeartbeatTimeout();
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Reset heartbeat timeout
     */
    resetHeartbeatTimeout() {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        
        this.heartbeatTimeout = setTimeout(() => {
            console.warn('⚠️ Heartbeat timeout - reconnecting');
            this.disconnect();
            this.attemptReconnect();
        }, 60000); // 60 second timeout
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.emit('reconnect_failed', {
                attempts: this.reconnectAttempts
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
                this.attemptReconnect();
            });
        }, delay);
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get subscriptions
     */
    getSubscriptions() {
        return Array.from(this.subscriptions);
    }
}

// Create global WebSocket client instance
const wsClient = new WebSocketClient();

// Auto-connect on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing WebSocket client');
    wsClient.connect().catch(error => {
        console.error('Failed to connect to WebSocket:', error);
    });
});

// Disconnect on page unload
window.addEventListener('beforeunload', () => {
    console.log('👋 Disconnecting WebSocket');
    wsClient.disconnect();
});
