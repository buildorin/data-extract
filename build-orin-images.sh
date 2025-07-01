#!/bin/bash

# Build and Push Orin Docker Images
# This script builds custom Orin images and pushes them to a registry

set -e

echo "🐳 Building Orin Docker Images..."

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
REGISTRY=${REGISTRY:-"ghcr.io/buildorin"}
TAG=${TAG:-"latest"}
VERSION=${VERSION:-$(git rev-parse --short HEAD)}

# Get user input
read -p "Enter your GitHub Container Registry (default: $REGISTRY): " INPUT_REGISTRY
REGISTRY=${INPUT_REGISTRY:-$REGISTRY}

read -p "Enter image tag (default: $TAG): " INPUT_TAG
TAG=${INPUT_TAG:-$TAG}

print_status "Registry: $REGISTRY"
print_status "Tag: $TAG"
print_status "Version: $VERSION"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Login to GitHub Container Registry
print_step "Setting up GitHub Container Registry authentication..."
echo ""
print_warning "You need a GitHub Personal Access Token with 'write:packages' permission"
echo "Create one at: https://github.com/settings/tokens"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME
read -s -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

# Login to GitHub Container Registry
print_step "Logging into GitHub Container Registry..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

if [ $? -ne 0 ]; then
    print_error "Failed to login to GitHub Container Registry. Please check your credentials."
    exit 1
fi

print_status "✅ Successfully logged into GitHub Container Registry"

# Build and push server image
print_step "Building server image..."
docker build --platform linux/amd64 -t $REGISTRY/orin-server:$TAG -t $REGISTRY/orin-server:$VERSION -f docker/server/Dockerfile .
docker push $REGISTRY/orin-server:$TAG
docker push $REGISTRY/orin-server:$VERSION
print_status "✅ Server image built and pushed"

# Build and push task image
print_step "Building task image..."
docker build --platform linux/amd64 -t $REGISTRY/orin-task:$TAG -t $REGISTRY/orin-task:$VERSION -f docker/task/Dockerfile .
docker push $REGISTRY/orin-task:$TAG
docker push $REGISTRY/orin-task:$VERSION
print_status "✅ Task image built and pushed"

# Build and push web image
print_step "Building web image..."
docker build --platform linux/amd64 -t $REGISTRY/orin-web:$TAG -t $REGISTRY/orin-web:$VERSION -f docker/web/Dockerfile .
docker push $REGISTRY/orin-web:$TAG
docker push $REGISTRY/orin-web:$VERSION
print_status "✅ Web image built and pushed"

# Create production compose file with Orin images
print_step "Creating production compose file..."
cat > compose-production-orin.yaml << 'EOF'
version: '3.8'

services:
  # Main API Server - Orin Build
  server:
    image: ghcr.io/buildorin/orin-server:latest
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - minio
    env_file:
      - .env
    restart: always
    volumes:
      - ./models.yaml:/app/models.yaml:ro
    environment:
      - AUTH__KEYCLOAK_URL=https://auth.app.useorin.com
      - AUTH__KEYCLOAK_REALM=orin
      - AWS__ENDPOINT=http://minio:9000
      - AWS__PRESIGNED_URL_ENDPOINT=https://s3.app.useorin.com
      - AWS__REGION=us-east-1
      - LLM__MODELS_PATH=/app/models.yaml
      - PG__URL=postgresql://postgres:postgres@postgres:5432/chunkr
      - REDIS__URL=redis://redis:6379
      - WORKER__GENERAL_OCR_URL=http://ocr-backend:8000
      - WORKER__SEGMENTATION_URL=http://segmentation-backend:8000
      - WORKER__SERVER_URL=http://server:8000

  # Task Workers - Orin Build
  task:
    image: ghcr.io/buildorin/orin-task:latest
    depends_on:
      - postgres
      - redis
      - minio
    env_file:
      - .env
    restart: always
    volumes:
      - ./models.yaml:/app/models.yaml:ro
    environment:
      - AWS__ACCESS_KEY=minioadmin
      - AWS__SECRET_KEY=minioadmin
      - AWS__ENDPOINT=http://minio:9000
      - AWS__REGION=us-east-1
      - WORKER__S3_BUCKET=chunkr
      - WORKER__SERVER_URL=http://server:8000
      - WORKER__SEGMENTATION_URL=http://segmentation-backend:8000
      - WORKER__GENERAL_OCR_URL=http://ocr-backend:8000
      - PG__URL=postgresql://postgres:postgres@postgres:5432/chunkr
      - REDIS__URL=redis://redis:6379
    deploy:
      replicas: 3

  # Web Frontend - Orin Build
  web:
    image: ghcr.io/buildorin/orin-web:latest
    platform: linux/amd64
    ports:
      - "5173:8000"
    env_file:
      - .env
    restart: always
    environment:
      - VITE_API_URL=https://api.app.useorin.com
      - VITE_DOCS_URL=https://docs.useorin.com
      - VITE_KEYCLOAK_CLIENT_ID=orin
      - VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI=https://app.useorin.com
      - VITE_KEYCLOAK_REALM=orin
      - VITE_KEYCLOAK_REDIRECT_URI=https://app.useorin.com
      - VITE_KEYCLOAK_URL=https://auth.app.useorin.com

  # Segmentation Service - Use official Chunkr image
  segmentation-backend:
    image: luminainc/segmentation:1.4.2
    expose:
      - "8000"
    volumes:
      - /dev/shm:/dev/shm
    environment:
      - MAX_BATCH_SIZE=4
      - BATCH_WAIT_TIME=0.2
      - OVERLAP_THRESHOLD=0.025
      - SCORE_THRESHOLD=0.2
      - OMP_NUM_THREADS=8
      - MKL_NUM_THREADS=8
      - NUMEXPR_NUM_THREADS=8
      - OPENBLAS_NUM_THREADS=8
      - VECLIB_MAXIMUM_THREADS=8
    restart: always
    deploy:
      replicas: 1

  # OCR Service - Use official Chunkr image
  ocr-backend:
    image: luminainc/doctr:1.20.1
    expose:
      - "8000"
    volumes:
      - /dev/shm:/dev/shm
    environment:
      - OCR_BATCH_WAIT_TIME=0.1
      - OCR_MAX_BATCH_SIZE=10
      - OMP_NUM_THREADS=8
      - MKL_NUM_THREADS=8
      - NUMEXPR_NUM_THREADS=8
      - OPENBLAS_NUM_THREADS=8
      - VECLIB_MAXIMUM_THREADS=8
    restart: always
    deploy:
      replicas: 1

  # Database
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chunkr
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U postgres" ]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  # Redis Cache
  redis:
    image: redis:latest
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: [ "CMD", "redis-cli", "ping" ]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  # S3 Storage
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:9000/minio/health/live" ]
      interval: 30s
      timeout: 20s
      retries: 1
    restart: always

  # MinIO Initialization
  minio-init:
    image: minio/mc
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        /usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin &&
        /usr/bin/mc mb myminio/chunkr --ignore-existing &&
        /usr/bin/mc anonymous set public myminio/chunkr
      "
    restart: "no"

  # Authentication
  keycloak:
    image: quay.io/keycloak/keycloak:25.0.2
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_PROXY=edge
      - KC_DB=postgres
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME_STRICT_HTTPS=false
      - KC_HTTP_ENABLED=true
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=postgres
      - KC_DB_PASSWORD=postgres
      - KC_HEALTH_ENABLED=true
      - KC_TRANSACTION_XA_ENABLED=false
    volumes:
      - ./realm-export.json:/opt/keycloak/data/import/realm-export.json
    command: [ "start-dev", "--import-realm" ]
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:8080/health" ]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 600s
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

volumes:
  postgres_data:
  redis_data:
  minio_data:
EOF

print_status "✅ Production compose file created: compose-production-orin.yaml"

# Create CPU version
cat > compose-production-orin-cpu.yaml << 'EOF'
version: '3.8'

services:
  # Main API Server - Orin Build
  server:
    image: ghcr.io/buildorin/orin-server:latest
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - minio
    env_file:
      - .env
    restart: always
    volumes:
      - ./models.yaml:/app/models.yaml:ro
    environment:
      - AUTH__KEYCLOAK_URL=https://auth.app.useorin.com
      - AUTH__KEYCLOAK_REALM=orin
      - AWS__ENDPOINT=http://minio:9000
      - AWS__PRESIGNED_URL_ENDPOINT=https://s3.app.useorin.com
      - AWS__REGION=us-east-1
      - LLM__MODELS_PATH=/app/models.yaml
      - PG__URL=postgresql://postgres:postgres@postgres:5432/chunkr
      - REDIS__URL=redis://redis:6379
      - WORKER__GENERAL_OCR_URL=http://ocr-backend:8000
      - WORKER__SEGMENTATION_URL=http://segmentation-backend:8000
      - WORKER__SERVER_URL=http://server:8000

  # Task Workers - Orin Build
  task:
    image: ghcr.io/buildorin/orin-task:latest
    depends_on:
      - postgres
      - redis
      - minio
    env_file:
      - .env
    restart: always
    volumes:
      - ./models.yaml:/app/models.yaml:ro
    environment:
      - AWS__ACCESS_KEY=minioadmin
      - AWS__SECRET_KEY=minioadmin
      - AWS__ENDPOINT=http://minio:9000
      - AWS__REGION=us-east-1
      - WORKER__S3_BUCKET=chunkr
      - WORKER__SERVER_URL=http://server:8000
      - WORKER__SEGMENTATION_URL=http://segmentation-backend:8000
      - WORKER__GENERAL_OCR_URL=http://ocr-backend:8000
      - PG__URL=postgresql://postgres:postgres@postgres:5432/chunkr
      - REDIS__URL=redis://redis:6379
    deploy:
      replicas: 2

  # Web Frontend - Orin Build
  web:
    image: ghcr.io/buildorin/orin-web:latest
    platform: linux/amd64
    ports:
      - "5173:8000"
    env_file:
      - .env
    restart: always
    environment:
      - VITE_API_URL=https://api.app.useorin.com
      - VITE_DOCS_URL=https://docs.useorin.com
      - VITE_KEYCLOAK_CLIENT_ID=orin
      - VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI=https://app.useorin.com
      - VITE_KEYCLOAK_REALM=orin
      - VITE_KEYCLOAK_REDIRECT_URI=https://app.useorin.com
      - VITE_KEYCLOAK_URL=https://auth.app.useorin.com

  # Segmentation Service - CPU Optimized
  segmentation-backend:
    image: luminainc/segmentation:1.4.2
    expose:
      - "8000"
    volumes:
      - /dev/shm:/dev/shm
    environment:
      - MAX_BATCH_SIZE=2
      - BATCH_WAIT_TIME=0.5
      - OVERLAP_THRESHOLD=0.025
      - SCORE_THRESHOLD=0.2
      - OMP_NUM_THREADS=4
      - MKL_NUM_THREADS=4
      - NUMEXPR_NUM_THREADS=4
      - OPENBLAS_NUM_THREADS=4
      - VECLIB_MAXIMUM_THREADS=4
    restart: always
    deploy:
      replicas: 1

  # OCR Service - CPU Optimized
  ocr-backend:
    image: luminainc/doctr:1.20.1
    expose:
      - "8000"
    volumes:
      - /dev/shm:/dev/shm
    environment:
      - OCR_BATCH_WAIT_TIME=0.2
      - OCR_MAX_BATCH_SIZE=5
      - OMP_NUM_THREADS=4
      - MKL_NUM_THREADS=4
      - NUMEXPR_NUM_THREADS=4
      - OPENBLAS_NUM_THREADS=4
      - VECLIB_MAXIMUM_THREADS=4
    restart: always
    deploy:
      replicas: 1

  # Database
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chunkr
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U postgres" ]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  # Redis Cache
  redis:
    image: redis:latest
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: [ "CMD", "redis-cli", "ping" ]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  # S3 Storage
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:9000/minio/health/live" ]
      interval: 30s
      timeout: 20s
      retries: 1
    restart: always

  # MinIO Initialization
  minio-init:
    image: minio/mc
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        /usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin &&
        /usr/bin/mc mb myminio/chunkr --ignore-existing &&
        /usr/bin/mc anonymous set public myminio/chunkr
      "
    restart: "no"

  # Authentication
  keycloak:
    image: quay.io/keycloak/keycloak:25.0.2
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_PROXY=edge
      - KC_DB=postgres
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME_STRICT_HTTPS=false
      - KC_HTTP_ENABLED=true
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=postgres
      - KC_DB_PASSWORD=postgres
      - KC_HEALTH_ENABLED=true
      - KC_TRANSACTION_XA_ENABLED=false
    volumes:
      - ./realm-export.json:/opt/keycloak/data/import/realm-export.json
    command: [ "start-dev", "--import-realm" ]
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:8080/health" ]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 600s
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

volumes:
  postgres_data:
  redis_data:
  minio_data:
EOF

print_status "✅ CPU compose file created: compose-production-orin-cpu.yaml"

print_status "🎉 All Orin images built and pushed successfully!"
echo ""
print_warning "Next steps:"
echo "1. Upload the new compose files to your production server:"
echo "   scp compose-production-orin.yaml root@your-vps-ip:/root/"
echo "   scp compose-production-orin-cpu.yaml root@your-vps-ip:/root/"
echo ""
echo "2. Update your production deployment to use these files"
echo "3. Your images are now available at: $REGISTRY/orin-*:$TAG"
echo ""
print_status "Images built:"
echo "- $REGISTRY/orin-server:$TAG"
echo "- $REGISTRY/orin-task:$TAG"
echo "- $REGISTRY/orin-web:$TAG" 