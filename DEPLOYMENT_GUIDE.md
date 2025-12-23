# SilverBitcoin RPC Explorer - Deployment Guide

## Overview

This is a self-hosted blockchain explorer for SilverBitcoin (SLVR) that connects to your own SilverBitcoin node via RPC. It's database-free and lightweight.

## Prerequisites

- **Node.js**: v14 or higher
- **SilverBitcoin Node**: Running with RPC enabled (`server=1` in silverbitcoin.conf)
- **npm**: Package manager (comes with Node.js)

## Installation

### 1. Clone or Download

```bash
cd silver2.0/slvr-explorer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Coin selection
BTCEXP_COIN=SLVR

# RPC Connection (adjust to your node)
BTCEXP_RPC_HOST=127.0.0.1
BTCEXP_RPC_PORT=8332
BTCEXP_RPC_USERNAME=silverbitcoin
BTCEXP_RPC_PASSWORD=your_secure_password

# Explorer Settings
BTCEXP_HOST=0.0.0.0
BTCEXP_PORT=3002
BTCEXP_BASEURL=/

# Optional: Basic Auth Password
BTCEXP_BASIC_AUTH_PASSWORD=

# Environment
NODE_ENV=production
```

## Running the Explorer

### Development Mode

```bash
npm start
```

The explorer will be available at `http://localhost:3002`

### Production Mode with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the explorer
pm2 start bin/www --name "slvr-explorer"

# Save PM2 configuration
pm2 save

# Enable startup on reboot
pm2 startup
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t slvr-explorer .

# Run the container
docker run -d \
  --name slvr-explorer \
  -p 3002:3002 \
  -e BTCEXP_RPC_HOST=host.docker.internal \
  -e BTCEXP_RPC_PORT=8332 \
  -e BTCEXP_RPC_USERNAME=silverbitcoin \
  -e BTCEXP_RPC_PASSWORD=your_password \
  slvr-explorer
```

Or use docker-compose:

```bash
docker-compose up -d
```

## SilverBitcoin Node Configuration

Ensure your `silverbitcoin.conf` has:

```conf
# Enable RPC server
server=1

# RPC credentials
rpcuser=silverbitcoin
rpcpassword=your_secure_password

# RPC binding
rpcbind=127.0.0.1
rpcport=8332

# Optional: Enable transaction indexing for full functionality
txindex=1

# Optional: Disable pruning for complete blockchain data
prune=0
```

## Features

- **Block Explorer**: Browse blocks, transactions, and addresses
- **Network Dashboard**: View network statistics and mining info
- **Search**: Find blocks, transactions, and addresses
- **RPC Browser**: Execute RPC commands directly
- **Mempool Analysis**: View pending transactions and fees
- **Mining Stats**: Track mining pool activity

## API Endpoints

The explorer provides several API endpoints:

- `/api/blockchain/info` - Blockchain information
- `/api/block/:hash` - Block details
- `/api/tx/:txid` - Transaction details
- `/api/address/:address` - Address information

## Troubleshooting

### Connection Issues

1. **Check RPC is running**: `curl http://localhost:8332`
2. **Verify credentials**: Check `silverbitcoin.conf`
3. **Check firewall**: Ensure port 8332 is accessible
4. **Check logs**: `npm start` shows connection errors

### Performance Issues

- Enable `txindex=1` in silverbitcoin.conf for faster lookups
- Disable `prune` for complete blockchain data
- Use SSD storage for better performance
- Consider `BTCEXP_SLOW_DEVICE_MODE=true` for resource-constrained systems

### Missing Data

- Ensure `txindex=1` is enabled for transaction history
- Wait for node to fully sync
- Check that pruning is disabled

## Security Considerations

1. **RPC Authentication**: Always use strong passwords
2. **Firewall**: Restrict RPC port access to localhost only
3. **HTTPS**: Use a reverse proxy (nginx) for HTTPS
4. **Basic Auth**: Enable `BTCEXP_BASIC_AUTH_PASSWORD` for web access
5. **Rate Limiting**: Configured by default, adjust if needed

## Nginx Reverse Proxy Example

```nginx
server {
    listen 443 ssl http2;
    server_name explorer.silverbitcoin.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### Check Status

```bash
# With PM2
pm2 status

# With Docker
docker ps | grep slvr-explorer
```

### View Logs

```bash
# With PM2
pm2 logs slvr-explorer

# With Docker
docker logs -f slvr-explorer
```

## Updating

```bash
# Pull latest changes
git pull

# Install new dependencies
npm install

# Restart the explorer
npm start
```

## Support

For issues and questions:
- GitHub: https://github.com/silverbitcoin/explorer
- Documentation: https://silverbitcoin.org/docs

## License

MIT License - See LICENSE file for details
