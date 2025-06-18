#!/bin/bash

# Production script for Mac ARM
# This uses production Docker images

set -e

echo "🚀 Starting Data Extract in PRODUCTION mode..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose -f compose-cpu.yaml -f compose-mac.yaml down

# Start all services including production web and server
echo "🔧 Starting all services (production mode)..."
docker compose -f compose-cpu.yaml -f compose-mac.yaml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are responding
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend is not responding. Check logs with: docker logs data-extract-server-1"
fi

if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5173/"
else
    echo "❌ Frontend is not responding. Check logs with: docker logs data-extract-web-1"
fi

echo ""
echo "🎉 Production environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:5173/"
echo "🔧 Backend:  http://localhost:8000/"
echo "🔐 Keycloak: http://localhost:8080/"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker logs -f data-extract-server-1"
echo "  - Stop all:  docker compose -f compose-cpu.yaml -f compose-mac.yaml down"
echo "  - Restart:   ./scripts/prod.sh"
echo ""
echo "⚠️  NOTE: This is PRODUCTION mode using Docker images."
echo "   For development, use: ./scripts/dev.sh"
echo "" 