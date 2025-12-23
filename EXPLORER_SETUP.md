# SilverBitcoin Blockchain Explorer - Setup Guide

## Overview

This is a production-grade blockchain explorer for the SilverBitcoin network. It provides real-time access to blockchain data including blocks, transactions, addresses, and mining pool statistics.

## Features

- **Real-time Blockchain Data**: All data is fetched directly from the RPC API
- **Block Explorer**: View detailed block information, transactions, and mining data
- **Transaction Viewer**: Complete transaction details with inputs/outputs
- **Address Explorer**: Address balances, transaction history, and UTXOs
- **Mining Pool Stats**: Real-time mining pool statistics and top miners
- **Search Functionality**: Search by block height, hash, transaction ID, or address
- **Production-Grade**: Full error handling, proper validation, and security measures

## Prerequisites

1. **Node.js**: v18+ (LTS recommended)
2. **npm** or **yarn**: Package manager
3. **SilverBitcoin RPC Server**: Running and accessible
4. **Environment Variables**: Configured for your setup

## Installation

### 1. Install Dependencies

```bash
cd silver2.0/explorer
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# RPC Server URL (default: http://localhost:8332)
NEXT_PUBLIC_RPC_URL=http://localhost:8332

# API Base URL (default: http://localhost:3000)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Network Configuration
NEXT_PUBLIC_NETWORK_NAME=SilverBitcoin Mainnet
NEXT_PUBLIC_CURRENCY_SYMBOL=SLVR
NEXT_PUBLIC_CURRENCY_DECIMALS=8
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The explorer will be available at `http://localhost:3000`

## Production Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

## API Routes

The explorer provides the following API endpoints:

### Blocks
- `GET /api/blocks/latest` - Fetch latest blocks
- `GET /api/blocks/[hash]` - Get specific block by hash or height

### Transactions
- `GET /api/transactions` - Fetch recent transactions
- `GET /api/tx/[txid]` - Get specific transaction

### Addresses
- `GET /api/address/[address]` - Get address information and history

### Mining
- `GET /api/mining` - Get mining pool statistics

### Search
- `GET /api/search?q=query` - Search for blocks, transactions, or addresses

## RPC API Integration

The explorer uses the complete SilverBitcoin RPC API with 62 methods across 6 categories:

### Blockchain Methods (11)
- getblockchaininfo, getblockcount, getdifficulty, gethashrate, getbestblockhash
- getblock, getblockheader, getblockhash, getchaintips, getnetworkhashps, gettxoutsetinfo

### Address Methods (8)
- getnewaddress, listaddresses, getaddressbalance, getbalance
- getaddressinfo, validateaddress, getreceivedbyaddress, listreceivedbyaddress

### Transaction Methods (13)
- sendtransaction, gettransaction, getrawtransaction, decoderawtransaction
- createrawtransaction, signrawtransaction, sendrawtransaction, listtransactions
- listunspent, gettxout, getmempoolinfo, getmempoolentry, getrawmempool

### Mining Methods (7)
- startmining, stopmining, getmininginfo, setminingaddress
- submitblock, getblocktemplate, submitheader

### Network Methods (6)
- getnetworkinfo, getpeerinfo, getconnectioncount
- addnode, disconnectnode, getaddednodeinfo

### Wallet Methods (9)
- dumpprivkey, importprivkey, dumpwallet, importwallet
- getwalletinfo, listwallets, createwallet, loadwallet, unloadwallet

### Utility Methods (8)
- estimatefee, estimatesmartfee, help, uptime
- encodehexstr, decodehexstr, getinfo, validateaddress

## Data Models

The explorer uses TypeScript interfaces for type safety:

- **Block**: Complete block information with transactions
- **Transaction**: Full transaction details with inputs/outputs
- **Address**: Address information with balance and history
- **MiningPoolStats**: Mining pool statistics
- **Miner**: Individual miner information

See `lib/models.ts` for complete type definitions.

## Components

### Pages
- `/` - Main dashboard with blockchain statistics
- `/block/[hash]` - Block detail page
- `/tx/[txid]` - Transaction detail page
- `/address/[address]` - Address detail page

### Components
- `BlockchainStatsDashboard` - Real-time blockchain statistics
- `BlocksTable` - Latest blocks table
- `TransactionsTable` - Recent transactions table
- `MiningStats` - Mining pool statistics
- `SearchBar` - Search functionality

## Error Handling

All API routes include comprehensive error handling:

- HTTP status codes (400, 404, 500)
- Descriptive error messages
- Graceful fallbacks for missing data
- Proper logging for debugging

## Performance Optimization

- **Caching**: API responses are cached where appropriate
- **Pagination**: Large datasets are paginated
- **Lazy Loading**: Components load data on demand
- **Real-time Updates**: Automatic refresh intervals

## Security Considerations

- **Input Validation**: All user inputs are validated
- **Error Messages**: Sensitive information is not exposed
- **CORS**: Properly configured for production
- **Rate Limiting**: Recommended for production deployments

## Troubleshooting

### RPC Connection Issues

If the explorer can't connect to the RPC server:

1. Verify RPC server is running: `curl http://localhost:8332`
2. Check `NEXT_PUBLIC_RPC_URL` environment variable
3. Ensure RPC server is accessible from the explorer
4. Check firewall rules

### Missing Data

If blocks/transactions are not showing:

1. Verify RPC server has synced the blockchain
2. Check RPC server logs for errors
3. Verify network connectivity
4. Try restarting the explorer

### Performance Issues

If the explorer is slow:

1. Check RPC server performance
2. Monitor network latency
3. Check browser console for errors
4. Consider caching strategies

## Development

### Project Structure

```
silver2.0/explorer/
├── app/
│   ├── api/              # API routes
│   ├── block/            # Block detail pages
│   ├── tx/               # Transaction detail pages
│   ├── address/          # Address detail pages
│   ├── page.tsx          # Main dashboard
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/
│   ├── rpc-client.ts     # RPC API client
│   └── models.ts         # TypeScript interfaces
├── public/               # Static assets
└── package.json          # Dependencies
```

### Adding New Features

1. Create API route in `app/api/`
2. Add RPC client method in `lib/rpc-client.ts`
3. Create component in `components/`
4. Add page or integrate into existing page

## Testing

### Manual Testing

1. Start the explorer: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Test search functionality
4. View block/transaction/address details
5. Check mining statistics

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Get latest blocks
curl http://localhost:3000/api/blocks/latest?limit=10

# Get specific block
curl http://localhost:3000/api/blocks/[hash]

# Search
curl http://localhost:3000/api/search?q=1000
```

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review RPC server logs
3. Check browser console for errors
4. Verify environment configuration

## License

This explorer is part of the SilverBitcoin project.
