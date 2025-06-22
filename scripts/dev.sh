#!/bin/bash

# Development script for Mac ARM
# Supports both local build (compose-mac-dev.yaml) and remote image (compose-mac.yaml) workflows
# Usage: ./scripts/dev.sh [local|remote]
# Default: remote

set -e

MODE=${1:-remote}

if [ "$MODE" = "local" ]; then
  MAC_COMPOSE_FILE=compose-mac-dev.yaml
  echo "🛠  Using LOCAL build mode (compose-mac-dev.yaml)"
else
  MAC_COMPOSE_FILE=compose-mac.yaml
  echo "🐳 Using REMOTE image mode (compose-mac.yaml)"
fi

COMPOSE_FILES="-f compose-cpu.yaml -f $MAC_COMPOSE_FILE"

echo "🚀 Starting Data Extract in DEVELOPMENT mode..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose $COMPOSE_FILES down

# Start backend services (excluding web and server)
echo "🔧 Starting backend services..."
docker compose $COMPOSE_FILES up -d postgres redis minio keycloak segmentation segmentation-backend ocr ocr-backend task

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Build and start development backend
echo "🔨 Building development backend..."
docker compose $COMPOSE_FILES build server

echo "🚀 Starting development backend..."
docker compose $COMPOSE_FILES up -d server

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 15

# Check if backend is responding
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend is not responding. Check logs with: docker logs data-extract-server-1"
fi

# Start development frontend
echo "🎨 Starting development frontend..."
cd apps/web
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Check if frontend is responding
echo "⏳ Checking frontend availability..."
FRONTEND_PORT=""
for port in 5173 5174 5175 5176 5177; do
    if curl -s http://localhost:$port/ > /dev/null 2>&1; then
        FRONTEND_PORT=$port
        break
    fi
done

if [ -n "$FRONTEND_PORT" ]; then
    echo "✅ Frontend is running on http://localhost:$FRONTEND_PORT/"
else
    echo "❌ Frontend is not responding on any expected port."
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:$FRONTEND_PORT/"
echo "🔧 Backend:  http://localhost:8000/"
echo "🔐 Keycloak: http://localhost:8080/"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker logs -f data-extract-server-1"
echo "  - Stop all:  docker compose $COMPOSE_FILES down"
echo "  - Restart:   ./scripts/dev.sh [$MODE]"
echo ""
echo "Press Ctrl+C to stop the frontend (backend will continue running)"
echo ""

# Wait for user to stop
wait $FRONTEND_PID 