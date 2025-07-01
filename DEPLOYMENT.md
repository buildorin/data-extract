# Orin Production Deployment Guide

This guide explains how to deploy Orin services to production using pre-built Docker images from GitHub Packages.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Create a token at: https://github.com/settings/tokens
   - Required scopes: `read:packages`
   - This token will be used to authenticate with GitHub Container Registry

2. **VPS/Server Requirements**
   - Ubuntu/Debian-based system
   - Root access or sudo privileges
   - At least 4GB RAM (8GB recommended)
   - 50GB+ disk space
   - NVIDIA GPU (optional, for GPU acceleration)

3. **Domain Configuration**
   - Configure DNS for your domain (e.g., `app.useorin.com`, `api.useorin.com`)
   - Set up Cloudflare Zero Trust for tunneling

## Quick Start

### 1. Initial Deployment

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd data-extract

# Run the deployment script
sudo ./deploy-production.sh
```

The script will:
- Install Docker and Docker Compose
- Set up NVIDIA Container Toolkit (if GPU available)
- Install Cloudflare Tunnel
- Create systemd services
- Configure GitHub Packages authentication
- Set up the application directory

### 2. Configuration Files

After running the deployment script, you need to create these configuration files in `/opt/orin/`:

#### `models.yaml`
```yaml
# Your LLM API configurations
openai:
  api_key: "your-openai-key"
  model: "gpt-4"

anthropic:
  api_key: "your-anthropic-key"
  model: "claude-3-sonnet-20240229"
```

#### `.env`
```bash
# Environment variables for your application
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chunkr
REDIS_URL=redis://redis:6379
# Add other environment variables as needed
```

#### `cloudflared-config.yaml`
```yaml
tunnel: your-tunnel-id
credentials-file: /root/.cloudflared/your-tunnel-id.json

ingress:
  - hostname: app.useorin.com
    service: http://localhost:5173
  - hostname: api.useorin.com
    service: http://localhost:8000
  - hostname: auth.useorin.com
    service: http://localhost:8080
  - hostname: s3.useorin.com
    service: http://localhost:9001
  - service: http_status:404
```

### 3. Start Services

```bash
# Enable and start services
sudo systemctl enable cloudflared-orin
sudo systemctl enable orin-app
sudo systemctl start cloudflared-orin
sudo systemctl start orin-app

# Check status
sudo systemctl status orin-app
sudo systemctl status cloudflared-orin
```

## Managing Docker Images

### List Available Tags

To see what versions are available in your GitHub Packages:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token

# List available tags
./list-orin-tags.sh
```

### Update to Specific Version

To update to a specific version of the Orin images:

```bash
sudo ./update-orin-images.sh
```

This script will:
- Show current image tags
- Allow you to select a new tag
- Update both GPU and CPU compose files
- Pull the new images
- Provide instructions for restarting services

### Manual Image Updates

You can also manually update images:

```bash
# Pull specific versions
docker pull ghcr.io/buildorin/orin-server:v1.2.3
docker pull ghcr.io/buildorin/orin-task:v1.2.3
docker pull ghcr.io/buildorin/orin-web:v1.2.3

# Update compose files manually
sed -i 's/ghcr.io\/buildorin\/orin-server:latest/ghcr.io\/buildorin\/orin-server:v1.2.3/g' compose-cpu.yaml
sed -i 's/ghcr.io\/buildorin\/orin-task:latest/ghcr.io\/buildorin\/orin-task:v1.2.3/g' compose-cpu.yaml
sed -i 's/ghcr.io\/buildorin\/orin-web:latest/ghcr.io\/buildorin\/orin-web:v1.2.3/g' compose-cpu.yaml

# Restart services
sudo systemctl restart orin-app
```

## Monitoring and Maintenance

### View Logs

```bash
# View all service logs
docker-compose -f compose-cpu.yaml logs -f

# View specific service logs
docker-compose -f compose-cpu.yaml logs -f server
docker-compose -f compose-cpu.yaml logs -f task
docker-compose -f compose-cpu.yaml logs -f web
```

### Check Service Status

```bash
# Systemd services
sudo systemctl status orin-app
sudo systemctl status cloudflared-orin

# Docker containers
docker-compose -f compose-cpu.yaml ps
docker stats
```

### Backup and Restore

```bash
# Backup database
docker exec postgres pg_dump -U postgres chunkr > backup.sql

# Restore database
docker exec -i postgres psql -U postgres chunkr < backup.sql

# Backup MinIO data
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **GitHub Packages Authentication Failed**
   ```bash
   # Re-authenticate
   docker login ghcr.io -u your_username -p your_token
   ```

2. **Services Not Starting**
   ```bash
   # Check logs
   sudo journalctl -u orin-app -f
   sudo journalctl -u cloudflared-orin -f
   ```

3. **GPU Not Detected**
   ```bash
   # Check NVIDIA drivers
   nvidia-smi
   
   # Check Docker GPU support
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :8000
   sudo netstat -tulpn | grep :5173
   ```

### Performance Tuning

#### GPU Configuration
- Ensure NVIDIA drivers are installed
- Verify Docker GPU support
- Monitor GPU usage with `nvidia-smi`

#### CPU Configuration
- Adjust thread counts in compose files
- Monitor CPU usage with `htop`
- Consider scaling task workers based on load

## Security Considerations

1. **Change Default Passwords**
   - Update PostgreSQL password
   - Update MinIO credentials
   - Update Keycloak admin password

2. **Network Security**
   - Use Cloudflare Tunnel for secure access
   - Configure firewall rules
   - Enable HTTPS everywhere

3. **Container Security**
   - Regularly update base images
   - Scan images for vulnerabilities
   - Use specific image tags instead of `latest`

## Support

For issues related to:
- **Deployment**: Check this guide and script logs
- **Orin Services**: Check the main repository documentation
- **GitHub Packages**: Check GitHub documentation

## Changelog

### v1.0.0
- Initial deployment script with GitHub Packages support
- Added image tag management scripts
- Added comprehensive documentation 

# Show last 50 lines of server logs
sudo docker-compose -f compose-cpu.yaml logs --tail=50 server

# Show last 50 lines of task logs
sudo docker-compose -f compose-cpu.yaml logs --tail=50 task

# Show last 50 lines of keycloak logs
sudo docker-compose -f compose-cpu.yaml logs --tail=50 keycloak 