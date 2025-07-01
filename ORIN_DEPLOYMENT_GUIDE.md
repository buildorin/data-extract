# Orin Deployment Guide - Custom Images

This guide shows you how to build and deploy Orin with your own custom Docker images, following the official Chunkr patterns but with Orin branding.

## 🎯 Deployment Strategy: Custom Orin Images

**Why Custom Images?**
- ✅ **Branded**: Your own Orin images instead of Chunkr
- ✅ **Production-ready**: Pre-built, tested images
- ✅ **Fast deployments**: No build time on production
- ✅ **Version control**: Tagged images for rollbacks
- ✅ **Consistent**: Same image across environments

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Docker Registry

Choose one of these options:

#### Option A: GitHub Container Registry (Recommended)
```bash
# Create GitHub Personal Access Token with 'write:packages' permission
# Go to: https://github.com/settings/tokens
```

#### Option B: Docker Hub
```bash
# Use your existing Docker Hub account
```

#### Option C: AWS ECR
```bash
# If you prefer AWS ECR
aws ecr create-repository --repository-name orin-server
aws ecr create-repository --repository-name orin-task  
aws ecr create-repository --repository-name orin-web
```

### Step 2: Build and Push Orin Images

Run the build script on your development machine:

```bash
# Make script executable
chmod +x build-orin-images.sh

# Run the build script
./build-orin-images.sh
```

The script will:
- Build 3 custom Orin images: `orin-server`, `orin-task`, `orin-web`
- Push them to your chosen registry
- Create production-ready compose files
- Use official Chunkr images for ML services (segmentation, OCR)

### Step 3: Deploy to Production

#### Upload Files to Production Server
```bash
# Upload the new compose files
scp compose-production-orin.yaml root@your-vps-ip:/opt/orin/
scp compose-production-orin-cpu.yaml root@your-vps-ip:/opt/orin/

# Upload environment files
scp .env root@your-vps-ip:/opt/orin/
scp models.yaml root@your-vps-ip:/opt/orin/
scp realm-export.json root@your-vps-ip:/opt/orin/
```

#### Update Production Systemd Service
```bash
# SSH into your production server
ssh root@your-vps-ip

# Stop current service
systemctl stop orin-app

# Update the compose file reference in systemd
nano /etc/systemd/system/orin-app.service

# Change the ExecStart line to:
ExecStart=/usr/local/bin/docker-compose -f /opt/orin/compose-production-orin.yaml up

# Reload and start
systemctl daemon-reload
systemctl start orin-app
systemctl status orin-app
```

### Step 4: Configure Cloudflare Tunnel

Set up your Cloudflare Tunnel to route traffic:

```bash
# Install cloudflared on production server
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared-linux-amd64.deb

# Create tunnel config
cat > /etc/cloudflared/config.yml << EOF
tunnel: your-tunnel-id
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: app.useorin.com
    service: http://localhost:5173
  - hostname: api.app.useorin.com
    service: http://localhost:8000
  - hostname: auth.app.useorin.com
    service: http://localhost:8080
  - hostname: s3.app.useorin.com
    service: http://localhost:9000
  - catch-all: true
    service: http_status:404
EOF

# Start cloudflared service
systemctl enable cloudflared
systemctl start cloudflared
```

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chunkr

# Redis
REDIS_URL=redis://redis:6379

# S3/MinIO
AWS_ACCESS_KEY=minioadmin
AWS_SECRET_KEY=minioadmin
AWS_ENDPOINT=http://minio:9000
AWS_REGION=us-east-1

# Authentication
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

### Models Configuration (models.yaml)
```yaml
models:
  - name: "gpt-4o"
    provider: "openai"
    api_key_env: "OPENAI_API_KEY"
    max_tokens: 4096
    temperature: 0.1
  - name: "claude-3-sonnet"
    provider: "anthropic"
    api_key_env: "ANTHROPIC_API_KEY"
    max_tokens: 4096
    temperature: 0.1
```

## 🐳 Image Details

### Custom Orin Images
- **orin-server**: Main API server (Rust)
- **orin-task**: Background task workers (Rust)
- **orin-web**: Frontend web application (React/TypeScript)

### Official Chunkr Images (Reused)
- **luminainc/segmentation:1.4.2**: Document segmentation service
- **luminainc/doctr:1.20.1**: OCR service

## 🔄 Updating Images

To update your Orin images:

```bash
# 1. Build new images with new tag
./build-orin-images.sh

# 2. Update production compose file with new tag
# 3. Restart production service
systemctl restart orin-app
```

## 🚨 Troubleshooting

### Common Issues

1. **Image Pull Errors**
   ```bash
   # Check if images exist in registry
   docker pull your-registry/orin-server:latest
   
   # Verify authentication
   docker login your-registry
   ```

2. **Service Won't Start**
   ```bash
   # Check logs
   journalctl -u orin-app -f
   
   # Check Docker Compose
   docker-compose -f /opt/orin/compose-production-orin.yaml logs
   ```

3. **Disk Space Issues**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Check disk usage
   df -h
   ```

## 📊 Monitoring

### Health Checks
- **API**: `https://api.app.useorin.com/health`
- **Web**: `https://app.useorin.com`
- **Auth**: `https://auth.app.useorin.com`

### Logs
```bash
# Service logs
journalctl -u orin-app -f

# Docker logs
docker-compose -f /opt/orin/compose-production-orin.yaml logs -f
```

## 🎉 Success!

Your Orin deployment is now running with:
- ✅ Custom Orin-branded images
- ✅ Production-ready configuration
- ✅ Cloudflare Tunnel for SSL
- ✅ Scalable architecture
- ✅ Easy updates and rollbacks

Your application will be available at:
- **Main App**: https://app.useorin.com
- **API**: https://api.app.useorin.com
- **Auth**: https://auth.app.useorin.com
- **S3**: https://s3.app.useorin.com 