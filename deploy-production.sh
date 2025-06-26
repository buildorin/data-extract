#!/bin/bash

# Production Deployment Script for Orin
# This script sets up your VPS with Docker + Cloudflare Tunnel

set -e

echo "🚀 Starting Orin Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Detect GPU availability
print_status "Checking for GPU support..."
if command -v nvidia-smi &> /dev/null; then
    GPU_AVAILABLE=true
    print_status "NVIDIA GPU detected - will use GPU-optimized configuration"
else
    GPU_AVAILABLE=false
    print_warning "No NVIDIA GPU detected - will use CPU-optimized configuration"
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git unzip

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose already installed"
fi

# Install NVIDIA Container Toolkit if GPU is available
if [ "$GPU_AVAILABLE" = true ]; then
    print_status "Installing NVIDIA Container Toolkit..."
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | tee /etc/apt/sources.list.d/nvidia-docker.list
    apt update
    apt install -y nvidia-docker2
    systemctl restart docker
    print_status "NVIDIA Container Toolkit installed"
fi

# Install cloudflared
print_status "Installing Cloudflare Tunnel..."
if ! command -v cloudflared &> /dev/null; then
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
else
    print_status "Cloudflared already installed"
fi

# Create orin user
print_status "Setting up orin user..."
if ! id "orin" &>/dev/null; then
    useradd -m -s /bin/bash orin
    usermod -aG docker orin
    print_status "Created orin user"
else
    print_status "orin user already exists"
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p /opt/orin
cd /opt/orin

# Copy application files (assuming they're in the current directory)
if [ -f "compose-production.yaml" ]; then
    cp compose-production.yaml /opt/orin/
    cp compose-production-cpu.yaml /opt/orin/ 2>/dev/null || print_warning "CPU compose file not found"
    cp models.yaml /opt/orin/
    cp .env /opt/orin/ 2>/dev/null || print_warning ".env file not found - you'll need to create it"
    cp realm-export.json /opt/orin/ 2>/dev/null || print_warning "realm-export.json not found - you'll need to create it"
    cp cloudflared-config.yaml /opt/orin/
else
    print_error "compose-production.yaml not found in current directory"
    exit 1
fi

# Set proper permissions
chown -R orin:orin /opt/orin

# Create systemd service for cloudflared
print_status "Creating Cloudflare Tunnel service..."
cat > /etc/systemd/system/cloudflared-orin.service << EOF
[Unit]
Description=Cloudflare Tunnel for Orin
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /opt/orin/cloudflared-config.yaml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for Docker Compose (GPU or CPU based)
print_status "Creating Docker Compose service..."
if [ "$GPU_AVAILABLE" = true ]; then
    COMPOSE_FILE="compose-production.yaml"
    print_status "Using GPU-optimized configuration"
else
    COMPOSE_FILE="compose-production-cpu.yaml"
    print_status "Using CPU-optimized configuration"
fi

cat > /etc/systemd/system/orin-app.service << EOF
[Unit]
Description=Orin Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/orin
ExecStart=/usr/local/bin/docker-compose -f $COMPOSE_FILE up -d --build
ExecStop=/usr/local/bin/docker-compose -f $COMPOSE_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

print_status "✅ Basic setup complete!"
echo ""
print_warning "Next steps:"
echo "1. Edit /opt/orin/models.yaml with your actual API keys"
echo "2. Create /opt/orin/.env file with your environment variables"
echo "3. Set up Cloudflare Tunnel:"
echo "   - Go to Cloudflare Zero Trust dashboard"
echo "   - Create a tunnel named 'orin-tunnel'"
echo "   - Copy the tunnel ID to /opt/orin/cloudflared-config.yaml"
echo "   - Run: cloudflared tunnel login"
echo "4. Start services:"
echo "   - systemctl enable cloudflared-orin"
echo "   - systemctl enable orin-app"
echo "   - systemctl start cloudflared-orin"
echo "   - systemctl start orin-app"
echo ""
print_status "Your app will be available at:"
echo "- Main app: https://app.useorin.com"
echo "- API: https://api.app.useorin.com"
echo "- Auth: https://auth.app.useorin.com"
echo "- S3 Console: https://s3.app.useorin.com"
echo ""
if [ "$GPU_AVAILABLE" = true ]; then
    print_status "GPU configuration: Enabled"
else
    print_warning "GPU configuration: Disabled (CPU-only mode)"
fi 