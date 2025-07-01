#!/bin/bash

# Update Orin Docker Images Script
# This script helps update the Docker image tags in the deployment configuration

set -e

echo "🔄 Orin Docker Images Update Script"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Configuration
ORIN_REGISTRY="ghcr.io/buildorin"
DEFAULT_TAG="latest"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "/opt/orin/compose-production.yaml" ]; then
    print_error "Orin deployment not found. Please run deploy-production.sh first."
    exit 1
fi

print_status "Current Orin deployment found in /opt/orin"

# Get current tag
CURRENT_TAG=$(grep -o "${ORIN_REGISTRY}/orin-server:[^[:space:]]*" /opt/orin/compose-production.yaml | cut -d: -f2)
print_info "Current image tag: $CURRENT_TAG"

# Show available tags from GitHub Packages
print_status "Fetching available tags from GitHub Packages..."
print_warning "You need to be logged into GitHub Container Registry"
print_warning "Run: docker login ghcr.io -u YOUR_USERNAME -p YOUR_TOKEN"

echo ""
echo "Available tags for orin-server:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep "$ORIN_REGISTRY/orin-server" || print_warning "No local images found"

echo ""
echo "Available tags for orin-task:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep "$ORIN_REGISTRY/orin-task" || print_warning "No local images found"

echo ""
echo "Available tags for orin-web:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep "$ORIN_REGISTRY/orin-web" || print_warning "No local images found"

echo ""
read -p "Enter new tag (or press Enter to keep current '$CURRENT_TAG'): " NEW_TAG

if [ -z "$NEW_TAG" ]; then
    NEW_TAG="$CURRENT_TAG"
    print_info "Keeping current tag: $NEW_TAG"
else
    print_status "Updating to tag: $NEW_TAG"
fi

# Update compose files
print_status "Updating compose files..."

# Update GPU compose file
sed -i "s|${ORIN_REGISTRY}/orin-server:[^[:space:]]*|${ORIN_REGISTRY}/orin-server:${NEW_TAG}|g" /opt/orin/compose-production.yaml
sed -i "s|${ORIN_REGISTRY}/orin-task:[^[:space:]]*|${ORIN_REGISTRY}/orin-task:${NEW_TAG}|g" /opt/orin/compose-production.yaml
sed -i "s|${ORIN_REGISTRY}/orin-web:[^[:space:]]*|${ORIN_REGISTRY}/orin-web:${NEW_TAG}|g" /opt/orin/compose-production.yaml

# Update CPU compose file
sed -i "s|${ORIN_REGISTRY}/orin-server:[^[:space:]]*|${ORIN_REGISTRY}/orin-server:${NEW_TAG}|g" /opt/orin/compose-production-cpu.yaml
sed -i "s|${ORIN_REGISTRY}/orin-task:[^[:space:]]*|${ORIN_REGISTRY}/orin-task:${NEW_TAG}|g" /opt/orin/compose-production-cpu.yaml
sed -i "s|${ORIN_REGISTRY}/orin-web:[^[:space:]]*|${ORIN_REGISTRY}/orin-web:${NEW_TAG}|g" /opt/orin/compose-production-cpu.yaml

print_status "Compose files updated successfully!"

# Pull new images
print_status "Pulling new images..."
cd /opt/orin

print_status "Pulling orin-server:${NEW_TAG}..."
docker pull "${ORIN_REGISTRY}/orin-server:${NEW_TAG}" || print_warning "Failed to pull orin-server:${NEW_TAG}"

print_status "Pulling orin-task:${NEW_TAG}..."
docker pull "${ORIN_REGISTRY}/orin-task:${NEW_TAG}" || print_warning "Failed to pull orin-task:${NEW_TAG}"

print_status "Pulling orin-web:${NEW_TAG}..."
docker pull "${ORIN_REGISTRY}/orin-web:${NEW_TAG}" || print_warning "Failed to pull orin-web:${NEW_TAG}"

print_status "✅ Image update complete!"
echo ""
print_info "To apply the changes, restart the Orin services:"
echo "  systemctl restart orin-app"
echo ""
print_info "To check service status:"
echo "  systemctl status orin-app"
echo "  docker-compose -f /opt/orin/compose-production.yaml ps"
echo ""
print_info "To view logs:"
echo "  docker-compose -f /opt/orin/compose-production.yaml logs -f" 