/**
 * Subscriptions - Real-Time Updates Management
 * Production-grade real-time subscription system
 */

const Subscriptions = (() => {
    let blockFilter = null;
    let txFilter = null;
    let blockPollInterval = null;
    let txPollInterval = null;
    let balancePollInterval = null;
    
    const subscribers = {
        blocks: [],
        transactions: [],
        balance: [],
    };
    
    /**
     * Subscribe to block updates
     * @param {Function} callback - Callback function
     * @returns {string} Subscription ID
     */
    function subscribeToBlocks(callback) {
        try {
            const id = 'block_' + Date.now() + '_' + Math.random();
            subscribers.blocks.push({ id, callback });
            
            // Start polling if not already started
            if (subscribers.blocks.length === 1) {
                startBlockPolling();
            }
            
            return id;
        } catch (error) {
            console.error('Error subscribing to blocks:', error);
            return null;
        }
    }
    
    /**
     * Subscribe to transaction updates
     * @param {Function} callback - Callback function
     * @returns {string} Subscription ID
     */
    function subscribeToTransactions(callback) {
        try {
            const id = 'tx_' + Date.now() + '_' + Math.random();
            subscribers.transactions.push({ id, callback });
            
            // Start polling if not already started
            if (subscribers.transactions.length === 1) {
                startTransactionPolling();
            }
            
            return id;
        } catch (error) {
            console.error('Error subscribing to transactions:', error);
            return null;
        }
    }
    
    /**
     * Subscribe to balance updates
     * @param {string} address - Account address
     * @param {Function} callback - Callback function
     * @returns {string} Subscription ID
     */
    function subscribeToBalance(address, callback) {
        try {
            const id = 'balance_' + address + '_' + Date.now();
            subscribers.balance.push({ id, address, callback });
            
            // Start polling if not already started
            if (subscribers.balance.length === 1) {
                startBalancePolling();
            }
            
            return id;
        } catch (error) {
            console.error('Error subscribing to balance:', error);
            return null;
        }
    }
    
    /**
     * Unsubscribe from updates
     * @param {string} subscriptionId - Subscription ID
     */
    function unsubscribe(subscriptionId) {
        try {
            // Remove from blocks
            subscribers.blocks = subscribers.blocks.filter(s => s.id !== subscriptionId);
            if (subscribers.blocks.length === 0) {
                stopBlockPolling();
            }
            
            // Remove from transactions
            subscribers.transactions = subscribers.transactions.filter(s => s.id !== subscriptionId);
            if (subscribers.transactions.length === 0) {
                stopTransactionPolling();
            }
            
            // Remove from balance
            subscribers.balance = subscribers.balance.filter(s => s.id !== subscriptionId);
            if (subscribers.balance.length === 0) {
                stopBalancePolling();
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    }
    
    /**
     * Start block polling
     */
    async function startBlockPolling() {
        try {
            blockFilter = await RPCClient.createFilter('block');
            
            blockPollInterval = setInterval(async () => {
                try {
                    const changes = await RPCClient.getFilterChanges(blockFilter);
                    
                    if (changes && changes.length > 0) {
                        // Notify all subscribers
                        for (const subscriber of subscribers.blocks) {
                            try {
                                subscriber.callback(changes);
                            } catch (error) {
                                console.error('Error in block subscriber callback:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error polling blocks:', error);
                }
            }, EXPLORER_CONFIG.REAL_TIME.BLOCK_POLL_INTERVAL);
        } catch (error) {
            console.error('Error starting block polling:', error);
        }
    }
    
    /**
     * Stop block polling
     */
    function stopBlockPolling() {
        try {
            if (blockPollInterval) {
                clearInterval(blockPollInterval);
                blockPollInterval = null;
            }
            
            if (blockFilter) {
                RPCClient.removeFilter(blockFilter).catch(err => console.error('Error removing filter:', err));
                blockFilter = null;
            }
        } catch (error) {
            console.error('Error stopping block polling:', error);
        }
    }
    
    /**
     * Start transaction polling
     */
    async function startTransactionPolling() {
        try {
            txFilter = await RPCClient.createFilter('pending');
            
            txPollInterval = setInterval(async () => {
                try {
                    const changes = await RPCClient.getFilterChanges(txFilter);
                    
                    if (changes && changes.length > 0) {
                        // Notify all subscribers
                        for (const subscriber of subscribers.transactions) {
                            try {
                                subscriber.callback(changes);
                            } catch (error) {
                                console.error('Error in transaction subscriber callback:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error polling transactions:', error);
                }
            }, EXPLORER_CONFIG.REAL_TIME.TRANSACTION_POLL_INTERVAL);
        } catch (error) {
            console.error('Error starting transaction polling:', error);
        }
    }
    
    /**
     * Stop transaction polling
     */
    function stopTransactionPolling() {
        try {
            if (txPollInterval) {
                clearInterval(txPollInterval);
                txPollInterval = null;
            }
            
            if (txFilter) {
                RPCClient.removeFilter(txFilter).catch(err => console.error('Error removing filter:', err));
                txFilter = null;
            }
        } catch (error) {
            console.error('Error stopping transaction polling:', error);
        }
    }
    
    /**
     * Start balance polling
     */
    function startBalancePolling() {
        try {
            balancePollInterval = setInterval(async () => {
                try {
                    for (const subscriber of subscribers.balance) {
                        try {
                            const balance = await RPCClient.call(SILVER_RPC_METHODS.GET_BALANCE, [subscriber.address]);
                            subscriber.callback(balance);
                        } catch (error) {
                            console.error('Error polling balance:', error);
                        }
                    }
                } catch (error) {
                    console.error('Error in balance polling:', error);
                }
            }, EXPLORER_CONFIG.REAL_TIME.BALANCE_POLL_INTERVAL);
        } catch (error) {
            console.error('Error starting balance polling:', error);
        }
    }
    
    /**
     * Stop balance polling
     */
    function stopBalancePolling() {
        try {
            if (balancePollInterval) {
                clearInterval(balancePollInterval);
                balancePollInterval = null;
            }
        } catch (error) {
            console.error('Error stopping balance polling:', error);
        }
    }
    
    /**
     * Cleanup all subscriptions
     */
    function cleanup() {
        try {
            stopBlockPolling();
            stopTransactionPolling();
            stopBalancePolling();
            
            subscribers.blocks = [];
            subscribers.transactions = [];
            subscribers.balance = [];
        } catch (error) {
            console.error('Error cleaning up subscriptions:', error);
        }
    }
    
    return {
        subscribeToBlocks,
        subscribeToTransactions,
        subscribeToBalance,
        unsubscribe,
        cleanup,
    };
})();
