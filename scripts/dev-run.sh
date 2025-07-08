#!/bin/bash

# Development script for Mac ARM
# Supports both local build (compose-mac-dev.yaml) and remote image (compose-mac.yaml) workflows
# Usage: ./scripts/dev.sh [local|remote]
# Default: remote

set -e

MODE=${1:-remote}

if [ "$MODE" = "local" ]; then
  MAC_COMPOSE_FILE=compose-mac-dev.yaml
  echo "🛠  Using LOCAL build mode with ARM64 native builds (compose-local-dev.yaml + compose-mac-dev.yaml)"
  COMPOSE_FILES="-f compose-local-dev.yaml -f $MAC_COMPOSE_FILE"
else
  MAC_COMPOSE_FILE=compose-mac.yaml
  echo "🐳 Using REMOTE image mode with ARM64 optimization (compose-cpu.yaml + compose-mac.yaml)"
  COMPOSE_FILES="-f compose-cpu.yaml -f $MAC_COMPOSE_FILE"
fi

echo "🚀 Starting Data Extract in DEVELOPMENT mode..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose $COMPOSE_FILES down

# Start backend services (excluding web and server)
echo "🔧 Starting backend services..."
# Override Keycloak hostname for local development
export KC_HOSTNAME=localhost
export KC_HOSTNAME_PORT=8080
export KEYCLOAK_HOSTNAME=localhost
docker compose $COMPOSE_FILES up -d postgres redis minio segmentation-backend ocr-backend task

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Setup database for local development
echo "🔧 Setting up database for local development..."
# Create keycloak database if it doesn't exist
docker exec data-extract-postgres-1 psql -U postgres -c "CREATE DATABASE keycloak;" 2>/dev/null || echo "   Keycloak database already exists"

# Start Keycloak with proper localhost configuration and correct network name
echo "🔐 Starting Keycloak with localhost configuration..."
# Remove any existing keycloak container to avoid conflicts
docker stop keycloak 2>/dev/null || true
docker rm keycloak 2>/dev/null || true

# Start Keycloak with correct hostname and network name "keycloak" for backend connectivity
docker run -d --name keycloak --network data-extract_default -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_DB=postgres \
  -e KC_HOSTNAME_STRICT=false \
  -e KC_HOSTNAME_STRICT_HTTPS=false \
  -e KC_HTTP_ENABLED=true \
  -e KC_HOSTNAME=localhost \
  -e KC_HOSTNAME_PORT=8080 \
  -e KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak \
  -e KC_DB_USERNAME=postgres \
  -e KC_DB_PASSWORD=postgres \
  -e KC_HEALTH_ENABLED=true \
  -e KC_TRANSACTION_XA_ENABLED=false \
  quay.io/keycloak/keycloak:25.0.2 start-dev

echo "⏳ Waiting for Keycloak to start..."
sleep 20

# Build and start development backend
echo "🔨 Building development backend..."
docker compose $COMPOSE_FILES build server

echo "🚀 Starting development backend with proper configuration..."
# Remove any existing server container to avoid conflicts
docker stop data-extract-server-1 2>/dev/null || true
docker rm data-extract-server-1 2>/dev/null || true

# Start backend with all required environment variables for localhost development
docker run -d --name data-extract-server-1 --network data-extract_default -p 8000:8000 \
  -e AUTH__KEYCLOAK_URL=http://keycloak:8080 \
  -e AUTH__KEYCLOAK_REALM=orin \
  -e AWS__ACCESS_KEY=minioadmin \
  -e AWS__SECRET_KEY=minioadmin \
  -e AWS__ENDPOINT=http://minio:9000 \
  -e AWS__PRESIGNED_URL_ENDPOINT=http://localhost:9000 \
  -e AWS__REGION=us-east-1 \
  -e WORKER__S3_BUCKET=chunkr \
  -e PG__URL=postgresql://postgres:postgres@postgres:5432/chunkr \
  -e REDIS__URL=redis://redis:6379 \
  -e WORKER__GENERAL_OCR_URL=http://ocr-backend:8000 \
  -e WORKER__SEGMENTATION_URL=http://segmentation-backend:8000 \
  -e WORKER__SERVER_URL=http://server:8000 \
  -e LLM__MODELS_PATH=/app/models.yaml \
  --env-file .env \
  -v $(pwd)/models.yaml:/app/models.yaml:ro \
  ghcr.io/buildorin/orin-server:latest

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

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

# Kill any existing vite processes to ensure clean start
echo "🧹 Cleaning up any existing frontend processes..."
pkill -f vite 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Start frontend with logging
echo "🚀 Starting Vite dev server..."
npm run dev > dev.log 2>&1 &
FRONTEND_PID=$!

# Give the process a moment to start
sleep 3

# Check if the process is still running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend process died immediately, checking logs..."
    cat dev.log
    exit 1
fi

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Check if frontend is responding with retries
echo "⏳ Checking frontend availability..."
FRONTEND_PORT=""
RETRY_COUNT=0
MAX_RETRIES=6

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ -z "$FRONTEND_PORT" ]; do
    for port in 5173 5174 5175 5176 5177; do
        if curl -s http://localhost:$port/ > /dev/null 2>&1; then
            FRONTEND_PORT=$port
            break
        fi
    done
    
    if [ -z "$FRONTEND_PORT" ]; then
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Attempt $RETRY_COUNT/$MAX_RETRIES: Frontend not ready yet, waiting 5 seconds..."
        sleep 5
    fi
done

if [ -n "$FRONTEND_PORT" ]; then
    echo "✅ Frontend is running on http://localhost:$FRONTEND_PORT/"
else
    echo "❌ Frontend is not responding on any expected port after $MAX_RETRIES attempts."
    echo "   Check frontend logs: cat apps/web/dev.log"
    echo "   Or try running 'npm run dev' manually in apps/web/"
    
    # Show last few lines of log for debugging
    if [ -f "dev.log" ]; then
        echo "📋 Last few lines of frontend log:"
        tail -10 dev.log
    fi
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:$FRONTEND_PORT/"
echo "🔧 Backend:  http://localhost:8000/"
echo "🔐 Keycloak: http://localhost:8080/"
echo ""
echo "✅ All services configured for localhost development:"
echo "   - Keycloak: localhost URLs, proper network connectivity"
echo "   - Backend: CORS enabled, JWT validation working"
echo "   - Frontend: Environment variables set for localhost"
echo ""
echo "📋 Useful commands:"
echo "  - View backend logs: docker logs -f data-extract-server-1"
echo "  - View keycloak logs: docker logs -f keycloak"
echo "  - View frontend logs: tail -f apps/web/dev.log"
echo "  - Stop all services: docker stop \$(docker ps -q)"
echo "  - Restart everything: ./scripts/dev.sh [$MODE]"
echo ""
echo "🚀 You can now:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Create an account or sign in"
echo "   3. Upload and process documents"
echo ""
echo "Press Ctrl+C to stop the frontend (backend services will continue running)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping frontend..."
    kill $FRONTEND_PID 2>/dev/null || true
    echo "📝 Backend and other services are still running."
    echo "   Use 'docker stop \$(docker ps -q)' to stop all services."
    exit 0
}

# Set up signal trap for clean exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait $FRONTEND_PID 