/**
 * Debug Startup - Check all dependencies and initialization
 */

console.log('=== SilverBitcoin Explorer - Debug Startup ===');

// Check if all required objects exist
console.log('Checking dependencies...');

const dependencies = [
    { name: 'EXPLORER_CONFIG', obj: typeof EXPLORER_CONFIG },
    { name: 'SilverBlockchainAPI', obj: typeof SilverBlockchainAPI },
    { name: 'AdvancedRPCIntegration', obj: typeof AdvancedRPCIntegration },
    { name: 'DashboardPageReal', obj: typeof DashboardPageReal },
    { name: 'BlocksPageReal', obj: typeof BlocksPageReal },
    { name: 'TransactionsPageReal', obj: typeof TransactionsPageReal },
    { name: 'AccountsPageReal', obj: typeof AccountsPageReal },
    { name: 'AddressDetailsPageReal', obj: typeof AddressDetailsPageReal },
    { name: 'TransactionDetailsPageReal', obj: typeof TransactionDetailsPageReal },
    { name: 'BlockDetailsPageReal', obj: typeof BlockDetailsPageReal },
];

dependencies.forEach(dep => {
    const status = dep.obj !== 'undefined' ? '✅' : '❌';
    console.log(`${status} ${dep.name}: ${dep.obj}`);
});

// Check RPC endpoint
console.log('\n=== RPC Configuration ===');
console.log('RPC Endpoint:', EXPLORER_CONFIG.RPC_ENDPOINT);
console.log('RPC Timeout:', EXPLORER_CONFIG.RPC_TIMEOUT);
console.log('MIST_PER_SLVR:', EXPLORER_CONFIG.MIST_PER_SLVR);

// Test RPC connection
console.log('\n=== Testing RPC Connection ===');
(async () => {
    try {
        console.log('Attempting to connect to RPC...');
        
        const response = await fetch(EXPLORER_CONFIG.RPC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getblockcount',
                params: [],
                id: 1
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ RPC Response:', data);
        
        if (data.result !== undefined) {
            console.log('✅ Block count:', data.result);
        } else if (data.error) {
            console.error('❌ RPC Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Make sure RPC server is running at:', EXPLORER_CONFIG.RPC_ENDPOINT);
    }
})();

// Check localStorage
console.log('\n=== LocalStorage Check ===');
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ LocalStorage available');
} catch (error) {
    console.error('❌ LocalStorage not available:', error.message);
}

// Check page container
console.log('\n=== DOM Check ===');
const pageContainer = document.getElementById('page-container');
console.log('Page container exists:', pageContainer ? '✅' : '❌');

const errorContainer = document.getElementById('error-container');
console.log('Error container exists:', errorContainer ? '✅' : '❌');

const connectionIndicator = document.getElementById('connection-indicator');
console.log('Connection indicator exists:', connectionIndicator ? '✅' : '❌');

console.log('\n=== Debug Startup Complete ===');
