/**
 * SilverBitcoin Explorer - Constants
 * Production-Grade Configuration
 * 
 * SilverBitcoin 2.0: Pure Proof-of-Work Blockchain
 * - Pure PoW Mining with SHA-512
 * - All RPC methods from silver2.0/crates/silver-core/src/rpc_api.rs
 */

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

const NETWORK = {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    DEVNET: 'devnet',
    LOCAL: 'local'
};

const API_ENDPOINTS = {
    MAINNET: 'https://rpc.silverbitcoin.org',
    TESTNET: 'https://testnet-rpc.silverbitcoin.org',
    LOCAL: 'http://127.0.0.1:9100'
};

// ============================================================================
// RPC CONNECTOR ENDPOINTS (Multi-Protocol: WSS/WS/HTTP)
// ============================================================================

const RPC_CONNECTOR_ENDPOINTS = {
    MAINNET: {
        websocketSecure: 'wss://rpc.silverbitcoin.org',
        websocket: 'ws://rpc.silverbitcoin.org',
        http: 'https://rpc.silverbitcoin.org'
    },
    TESTNET: {
        websocketSecure: 'wss://testnet-rpc.silverbitcoin.org',
        websocket: 'ws://testnet-rpc.silverbitcoin.org',
        http: 'https://testnet-rpc.silverbitcoin.org'
    },
    LOCAL: {
        websocketSecure: 'ws://127.0.0.1:8080',  // Local doesn't use WSS
        websocket: 'ws://127.0.0.1:8080',
        http: 'http://127.0.0.1:9100'
    }
};

// ============================================================================
// EXPLORER CONFIGURATION
// ============================================================================

const EXPLORER_CONFIG = {
    // RPC settings - AUTO-DETECT based on hostname
    RPC_ENDPOINT: (function() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
            return 'http://127.0.0.1:9100';
        } else if (hostname.includes('silverbitcoin.org')) {
            // Production: use HTTPS
            return 'https://rpc.silverbitcoin.org';
        }
        return 'https://rpc.silverbitcoin.org';
    })(),
    
    // WebSocket settings - AUTO-DETECT based on hostname
    WS_ENDPOINT: (function() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
            return 'ws://127.0.0.1:8080';
        } else if (hostname.includes('silverbitcoin.org')) {
            // Production: use WSS (WebSocket Secure)
            return 'wss://rpc.silverbitcoin.org';
        }
        return 'wss://rpc.silverbitcoin.org';
    })(),
    
    RPC_TIMEOUT: 30000,  // 30 seconds - Faster timeout for better UX
    RPC_MAX_BATCH_SIZE: 50,  // Batch size azaltıldı - daha hızlı yanıt
    
    // Network Configuration
    CHAIN_ID: 1,
    NETWORK_ID: 1,
    PROTOCOL_VERSION: '1',
    
    // Token Configuration (SilverBitcoin)
    TOKEN_NAME: 'SLVR',
    TOKEN_DECIMALS: 8,
    MIST_PER_SLVR: 100_000_000, // 1 SLVR = 100,000,000 MIST
    WEI_PER_TOKEN: '100000000', // 10^8 (MIST)
    
    // Retry settings
    RETRY: {
        MAX_ATTEMPTS: 3,           // 3 deneme
        INITIAL_DELAY: 300,        // 300ms
        BACKOFF_MULTIPLIER: 1.5,   // Daha yumuşak backoff
        MAX_DELAY: 3000            // 3 saniye max
    },
    
    // Cache settings
    CACHE_TTL: {
        NETWORK_INFO: 30000,    // 30 seconds
        BLOCK: 60000,           // 1 minute
        TRANSACTION: 60000,     // 1 minute
        BALANCE: 30000,         // 30 seconds
        GAS_PRICE: 15000,       // 15 seconds
        ACCOUNT_INFO: 30000,    // 30 seconds
        MINING_INFO: 10000      // 10 seconds
    },
    
    // Pagination Configuration
    PAGINATION: {
        TRANSACTIONS_PER_PAGE: 25,
        BLOCKS_PER_PAGE: 25,
        ACCOUNTS_PER_PAGE: 25,
        HOLDERS_PER_PAGE: 25,
    },
    
    // Real-Time Update Configuration
    REAL_TIME: {
        BLOCK_POLL_INTERVAL: 10000,      // 10 saniye (5'ten)
        TRANSACTION_POLL_INTERVAL: 10000, // 10 saniye (5'ten)
        BALANCE_POLL_INTERVAL: 15000,    // 15 saniye (10'dan)
        MINING_POLL_INTERVAL: 10000,     // 10 saniye (5'ten)
        DASHBOARD_METRIC_INTERVAL: 15000, // 15 saniye (10'dan)
    },
    
    // UI Configuration
    UI: {
        LOADING_TIMEOUT: 2000,
        ERROR_DISPLAY_DURATION: 5000,
        TOAST_DURATION: 3000,
    },
    
    // Search Configuration
    SEARCH: {
        TIMEOUT: 2000,
        MIN_QUERY_LENGTH: 1,
        MAX_RESULTS: 10,
    },
    
    // Filter settings
    FILTER: {
        FILTER_TIMEOUT: 300000,     // 5 minutes
        CLEANUP_INTERVAL: 60000     // 1 minute
    },
    
    // Storage keys
    STORAGE: {
        PREFIX: 'silverbitcoin_explorer_',
        CACHE_KEY: 'cache',
        SEARCH_HISTORY_KEY: 'search_history',
        THEME_KEY: 'silverbitcoin-explorer-theme',
        RPC_ENDPOINT_KEY: 'silverbitcoin-explorer-rpc-endpoint'
    },
    
    // Validation Configuration (512-bit blockchain)
    VALIDATION: {
        ADDRESS_LENGTH_MIN: 90,
        ADDRESS_LENGTH_MAX: 92,
        ADDRESS_PREFIX: 'SLVR',
        BLOCK_HASH_LENGTH: 130,  // 0x + 128 hex chars
        TX_HASH_LENGTH: 130,     // 0x + 128 hex chars
        HEX_PREFIX: '0x',
        HEX_CHARS_LENGTH: 128,   // 512-bit = 128 hex chars
    },
    
    // Format Configuration
    FORMAT: {
        BALANCE_DECIMALS: 6,
        GAS_PRICE_DECIMALS: 9,
        PERCENTAGE_DECIMALS: 2,
        TIMESTAMP_FORMAT: 'ISO', // ISO 8601 format
    },
    
    // Errors
    ERRORS: {
        RPC_CONNECTION_FAILED: 'Failed to connect to RPC endpoint',
        RPC_INVALID_RESPONSE: 'Invalid RPC response',
        RPC_INTERNAL_ERROR: 'RPC internal error',
        RPC_TIMEOUT: 'RPC request timeout',
        UNKNOWN_ERROR: 'An unknown error occurred',
        INVALID_ADDRESS: 'Invalid address format',
        INVALID_BLOCK_NUMBER: 'Invalid block number',
        INVALID_TRANSACTION_HASH: 'Invalid transaction hash',
        SEARCH_TIMEOUT: 'Search request timed out',
        CACHE_QUOTA_EXCEEDED: 'Local storage quota exceeded',
        NETWORK_ERROR: 'Network error occurred',
    }
};

// ============================================================================
// SILVERBITCOIN 2.0 RPC METHODS
// ============================================================================
// Pure Proof-of-Work Blockchain - NO Ethereum compatibility
// All methods from silver2.0/crates/silver-core/src/rpc_api.rs
// Total: 62 production-ready methods

const SILVER_RPC_METHODS = {
    // ============================================================================
    // BLOCKCHAIN INFO METHODS (11 methods)
    // ============================================================================
    GET_BLOCKCHAIN_INFO: 'getblockchaininfo',      // Get complete blockchain info
    GET_BLOCK_COUNT: 'getblockcount',              // Get current block height
    GET_DIFFICULTY: 'getdifficulty',               // Get current difficulty
    GET_HASHRATE: 'gethashrate',                   // Get current hashrate
    GET_BEST_BLOCK_HASH: 'getbestblockhash',       // Get best block hash
    GET_BLOCK: 'getblock',                         // Get block by hash or height
    GET_BLOCK_HEADER: 'getblockheader',            // Get block header
    GET_BLOCK_HASH: 'getblockhash',                // Get block hash by height
    GET_CHAIN_TIPS: 'getchaintips',                // Get chain tips
    GET_NETWORK_HASHPS: 'getnetworkhashps',        // Get network hashrate
    GET_TXOUT_SET_INFO: 'gettxoutsetinfo',         // Get UTXO set info
    
    // ============================================================================
    // ADDRESS METHODS (8 methods)
    // ============================================================================
    GET_NEW_ADDRESS: 'getnewaddress',              // Generate new 512-bit address
    LIST_ADDRESSES: 'listaddresses',               // List all addresses
    GET_ADDRESS_BALANCE: 'getaddressbalance',      // Get address balance
    GET_BALANCE: 'getbalance',                     // Get balance (address or total)
    GET_ADDRESS_INFO: 'getaddressinfo',            // Get address info
    VALIDATE_ADDRESS: 'validateaddress',           // Validate address format
    GET_RECEIVED_BY_ADDRESS: 'getreceivedbyaddress', // Get received amount
    LIST_RECEIVED_BY_ADDRESS: 'listreceivedbyaddress', // List received by address
    
    // ============================================================================
    // TRANSACTION METHODS (13 methods)
    // ============================================================================
    SEND_TRANSACTION: 'sendtransaction',           // Send transaction
    GET_TRANSACTION: 'gettransaction',             // Get transaction
    GET_RAW_TRANSACTION: 'getrawtransaction',      // Get raw transaction
    DECODE_RAW_TRANSACTION: 'decoderawtransaction', // Decode raw transaction
    CREATE_RAW_TRANSACTION: 'createrawtransaction', // Create raw transaction
    SIGN_RAW_TRANSACTION: 'signrawtransaction',    // Sign raw transaction
    SEND_RAW_TRANSACTION: 'sendrawtransaction',    // Send raw transaction
    LIST_TRANSACTIONS: 'listtransactions',         // List transactions
    LIST_UNSPENT: 'listunspent',                   // List unspent outputs (UTXO)
    GET_TXOUT: 'gettxout',                         // Get transaction output
    GET_MEMPOOL_INFO: 'getmempoolinfo',            // Get mempool info
    GET_MEMPOOL_ENTRY: 'getmempoolentry',          // Get mempool entry
    GET_RAW_MEMPOOL: 'getrawmempool',              // Get raw mempool
    
    // ============================================================================
    // MINING METHODS (7 methods) - Pure PoW, NO staking/validators
    // ============================================================================
    START_MINING: 'startmining',                   // Start SHA-512 mining
    STOP_MINING: 'stopmining',                     // Stop mining
    GET_MINING_INFO: 'getmininginfo',              // Get mining info
    SET_MINING_ADDRESS: 'setminingaddress',        // Set mining reward address
    SUBMIT_BLOCK: 'submitblock',                   // Submit mined block
    GET_BLOCK_TEMPLATE: 'getblocktemplate',        // Get block template
    SUBMIT_HEADER: 'submitheader',                 // Submit block header
    
    // ============================================================================
    // NETWORK METHODS (6 methods)
    // ============================================================================
    GET_NETWORK_INFO: 'getnetworkinfo',            // Get network info
    GET_PEER_INFO: 'getpeerinfo',                  // Get peer info
    GET_CONNECTION_COUNT: 'getconnectioncount',    // Get connection count
    ADD_NODE: 'addnode',                           // Add node
    DISCONNECT_NODE: 'disconnectnode',             // Disconnect node
    GET_ADDED_NODE_INFO: 'getaddednodeinfo',       // Get added node info
    
    // ============================================================================
    // WALLET METHODS (9 methods)
    // ============================================================================
    DUMP_PRIVKEY: 'dumpprivkey',                   // Export private key
    IMPORT_PRIVKEY: 'importprivkey',               // Import private key
    DUMP_WALLET: 'dumpwallet',                     // Export wallet
    IMPORT_WALLET: 'importwallet',                 // Import wallet
    GET_WALLET_INFO: 'getwalletinfo',              // Get wallet info
    LIST_WALLETS: 'listwallets',                   // List wallets
    CREATE_WALLET: 'createwallet',                 // Create wallet
    LOAD_WALLET: 'loadwallet',                     // Load wallet
    UNLOAD_WALLET: 'unloadwallet',                 // Unload wallet
    
    // ============================================================================
    // UTILITY METHODS (8 methods)
    // ============================================================================
    ESTIMATE_FEE: 'estimatefee',                   // Estimate transaction fee
    ESTIMATE_SMART_FEE: 'estimatesmartfee',        // Smart fee estimation
    HELP: 'help',                                  // Get help
    UPTIME: 'uptime',                              // Get node uptime
    GET_INFO: 'getinfo',                           // Get general info
    ENCODE_HEX_STR: 'encodehexstr',                // Encode to hex
    DECODE_HEX_STR: 'decodehexstr',                // Decode from hex
    VALIDATE_ADDRESS: 'validateaddress'            // Validate address
};

// ============================================================================
// JSON-RPC 2.0 ERROR CODES
// ============================================================================

const JSON_RPC_ERRORS = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    SERVER_ERROR_START: -32099,
    SERVER_ERROR_END: -32000,
};

// ============================================================================
// TRANSACTION & BLOCK STATUS
// ============================================================================

const TRANSACTION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    UNKNOWN: 'unknown',
};

const BLOCK_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FINALIZED: 'finalized',
};

// ============================================================================
// PAGE TYPES & QUERY TYPES
// ============================================================================

const PAGE_TYPES = {
    DASHBOARD: 'dashboard',
    BLOCKS: 'blocks',
    TRANSACTIONS: 'transactions',
    ACCOUNTS: 'accounts',
    SEARCH: 'search',
};

const QUERY_TYPES = {
    BLOCK_NUMBER: 'block_number',
    BLOCK_HASH: 'block_hash',
    TRANSACTION_HASH: 'transaction_hash',
    ADDRESS: 'address',
    UNKNOWN: 'unknown',
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const THEME_TYPES = {
    LIGHT: 'light',
    DARK: 'dark'
};

const DEFAULT_THEME = THEME_TYPES.LIGHT;

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NETWORK,
        API_ENDPOINTS,
        EXPLORER_CONFIG,
        SILVER_RPC_METHODS,
        JSON_RPC_ERRORS,
        TRANSACTION_STATUS,
        BLOCK_STATUS,
        PAGE_TYPES,
        QUERY_TYPES,
        THEME_TYPES,
        DEFAULT_THEME
    };
}
