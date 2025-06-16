#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker Desktop first.${NC}"
    echo "1. Open Docker Desktop from your Applications folder"
    echo "2. Wait for Docker to start (you'll see the whale icon in your menu bar)"
    echo "3. Run this script again"
    exit 1
fi

# Stop any running containers
echo "Stopping any running containers..."
docker compose -f compose-local.yaml down

# Start the services
echo "Starting services..."
docker compose -f compose-local.yaml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker compose -f compose-local.yaml ps

echo -e "\n${GREEN}Local development environment is ready!${NC}"
echo "You can access the services at:"
echo "- Web Interface: http://localhost:5173"
echo "- API Server: http://localhost:8000"
echo "- Database UI (Adminer): http://localhost:8082"
echo "- MinIO Console: http://localhost:9001"
echo "  Username: minioadmin"
echo "  Password: minioadmin"

echo -e "\nTo view logs, run:"
echo "docker compose -f compose-local.yaml logs -f"

echo -e "\nTo stop the services, run:"
echo "docker compose -f compose-local.yaml down" 