# SilverBitcoin Explorer - Quick Start

## 5-Minute Setup

### 1. Prerequisites
- Node.js 18+ installed
- SilverBitcoin RPC server running on `http://localhost:8332`

### 2. Install & Configure

```bash
cd silver2.0/explorer
npm install
cp .env.local.example .env.local
```

### 3. Start Explorer

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## What You Can Do

### Search
- **Block Height**: Enter a number (e.g., `1000`)
- **Block Hash**: Enter 64-char hex (e.g., `abc123...`)
- **Transaction ID**: Enter 64-char hex
- **Address**: Enter any valid address

### View Details
- **Blocks**: See all transactions, miner, rewards, difficulty
- **Transactions**: View inputs, outputs, fees, confirmations
- **Addresses**: Check balance, transaction history, UTXOs

### Monitor Mining
- Real-time pool statistics
- Top miners list
- Network hashrate and difficulty

## Environment Variables

Key variables in `.env.local`:

```env
# RPC Server (default: http://localhost:8332)
NEXT_PUBLIC_RPC_URL=http://localhost:8332

# API Base URL (default: http://localhost:3000)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

All endpoints return JSON:

```bash
# Latest blocks
GET /api/blocks/latest?limit=10

# Specific block
GET /api/blocks/[hash]

# Transactions
GET /api/transactions?limit=25

# Specific transaction
GET /api/tx/[txid]

# Address info
GET /api/address/[address]

# Mining stats
GET /api/mining?stats=true&topminers=true

# Search
GET /api/search?q=query
```

## Troubleshooting

### "Cannot connect to RPC"
- Verify RPC server is running: `curl http://localhost:8332`
- Check `NEXT_PUBLIC_RPC_URL` in `.env.local`

### "No blocks found"
- Ensure RPC server has synced blockchain
- Check RPC server logs

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Production Deployment

```bash
npm run build
npm start
```

## Next Steps

- Read `EXPLORER_SETUP.md` for detailed configuration
- Check `lib/rpc-client.ts` for available RPC methods
- Review `app/api/` for API route implementations
- Customize components in `components/` as needed

## Support

For issues:
1. Check RPC server connectivity
2. Review browser console for errors
3. Check `.env.local` configuration
4. Review RPC server logs
