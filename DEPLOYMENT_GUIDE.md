# Orin Production Deployment Guide

This guide will help you deploy your custom Orin service to production at `https://app.useorin.com` using Docker + Cloudflare Tunnel.

## 🎯 What We've Built

✅ **Custom Orin Images** - Using your own Docker images instead of `luminainc`  
✅ **GPU Support** - Automatic detection and configuration  
✅ **CPU Fallback** - Optimized for VPS without GPU  
✅ **Cloudflare Tunnel** - Secure, SSL-enabled access  
✅ **Production Ready** - Proper scaling and resource management  

## 📋 Prerequisites

1. **VPS Provider** (choose one):
   - DigitalOcean ($6/month droplet)
   - Linode ($5/month)
   - Vultr ($6/month)
   - AWS EC2 (t3.medium or larger)

2. **Domain**: `useorin.com` (you already own this)

3. **Cloudflare Account** (free tier)

## 🚀 Quick Deployment

### Step 1: Set Up Your VPS

1. **Create a VPS** with at least:
   - 2GB RAM (4GB recommended)
   - 2 vCPUs
   - 50GB storage
   - Ubuntu 22.04 LTS

2. **SSH into your VPS**:
   ```bash
   ssh root@your-vps-ip
   ```

### Step 2: Upload Your Code

1. **Clone your repository** on the VPS:
   ```bash
   git clone https://github.com/your-username/data-extract.git
   cd data-extract
   ```

2. **Or upload files manually** using `scp`:
   ```bash
   scp -r /path/to/your/data-extract root@your-vps-ip:/root/
   ```

### Step 3: Configure Your Environment

1. **Update your API keys** in `models.yaml`:
   ```bash
   nano models.yaml
   ```
   Replace placeholder values with your actual API keys.

2. **Create environment file**:
   ```bash
   cp env.production.example .env
   nano .env
   ```

### Step 4: Set Up Cloudflare Tunnel

1. **Go to Cloudflare Dashboard** → `useorin.com`

2. **Navigate to Zero Trust** → Access → Tunnels

3. **Create a tunnel**:
   - Name: `orin-tunnel`
   - Save the tunnel token

4. **Update tunnel configuration**:
   ```bash
   nano cloudflared-config.yaml
   ```
   Replace `YOUR_TUNNEL_ID` with your actual tunnel ID.

### Step 5: Deploy

1. **Run the deployment script**:
   ```bash
   chmod +x deploy-production.sh
   sudo ./deploy-production.sh
   ```

2. **Authenticate Cloudflare Tunnel**:
   ```bash
   cloudflared tunnel login
   ```

3. **Start services**:
   ```bash
   systemctl enable cloudflared-orin
   systemctl enable orin-app
   systemctl start cloudflared-orin
   systemctl start orin-app
   ```

## 🔧 Configuration Details

### GPU vs CPU Configuration

The deployment script automatically detects GPU availability:

- **With GPU**: Uses `compose-production.yaml` with GPU optimizations
- **Without GPU**: Uses `compose-production-cpu.yaml` with CPU optimizations

### Custom Images

Your deployment uses custom Orin images:
- `orin/server:latest`
- `orin/task:latest` 
- `orin/web:latest`

These are built from your custom codebase with Orin branding and modifications.

### Service URLs

After deployment, your services will be available at:
- **Main App**: `https://app.useorin.com`
- **API**: `https://api.app.useorin.com`
- **Auth**: `https://auth.app.useorin.com`
- **S3 Console**: `https://s3.app.useorin.com`

## 📊 Resource Requirements

### Minimum VPS Specs
- **CPU**: 2 vCPUs
- **RAM**: 2GB (4GB recommended)
- **Storage**: 50GB
- **Network**: 1Gbps

### Recommended VPS Specs
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps

### With GPU (Optional)
- **GPU**: NVIDIA T4 or better
- **RAM**: 16GB+
- **Storage**: 100GB+ SSD

## 🔍 Monitoring & Maintenance

### Check Service Status
```bash
# Check all services
systemctl status cloudflared-orin orin-app

# Check Docker containers
docker ps

# View logs
docker-compose -f /opt/orin/compose-production.yaml logs -f
```

### Update Your Application
```bash
# Pull latest code
cd /opt/orin
git pull

# Rebuild and restart
systemctl restart orin-app
```

### Backup Database
```bash
# Create backup
docker exec postgres pg_dump -U postgres orin > backup.sql

# Restore backup
docker exec -i postgres psql -U postgres orin < backup.sql
```

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Check `models.yaml` has correct API keys
   - Verify keys are valid and have sufficient credits

2. **Cloudflare Tunnel Issues**:
   - Verify tunnel token is correct
   - Check DNS records point to Cloudflare

3. **Memory Issues**:
   - Increase VPS RAM
   - Reduce worker replicas in compose file

4. **GPU Not Detected**:
   - Install NVIDIA drivers
   - Install NVIDIA Container Toolkit

### Logs and Debugging
```bash
# View application logs
journalctl -u orin-app -f

# View Cloudflare tunnel logs
journalctl -u cloudflared-orin -f

# Check Docker logs
docker logs <container-name>
```

## 🔒 Security Considerations

1. **Change default passwords** in `.env`
2. **Use strong database passwords**
3. **Enable Cloudflare security features**
4. **Regular security updates**
5. **Monitor access logs**

## 📈 Scaling

### Horizontal Scaling
Increase worker replicas in compose file:
```yaml
task:
  deploy:
    replicas: 5  # Increase from 3
```

### Vertical Scaling
Upgrade your VPS resources or move to a larger instance.

### Load Balancing
For high traffic, consider using multiple VPS instances with a load balancer.

## 💰 Cost Optimization

### VPS Recommendations
- **Startup**: DigitalOcean $6/month droplet
- **Growth**: DigitalOcean $12/month droplet
- **Production**: DigitalOcean $24/month droplet

### Cloudflare Features
- **Free tier**: 50,000 requests/day
- **Pro tier**: $20/month for higher limits

## 🎉 Success!

Once deployed, your Orin service will be:
- ✅ **Live at** `https://app.useorin.com`
- ✅ **SSL secured** via Cloudflare
- ✅ **Custom branded** with Orin
- ✅ **Production ready** for customer onboarding
- ✅ **Scalable** as you grow

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify all configuration files
4. Ensure API keys are valid

Your Orin service is now ready to onboard customers! 🚀 