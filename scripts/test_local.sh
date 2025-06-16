#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting local test environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install it first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
REDIS_PASSWORD=redis
EOL
fi

# Start the services
echo "Starting services..."
docker-compose -f compose.yaml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Test the API endpoints
echo "Testing API endpoints..."

# Test server health
SERVER_HEALTH=$(curl -s http://localhost:8000/health)
if [[ $SERVER_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}Server health check passed${NC}"
else
    echo -e "${RED}Server health check failed${NC}"
fi

# Test segmentation service
SEGMENTATION_HEALTH=$(curl -s http://localhost:8001/health)
if [[ $SEGMENTATION_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}Segmentation service health check passed${NC}"
else
    echo -e "${RED}Segmentation service health check failed${NC}"
fi

# Test OCR service
OCR_HEALTH=$(curl -s http://localhost:8002/health)
if [[ $OCR_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}OCR service health check passed${NC}"
else
    echo -e "${RED}OCR service health check failed${NC}"
fi

# Test web interface
WEB_HEALTH=$(curl -s http://localhost:5173/health)
if [[ $WEB_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}Web interface health check passed${NC}"
else
    echo -e "${RED}Web interface health check failed${NC}"
fi

echo "Local test environment is ready!"
echo "You can access the services at:"
echo "- Web Interface: http://localhost:5173"
echo "- API Server: http://localhost:8000"
echo "- Segmentation Service: http://localhost:8001"
echo "- OCR Service: http://localhost:8002"
echo "- Adminer (Database UI): http://localhost:8082"
echo "- MinIO Console: http://localhost:9001"

# Keep the script running
echo "Press Ctrl+C to stop the services..."
docker-compose -f compose.yaml logs -f 