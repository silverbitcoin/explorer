/**
 * RPC Adapter - Universal RPC Integration Layer
 * Connects RPC methods to Explorer
 * Production-Grade Implementation
 */

const RPCAdapter = (() => {
    let stores = {
        blockStore: null,
        transactionStore: null,
        utxoStore: null,
        mempoolStore: null,
        addressStore: null,
        eventStore: null,
        tokenStore: null,
        walletStore: null,
        networkStore: null,
        feeStore: null,
        indexManager: null,
        miningStore: null,
    };

    function initializeStores(storeReferences) {
        if (storeReferences) {
            stores = { ...stores, ...storeReferences };
            console.log('✅ RPC Adapter stores initialized');
        }
    }

    async function getBlock(hashOrHeight) {
        try {
            if (stores.blockStore && window.rpc_store_typed?.get_block_typed) {
                const result = await window.rpc_store_typed.get_block_typed(stores.blockStore, String(hashOrHeight));
                if (result) return result;
            }
            return await RPCClient.getBlock(hashOrHeight);
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting block:', error);
            return await RPCClient.getBlock(hashOrHeight);
        }
    }

    async function getTransaction(txid) {
        try {
            if (stores.transactionStore && window.rpc_store_typed?.get_transaction_typed) {
                const result = await window.rpc_store_typed.get_transaction_typed(stores.transactionStore, txid);
                if (result) return result;
            }
            return await RPCClient.getTransaction(txid);
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting transaction:', error);
            return await RPCClient.getTransaction(txid);
        }
    }

    async function getAddressBalance(address) {
        try {
            if (stores.addressStore && window.rpc_store_typed?.get_address_balance_typed) {
                const result = await window.rpc_store_typed.get_address_balance_typed(stores.addressStore, address);
                if (result) return result;
            }
            return await RPCClient.getBalance(address);
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting address balance:', error);
            return await RPCClient.getBalance(address);
        }
    }

    async function getAddressInfo(address) {
        try {
            if (stores.addressStore && window.rpc_store_typed?.get_address_info_typed) {
                const result = await window.rpc_store_typed.get_address_info_typed(stores.addressStore, address);
                if (result) return result;
            }
            return await RPCClient.validateAddress(address);
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting address info:', error);
            return await RPCClient.validateAddress(address);
        }
    }

    async function getAddressTransactions(address, page = 1) {
        try {
            if (stores.addressStore && window.rpc_store_typed?.get_address_transactions_typed) {
                const result = await window.rpc_store_typed.get_address_transactions_typed(stores.addressStore, address, page);
                if (result) return result;
            }
            return await RPCClient.listTransactions(50, (page - 1) * 50);
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting address transactions:', error);
            return await RPCClient.listTransactions(50, (page - 1) * 50);
        }
    }

    async function getAddressUTXOs(address) {
        try {
            if (stores.addressStore && window.rpc_store_typed?.get_address_utxos_typed) {
                const result = await window.rpc_store_typed.get_address_utxos_typed(stores.addressStore, address);
                if (result) return result;
            }
            return await RPCClient.listUnspent();
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting address UTXOs:', error);
            return await RPCClient.listUnspent();
        }
    }

    async function getMempoolInfo() {
        try {
            if (stores.mempoolStore && window.rpc_store_typed?.get_mempool_info_typed) {
                const result = await window.rpc_store_typed.get_mempool_info_typed(stores.mempoolStore);
                if (result) return result;
            }
            return await RPCClient.getMempoolInfo();
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting mempool info:', error);
            return await RPCClient.getMempoolInfo();
        }
    }

    async function getUTXOSetInfo() {
        try {
            if (stores.utxoStore && window.rpc_store_typed?.get_utxo_set_info_typed) {
                const result = await window.rpc_store_typed.get_utxo_set_info_typed(stores.utxoStore);
                if (result) return result;
            }
            return await RPCClient.listUnspent();
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting UTXO set info:', error);
            return await RPCClient.listUnspent();
        }
    }

    async function getNetworkInfo() {
        try {
            if (stores.networkStore && window.rpc_store_typed?.get_network_info_typed) {
                const result = await window.rpc_store_typed.get_network_info_typed(stores.networkStore);
                if (result) return result;
            }
            return await RPCClient.getNetworkInfo();
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting network info:', error);
            return await RPCClient.getNetworkInfo();
        }
    }

    async function getEvents(page = 1, pageSize = 50) {
        try {
            if (stores.eventStore && window.rpc_store_typed?.get_events_typed) {
                const result = await window.rpc_store_typed.get_events_typed(stores.eventStore, page, pageSize);
                if (result) return result;
            }
            return { events: [], page, total: 0 };
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting events:', error);
            return { events: [], page, total: 0 };
        }
    }

    async function getTokenInfo(contractAddress) {
        try {
            if (stores.tokenStore && window.rpc_store_typed?.get_token_info_typed) {
                const result = await window.rpc_store_typed.get_token_info_typed(stores.tokenStore, contractAddress);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting token info:', error);
            return null;
        }
    }

    async function getTokenBalance(contractAddress, account) {
        try {
            if (stores.tokenStore && window.rpc_store_typed?.get_token_balance_typed) {
                const result = await window.rpc_store_typed.get_token_balance_typed(stores.tokenStore, contractAddress, account);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error getting token balance:', error);
            return null;
        }
    }

    async function estimateFee(blocks = 6) {
        try {
            if (stores.feeStore && window.rpc_store_typed?.estimate_fee_typed) {
                const result = await window.rpc_store_typed.estimate_fee_typed(stores.feeStore, blocks);
                if (result) return result;
            }
            return { feerate: 0.00001, blocks };
        } catch (error) {
            console.error('❌ RPC Adapter: Error estimating fee:', error);
            return { feerate: 0.00001, blocks };
        }
    }

    async function explorerGetBlock(hashOrHeight) {
        try {
            if (stores.blockStore && window.rpc_store_typed?.explorer_get_block_typed) {
                const result = await window.rpc_store_typed.explorer_get_block_typed(stores.blockStore, String(hashOrHeight));
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error in explorer get block:', error);
            return null;
        }
    }

    async function explorerGetTransaction(txid) {
        try {
            if (stores.transactionStore && window.rpc_store_typed?.explorer_get_transaction_typed) {
                const result = await window.rpc_store_typed.explorer_get_transaction_typed(stores.transactionStore, txid);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error in explorer get transaction:', error);
            return null;
        }
    }

    async function explorerGetAddress(address) {
        try {
            if (stores.addressStore && window.rpc_store_typed?.explorer_get_address_typed) {
                const result = await window.rpc_store_typed.explorer_get_address_typed(stores.addressStore, address);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error in explorer get address:', error);
            return null;
        }
    }

    async function explorerGetStats() {
        try {
            if (stores.blockStore && window.rpc_store_typed?.explorer_get_stats_typed) {
                const result = await window.rpc_store_typed.explorer_get_stats_typed(stores.blockStore);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error in explorer get stats:', error);
            return null;
        }
    }

    async function explorerSearch(query) {
        try {
            if (stores.blockStore && window.rpc_store_typed?.explorer_search_typed) {
                const result = await window.rpc_store_typed.explorer_search_typed(stores.blockStore, query);
                if (result) return result;
            }
            return null;
        } catch (error) {
            console.error('❌ RPC Adapter: Error in explorer search:', error);
            return null;
        }
    }

    function isAvailable() {
        return typeof window.rpc_store_typed !== 'undefined' && Object.values(stores).some(store => store !== null);
    }

    function getStatus() {
        return {
            available: isAvailable(),
            stores: Object.entries(stores).reduce((acc, [key, value]) => {
                acc[key] = value !== null ? '✅' : '❌';
                return acc;
            }, {}),
            timestamp: new Date().toISOString(),
        };
    }

    return {
        initializeStores,
        getBlock,
        getTransaction,
        getAddressBalance,
        getAddressInfo,
        getAddressTransactions,
        getAddressUTXOs,
        getMempoolInfo,
        getUTXOSetInfo,
        getNetworkInfo,
        getEvents,
        getTokenInfo,
        getTokenBalance,
        estimateFee,
        explorerGetBlock,
        explorerGetTransaction,
        explorerGetAddress,
        explorerGetStats,
        explorerSearch,
        isAvailable,
        getStatus,
    };
})();
