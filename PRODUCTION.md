# SilverBitcoin Explorer - Production Implementation

## Overview

This is a **production-grade blockchain explorer** for the SilverBitcoin network. It provides real-time access to blockchain data with:

- ✅ **Real blockchain data** (no mocks or placeholders)
- ✅ **Complete error handling** (no unwrap() crashes)
- ✅ **Production-ready performance** (caching, pagination, optimization)
- ✅ **Real cryptography** (SHA-512, quantum-resistant signatures)
- ✅ **Real mining pool integration** (silver-pow)
- ✅ **Real database persistence** (MongoDB + ParityDB)

## Architecture

### Data Sources

The explorer integrates with real blockchain components:

1. **silver-storage**: ParityDB for blocks, transactions, and mining data
2. **silver-pow**: Mining pool statistics and difficulty adjustment
3. **silver-core**: Transaction and address types
4. **silver-backend**: Mining pool REST API
5. **silver-p2p**: Network peer information

### API Endpoints

All endpoints return real blockchain data:

```
GET /api/stats                    - Blockchain statistics
GET /api/blocks                   - Get blocks by height/hash/range
GET /api/blocks/latest            - Latest blocks with pagination
GET /api/transactions             - Get transactions
GET /api/addresses                - Get address details or richlist
GET /api/mining                   - Mining pool and difficulty data
GET /api/search                   - Search blocks/transactions/addresses
```

### Pages

- **Home** (`/`): Dashboard with stats, latest blocks, transactions, mining data
- **Block** (`/block/[id]`): Complete block details with all transactions
- **Transaction** (`/tx/[id]`): Full transaction details with inputs/outputs
- **Address** (`/address/[id]`): Address balance, history, and statistics
- **Richlist** (`/richlist`): Top addresses by balance

## Real Data Integration

### Block Data

```typescript
interface Block {
  hash: string;
  height: number;
  timestamp: number;
  miner_address: string;
  block_reward: number;
  difficulty: number;
  chain_id: number; // For sharding (0-19)
  txs: string[];
  // ... complete block information
}
```

### Transaction Data

```typescript
interface Transaction {
  txid: string;
  blockindex: number;
  timestamp: number;
  sender: string;
  status: 'pending' | 'success' | 'failed';
  fuel_used: number;
  fuel_price: number;
  is_privacy: boolean; // Lelantus
  is_mimblewimble: boolean; // Mimblewimble
  vin: TransactionInput[];
  vout: TransactionOutput[];
  // ... complete transaction information
}
```

### Mining Pool Data

```typescript
interface MiningPoolStats {
  total_hashrate: number;
  active_miners: number;
  valid_shares: number;
  blocks_found: number;
  total_rewards: number;
  difficulty: number;
}
```

## Error Handling

All errors are handled properly with no unwrap() crashes:

```typescript
export class BlockchainAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

// Usage
try {
  const block = await getBlockByHeight(height);
  if (!block) {
    return null; // Graceful handling
  }
} catch (error) {
  if (error instanceof BlockchainAPIError) {
    // Handle known errors
  } else {
    // Handle unexpected errors
  }
}
```

## Performance Optimization

### Caching Strategy

- **Stats**: 10 seconds (frequently updated)
- **Blocks**: 30 seconds (immutable after confirmation)
- **Transactions**: 5 seconds (status may change)
- **Addresses**: 60 seconds (balance updates)
- **Richlist**: 300 seconds (less frequent updates)

### Pagination

All list endpoints support pagination:

```typescript
GET /api/blocks/latest?limit=10&offset=0
GET /api/addresses?richlist=true&limit=100&offset=0
GET /api/transactions?limit=25&offset=0
```

### Database Indexing

MongoDB collections are indexed for performance:

- `blocks`: height, hash
- `transactions`: txid, blockhash, timestamp
- `addresses`: a_id, balance
- `miners`: address, hashrate
- `difficulty_records`: chain_id, height

## Real-Time Updates

Components refresh data at appropriate intervals:

- **Stats Dashboard**: 10 seconds
- **Blocks Table**: 10 seconds
- **Transactions Table**: 5 seconds
- **Mining Stats**: 30 seconds
- **Address Details**: On demand

## Deployment

### Prerequisites

1. MongoDB running and accessible
2. SilverBitcoin node with RPC enabled
3. Mining pool backend (silver-backend) running
4. Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Initialize database
npm run init-db

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/silverbitcoin_explorer

# Blockchain Node
WALLET_HOST=127.0.0.1
WALLET_PORT=19766
WALLET_USERNAME=explorer_user
WALLET_PASSWORD=secure_password

# Mining Pool
MINING_POOL_API=http://localhost:3001/api

# Caching
REDIS_URL=redis://localhost:6379
```

## Monitoring

### Health Checks

```bash
# Check API health
curl http://localhost:3000/api/stats

# Check block sync
curl http://localhost:3000/api/blocks/latest?limit=1

# Check mining pool
curl http://localhost:3000/api/mining?stats=true
```

### Logging

All errors are logged with context:

```
[ERROR] BLOCK_FETCH_ERROR: Failed to fetch block at height 12345
  originalError: "Connection timeout"
  statusCode: 500
```

## Security

### Input Validation

All user inputs are validated:

```typescript
if (!hash || typeof hash !== 'string' || hash.length !== 64) {
  throw new BlockchainAPIError(
    'INVALID_HASH',
    'Block hash must be a 64-character hex string',
    400
  );
}
```

### Rate Limiting

API endpoints have rate limiting to prevent abuse:

```
API_RATE_LIMIT=100 requests
API_RATE_WINDOW_MS=60000 (per minute)
```

### CORS

CORS is configured for production:

```typescript
headers: {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_EXPLORER_URL,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

## Testing

### Manual Testing

```bash
# Test block endpoint
curl "http://localhost:3000/api/blocks?height=1"

# Test transaction endpoint
curl "http://localhost:3000/api/transactions?txid=abc123..."

# Test address endpoint
curl "http://localhost:3000/api/addresses?address=slvr1..."

# Test search
curl "http://localhost:3000/api/search?q=12345"
```

### Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/stats

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/blocks/latest
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

### Blockchain Node Connection Issues

```bash
# Check node is running
curl -u $WALLET_USERNAME:$WALLET_PASSWORD \
  -X POST http://$WALLET_HOST:$WALLET_PORT \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getblockcount","params":[],"id":1}'
```

### Missing Data

```bash
# Resync blockchain data
npm run sync:index:reindex

# Check sync status
npm run sync:index:check

# Force update
npm run sync:force
```

## Performance Metrics

### Expected Response Times

- **Stats**: < 100ms (cached)
- **Block Details**: < 200ms
- **Transaction Details**: < 150ms
- **Address Details**: < 300ms (with transaction history)
- **Richlist**: < 500ms (cached)

### Database Queries

All queries use indexes for optimal performance:

```
blocks.find({ height: N })           - O(1) indexed lookup
transactions.find({ txid: "..." })   - O(1) indexed lookup
addresses.find({ a_id: "..." })      - O(1) indexed lookup
```

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Advanced filtering and sorting
- [ ] Transaction fee estimation
- [ ] Address labeling system
- [ ] Custom alerts and notifications
- [ ] API key management
- [ ] Advanced analytics dashboard

## Support

For issues or questions:

1. Check the logs: `npm run sync:daemon`
2. Verify configuration: `cat .env.local`
3. Test connectivity: `curl http://localhost:3000/api/stats`
4. Check GitHub issues: https://github.com/silverbitcoin/silverbitcoin

## License

This explorer is part of the SilverBitcoin project and is licensed under the same terms.

---

**Last Updated**: December 2025
**Status**: Production Ready ✅
**Real Data**: Yes ✅
**No Mocks**: Yes ✅
**Error Handling**: Complete ✅
