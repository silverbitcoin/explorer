/**
 * RPC Debug Utility - Test and diagnose RPC endpoint
 * Production-grade RPC diagnostics for SilverBitcoin Pure PoW
 */

const RPCDebug = (() => {
    /**
     * Test RPC endpoint with comprehensive diagnostics
     */
    async function testEndpoint() {
        console.log('=== RPC ENDPOINT DIAGNOSTICS ===');
        console.log('Endpoint:', EXPLORER_CONFIG.RPC_ENDPOINT);
        
        const tests = [
            { method: SILVER_RPC_METHODS.GET_BLOCK_COUNT, params: [], name: 'Block Count' },
            { method: SILVER_RPC_METHODS.GET_DIFFICULTY, params: [], name: 'Difficulty' },
            { method: SILVER_RPC_METHODS.GET_BLOCKCHAIN_INFO, params: [], name: 'Blockchain Info' },
            { method: SILVER_RPC_METHODS.GET_MINING_INFO, params: [], name: 'Mining Info' },
            { method: SILVER_RPC_METHODS.GET_NETWORK_INFO, params: [], name: 'Network Info' },
            { method: SILVER_RPC_METHODS.GET_BEST_BLOCK_HASH, params: [], name: 'Best Block Hash' },
        ];
        
        for (const test of tests) {
            await runTest(test);
        }
    }
    
    /**
     * Run individual RPC test
     */
    async function runTest(test) {
        try {
            console.log(`\n--- Testing: ${test.name} ---`);
            console.log(`Method: ${test.method}`);
            console.log(`Params:`, test.params);
            
            const request = {
                jsonrpc: '2.0',
                method: test.method,
                params: test.params,
                id: Math.random()
            };
            
            const response = await fetch(EXPLORER_CONFIG.RPC_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
                timeout: 10000
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error(`❌ ERROR:`, data.error);
            } else {
                console.log(`✅ SUCCESS:`, data.result);
                
                // Additional analysis
                if (test.method === SILVER_RPC_METHODS.GET_BLOCK_COUNT) {
                    const blockNum = parseInt(data.result, 10);
                    console.log(`   Block Count: ${blockNum}`);
                    if (blockNum === 0) {
                        console.warn('   ⚠️  WARNING: Block count is 0 (genesis block only)');
                    }
                }
                
                if (test.method === SILVER_RPC_METHODS.GET_BLOCKCHAIN_INFO) {
                    if (typeof data.result === 'object') {
                        console.log(`   Chain: ${data.result.chain}`);
                        console.log(`   Blocks: ${data.result.blocks}`);
                    }
                }
            }
        } catch (error) {
            console.error(`❌ EXCEPTION:`, error.message);
        }
    }
    
    /**
     * Get blockchain status
     */
    async function getBlockchainStatus() {
        try {
            console.log('\n=== BLOCKCHAIN STATUS ===');
            
            const blockCount = await RPCClient.call(SILVER_RPC_METHODS.GET_BLOCK_COUNT);
            
            console.log(`Current Block Height: ${blockCount}`);
            
            if (blockCount === 0) {
                console.warn('⚠️  Blockchain is at genesis block (0)');
                console.warn('⚠️  No transactions or blocks have been mined yet');
                return { status: 'genesis', blockHeight: blockCount };
            }
            
            // Get latest block details
            const block = await RPCClient.call(SILVER_RPC_METHODS.GET_BLOCK, [blockCount]);
            console.log('Latest Block:', {
                height: block.height,
                hash: block.hash,
                timestamp: block.time,
                transactions: block.tx ? block.tx.length : 0,
                miner: block.miner
            });
            
            return { status: 'active', blockHeight: blockCount, block };
        } catch (error) {
            console.error('Error getting blockchain status:', error);
            return { status: 'error', error: error.message };
        }
    }
    
    /**
     * Check mining status
     */
    async function checkMiningStatus() {
        try {
            console.log('\n=== MINING STATUS ===');
            
            const miningInfo = await RPCClient.call(SILVER_RPC_METHODS.GET_MINING_INFO);
            
            console.log('Mining Info:', {
                generate: miningInfo.generate,
                blocks: miningInfo.blocks,
                hashespersec: miningInfo.hashespersec,
                pooledtx: miningInfo.pooledtx,
                difficulty: miningInfo.difficulty
            });
            
            if (miningInfo.generate) {
                console.log('✅ Mining is ACTIVE');
            } else {
                console.log('⚠️  Mining is INACTIVE');
            }
            
            return miningInfo;
        } catch (error) {
            console.error('Error checking mining status:', error);
            return null;
        }
    }
    
    return {
        testEndpoint,
        getBlockchainStatus,
        checkMiningStatus,
    };
})();

// Auto-run diagnostics on load
console.log('RPC Debug utility loaded. Run RPCDebug.testEndpoint() to diagnose.');
