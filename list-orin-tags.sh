#!/bin/bash

# List Orin Docker Image Tags Script
# This script lists available tags from GitHub Packages registry

set -e

echo "📋 Orin Docker Image Tags Lister"

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
GITHUB_API="https://api.github.com"

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    print_warning "GITHUB_TOKEN environment variable not set"
    print_warning "You can set it with: export GITHUB_TOKEN=your_token"
    print_warning "Or create a token at: https://github.com/settings/tokens"
    echo ""
    read -s -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GitHub token is required to list package tags"
    exit 1
fi

print_status "Fetching available tags from GitHub Packages..."

# Function to list package versions
list_package_versions() {
    local package_name=$1
    local display_name=$2
    
    echo ""
    print_info "=== $display_name ==="
    
    # Get package versions using GitHub API
    response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$GITHUB_API/user/packages/container/$package_name/versions" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ "$response" != "[]" ]; then
        echo "$response" | jq -r '.[] | "  - \(.metadata.container.tags[] // "untagged") (\(.created_at | split("T")[0]))"' 2>/dev/null || \
        echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/  - /' || \
        print_warning "Could not parse response for $display_name"
    else
        print_warning "No versions found for $display_name or API error"
    fi
}

# List versions for each package
list_package_versions "orin-server" "Orin Server"
list_package_versions "orin-task" "Orin Task Worker"
list_package_versions "orin-web" "Orin Web Frontend"

echo ""
print_status "✅ Tag listing complete!"
echo ""
print_info "To use a specific tag, run:"
echo "  sudo ./update-orin-images.sh"
echo ""
print_info "To pull a specific image manually:"
echo "  docker pull $ORIN_REGISTRY/orin-server:TAG_NAME"
echo "  docker pull $ORIN_REGISTRY/orin-task:TAG_NAME"
echo "  docker pull $ORIN_REGISTRY/orin-web:TAG_NAME" 