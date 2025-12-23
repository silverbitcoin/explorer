# SilverBitcoin Explorer - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] RPC server is running and fully synced
- [ ] RPC server is accessible from deployment environment
- [ ] Node.js 18+ is installed
- [ ] Environment variables are configured
- [ ] SSL/TLS certificates are ready (for HTTPS)
- [ ] Domain name is configured
- [ ] Firewall rules allow traffic

### Environment Configuration

Create `.env.local` with production values:

```env
# Production RPC Server
NEXT_PUBLIC_RPC_URL=https://rpc.silverbitcoin.org

# Production API URL
NEXT_PUBLIC_API_URL=https://explorer.silverbitcoin.org

# Network Configuration
NEXT_PUBLIC_NETWORK_NAME=SilverBitcoin Mainnet
NEXT_PUBLIC_CURRENCY_SYMBOL=SLVR
NEXT_PUBLIC_CURRENCY_DECIMALS=8

# Performance
NEXT_PUBLIC_BLOCK_TIME=600
NEXT_PUBLIC_CONFIRMATION_THRESHOLD=6

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

## Deployment Methods

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Select `silver2.0/explorer` as root directory

3. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_RPC_URL`
   - Add `NEXT_PUBLIC_API_URL`
   - Add other variables from `.env.local`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

#### Benefits:
- Automatic HTTPS
- Global CDN
- Automatic scaling
- Easy rollbacks
- Free tier available

### Option 2: Docker

Deploy using Docker containers.

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY silver2.0/explorer/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY silver2.0/explorer .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t silverbitcoin-explorer:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_RPC_URL=https://rpc.silverbitcoin.org \
  -e NEXT_PUBLIC_API_URL=https://explorer.silverbitcoin.org \
  --name explorer \
  silverbitcoin-explorer:latest
```

#### Docker Compose

```yaml
version: '3.8'

services:
  explorer:
    build:
      context: .
      dockerfile: silver2.0/explorer/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_RPC_URL: https://rpc.silverbitcoin.org
      NEXT_PUBLIC_API_URL: https://explorer.silverbitcoin.org
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Option 3: Traditional Server (Ubuntu/Debian)

Deploy on a traditional Linux server.

#### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Deploy Application

```bash
# Clone repository
git clone https://github.com/your-repo/silverbitcoin.git
cd silverbitcoin/silver2.0/explorer

# Install dependencies
npm install

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'explorer',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_RPC_URL: 'https://rpc.silverbitcoin.org',
      NEXT_PUBLIC_API_URL: 'https://explorer.silverbitcoin.org'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Setup Nginx Reverse Proxy

```nginx
upstream explorer {
  server localhost:3000;
}

server {
  listen 80;
  server_name explorer.silverbitcoin.org;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name explorer.silverbitcoin.org;

  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/explorer.silverbitcoin.org/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/explorer.silverbitcoin.org/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Proxy configuration
  location / {
    proxy_pass http://explorer;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Cache static assets
  location /_next/static {
    proxy_pass http://explorer;
    proxy_cache_valid 200 60d;
    proxy_cache_bypass $http_pragma $http_authorization;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

#### Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d explorer.silverbitcoin.org

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Option 4: AWS (EC2 + ECS)

Deploy on AWS infrastructure.

#### Using EC2

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js and dependencies
3. Clone repository
4. Build and start application
5. Configure security groups
6. Setup CloudFront CDN
7. Configure Route53 DNS

#### Using ECS (Elastic Container Service)

1. Create Docker image
2. Push to ECR (Elastic Container Registry)
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer
6. Setup auto-scaling

## Monitoring & Maintenance

### Health Checks

```bash
# Check explorer status
curl https://explorer.silverbitcoin.org

# Check API endpoint
curl https://explorer.silverbitcoin.org/api/blocks/latest

# Check RPC connectivity
curl -X POST https://rpc.silverbitcoin.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getblockcount","params":[],"id":1}'
```

### Logging

Configure logging for production:

```bash
# PM2 logs
pm2 logs explorer

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u explorer -f
```

### Performance Monitoring

- Monitor CPU and memory usage
- Track response times
- Monitor RPC server connectivity
- Setup alerts for failures

### Backup Strategy

- Backup environment configuration
- Backup SSL certificates
- Backup application code
- Regular security updates

## Scaling

### Horizontal Scaling

- Deploy multiple instances behind load balancer
- Use CDN for static assets
- Cache API responses

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching strategies

## Security

### Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Never commit secrets
3. **Rate Limiting**: Implement rate limiting on API
4. **CORS**: Configure CORS properly
5. **Security Headers**: Add security headers
6. **Regular Updates**: Keep dependencies updated
7. **Monitoring**: Monitor for suspicious activity

### SSL/TLS Configuration

```nginx
# Modern configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs explorer

# Check port availability
lsof -i :3000

# Check environment variables
env | grep NEXT_PUBLIC
```

### RPC Connection Issues

```bash
# Test RPC connectivity
curl -X POST http://localhost:8332 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getblockcount","params":[],"id":1}'

# Check firewall
sudo ufw status
```

### Performance Issues

- Check server resources
- Monitor RPC server performance
- Review application logs
- Check network connectivity

## Rollback Procedure

### Using PM2

```bash
# Stop application
pm2 stop explorer

# Revert code
git revert HEAD

# Rebuild
npm run build

# Restart
pm2 start ecosystem.config.js
```

### Using Docker

```bash
# Stop container
docker stop explorer

# Remove container
docker rm explorer

# Run previous image
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_RPC_URL=https://rpc.silverbitcoin.org \
  --name explorer \
  silverbitcoin-explorer:previous-tag
```

## Support

For deployment issues:
1. Check application logs
2. Verify RPC connectivity
3. Check environment configuration
4. Review security settings
5. Monitor server resources
