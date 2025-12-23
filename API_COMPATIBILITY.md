# SilverBitcoin RPC Explorer - API Compatibility Guide

## Overview

This explorer has been updated to work with the SilverBitcoin (SLVR) blockchain and its JSON-RPC 2.0 API. This document outlines the compatibility and any differences from the original Bitcoin RPC Explorer.

## Supported RPC Methods

The explorer supports all major SilverBitcoin RPC methods:

### Blockchain Methods
- `getblockchaininfo` - Get blockchain information
- `getblockcount` - Get current block height
- `getdifficulty` - Get current difficulty
- `gethashrate` - Get network hashrate
- `getbestblockhash` - Get latest block hash
- `getblock` - Get block details
- `getblockheader` - Get block header
- `getblockhash` - Get block hash by height
- `getchaintips` - Get chain tips
- `getnetworkhashps` - Get network hashrate
- `gettxoutsetinfo` - Get UTXO set info

### Address Methods
- `getnewaddress` - Generate new address
- `listaddresses` - List all addresses
- `getaddressbalance` - Get address balance
- `getbalance` - Get wallet balance
- `getaddressinfo` - Get address information
- `validateaddress` - Validate address format

### Transaction Methods
- `sendtransaction` - Send transaction
- `gettransaction` - Get transaction details
- `getrawtransaction` - Get raw transaction
- `decoderawtransaction` - Decode raw transaction
- `createrawtransaction` - Create raw transaction
- `signrawtransaction` - Sign raw transaction
- `listtransactions` - List transactions
- `listunspent` - List unspent outputs
- `gettxout` - Get transaction output
- `getmempoolinfo` - Get mempool info
- `getrawmempool` - Get raw mempool

### Mining Methods
- `startmining` - Start mining
- `stopmining` - Stop mining
- `getmininginfo` - Get mining info
- `setminingaddress` - Set mining address
- `submitblock` - Submit block
- `getblocktemplate` - Get block template

### Network Methods
- `getnetworkinfo` - Get network info
- `getpeerinfo` - Get peer info
- `getconnectioncount` - Get connection count
- `addnode` - Add node
- `disconnectnode` - Disconnect node

### Wallet Methods
- `dumpprivkey` - Dump private key
- `importprivkey` - Import private key
- `dumpwallet` - Dump wallet
- `importwallet` - Import wallet
- `getwalletinfo` - Get wallet info
- `listwallets` - List wallets
- `createwallet` - Create wallet
- `loadwallet` - Load wallet

## Key Differences from Bitcoin

### Currency Units

**Bitcoin:**
- 1 BTC = 100,000,000 satoshis

**SilverBitcoin:**
- 1 SLVR = 100,000,000 MIST (same ratio as Bitcoin)
- Base unit: MIST (equivalent to satoshi)
- Display unit: SLVR

### Address Format

**Bitcoin:**
- P2PKH: `1...` (26-35 characters)
- P2SH: `3...` (26-35 characters)
- Bech32: `bc1...` (42-62 characters)

**SilverBitcoin:**
- 512-bit quantum-resistant addresses
- Format: `SLVR...` (90-92 characters)
- Base58 encoded with checksum
- Fully compatible with quantum-resistant cryptography

### Block Time

**Bitcoin:**
- Target: 10 minutes (600 seconds)

**SilverBitcoin:**
- Target: 30 seconds
- Faster block confirmation
- More frequent difficulty adjustments

### Difficulty Adjustment

**Bitcoin:**
- Every 2,016 blocks (~2 weeks)

**SilverBitcoin:**
- Every 2,016 blocks (~1 day at 30s block time)
- More responsive to hashrate changes

### Mining Algorithm

**Bitcoin:**
- SHA-256

**SilverBitcoin:**
- SHA-512 (512-bit quantum-resistant)
- Provides enhanced security against quantum computing threats

### Supply

**Bitcoin:**
- 21,000,000 BTC total supply
- Halving every 210,000 blocks

**SilverBitcoin:**
- 21,000,000 SLVR total supply (same as Bitcoin)
- Halving every 210,000 blocks
- Initial block reward: 50 SLVR

## Configuration Changes

### Environment Variables

**Old (Bitcoin):**
```env
BTCEXP_BITCOIND_HOST=127.0.0.1
BTCEXP_BITCOIND_PORT=8332
BTCEXP_BITCOIND_USER=bitcoin
BTCEXP_BITCOIND_PASS=password
```

**New (SilverBitcoin):**
```env
BTCEXP_RPC_HOST=127.0.0.1
BTCEXP_RPC_PORT=8332
BTCEXP_RPC_USERNAME=silverbitcoin
BTCEXP_RPC_PASSWORD=password
BTCEXP_COIN=SLVR
```

### Coin Configuration

The explorer now uses `app/coins/slvr.js` instead of `app/coins/bkc.js`:

```javascript
module.exports = {
    name: "SilverBitcoin",
    ticker: "SLVR",
    baseCurrencyUnit: "MIST",
    targetBlockTimeSeconds: 30,
    difficultyAdjustmentBlockCount: 2016,
    // ... other config
};
```

## API Response Format

All RPC responses follow the JSON-RPC 2.0 standard:

```json
{
    "jsonrpc": "2.0",
    "result": {
        // Response data
    },
    "error": null,
    "id": 1
}
```

### Error Responses

```json
{
    "jsonrpc": "2.0",
    "result": null,
    "error": {
        "code": -1,
        "message": "Error description"
    },
    "id": 1
}
```

## Common Error Codes

| Code | Meaning |
|------|---------|
| -1 | Generic error |
| -3 | Invalid amount |
| -4 | Account not found |
| -5 | Invalid address |
| -6 | Wallet error |
| -7 | Insufficient funds |
| -8 | Invalid account |
| -9 | Transaction rejected |
| -10 | Duplicate transaction |
| -11 | Transaction not found |
| -12 | Block not found |

## Testing the API

### Using curl

```bash
# Get blockchain info
curl -X POST http://localhost:8332 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getblockchaininfo",
    "params": [],
    "id": 1
  }' \
  -u silverbitcoin:password

# Get block count
curl -X POST http://localhost:8332 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getblockcount",
    "params": [],
    "id": 1
  }' \
  -u silverbitcoin:password
```

### Using the Explorer UI

1. Navigate to the RPC Browser section
2. Select a method from the dropdown
3. Enter parameters if needed
4. Click "Execute"
5. View the raw JSON response

## Performance Considerations

### Recommended Node Configuration

```conf
# silverbitcoin.conf

# Enable transaction indexing for full functionality
txindex=1

# Disable pruning for complete blockchain data
prune=0

# Increase RPC thread pool for better performance
rpcthreads=8

# Set appropriate cache size (in MB)
dbcache=2000

# Enable compact blocks for faster sync
compact_blocks=1
```

### Explorer Optimization

- **Slow Device Mode**: Set `BTCEXP_SLOW_DEVICE_MODE=true` for resource-constrained systems
- **Cache TTL**: Adjust cache timeouts in `app/config.js`
- **Rate Limiting**: Configure in `.env` file

## Troubleshooting

### Connection Errors

**Error:** `Unable to connect to RPC server`

**Solution:**
1. Verify `silverd` is running: `ps aux | grep silverd`
2. Check RPC port is open: `netstat -an | grep 8332`
3. Verify credentials in `.env`
4. Check firewall rules

### Invalid Address Errors

**Error:** `Invalid address format`

**Solution:**
- Ensure address starts with `SLVR`
- Check address length (90-92 characters)
- Verify address is properly base58 encoded

### Slow Performance

**Error:** `Requests timing out`

**Solution:**
1. Enable `txindex=1` in silverbitcoin.conf
2. Increase `dbcache` value
3. Use SSD storage
4. Increase RPC timeout in `.env`

## Migration from Bitcoin Explorer

If migrating from a Bitcoin RPC Explorer:

1. **Update environment variables** - Use new SLVR-specific variables
2. **Update coin configuration** - Switch from BTC to SLVR
3. **Update RPC credentials** - Use SilverBitcoin node credentials
4. **Test connectivity** - Verify RPC connection works
5. **Clear cache** - Remove old cached data if applicable

## Support

For API-related questions:
- SilverBitcoin Docs: https://silverbitcoin.org/docs
- GitHub Issues: https://github.com/silverbitcoin/explorer/issues
- RPC Documentation: https://docs.silverbitcoin.org/rpc-api
