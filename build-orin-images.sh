#!/bin/bash

# Build Orin images with tracking to prevent regressions
# This script maintains consistency with your working build process

set -e

REGISTRY="ghcr.io/buildorin"
TAG="prod"

echo "🔨 Building Orin images with tracking..."

# Check if we're in the right directory
if [ ! -f "docker/web/Dockerfile" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Building images for registry: $REGISTRY"
echo "🏷️  Using tag: $TAG"

# Build web image (frontend)
echo "🌐 Building web image..."
docker build -f docker/web/Dockerfile \
    --platform linux/amd64 \
    -t $REGISTRY/orin-web:$TAG \
    -t $REGISTRY/orin-web:latest \
    .

echo "✅ Web image built: $REGISTRY/orin-web:$TAG"

# Build server image (backend)
echo "🔧 Building server image..."
docker build -f docker/server/Dockerfile \
    --platform linux/amd64 \
    -t $REGISTRY/orin-server:$TAG \
    -t $REGISTRY/orin-server:latest \
    .

echo "✅ Server image built: $REGISTRY/orin-server:$TAG"

# Build task image
echo "⚙️  Building task image..."
docker build -f docker/task/Dockerfile \
    --platform linux/amd64 \
    -t $REGISTRY/orin-task:$TAG \
    -t $REGISTRY/orin-task:latest \
    .

echo "✅ Task image built: $REGISTRY/orin-task:$TAG"

# Build OCR image
echo "📄 Building OCR image..."
docker build -f docker/ocr/Dockerfile \
    --platform linux/amd64 \
    -t $REGISTRY/orin-ocr:$TAG \
    -t $REGISTRY/orin-ocr:latest \
    .

echo "✅ OCR image built: $REGISTRY/orin-ocr:$TAG"

# Build segmentation image
echo "✂️  Building segmentation image..."
docker build -f docker/segmentation/Dockerfile \
    --platform linux/amd64 \
    -t $REGISTRY/orin-segmentation:$TAG \
    -t $REGISTRY/orin-segmentation:latest \
    .

echo "✅ Segmentation image built: $REGISTRY/orin-segmentation:$TAG"

echo ""
echo "🚀 Pushing images to registry..."

# Push all images
docker push $REGISTRY/orin-web:$TAG
docker push $REGISTRY/orin-web:latest
docker push $REGISTRY/orin-server:$TAG
docker push $REGISTRY/orin-server:latest
docker push $REGISTRY/orin-task:$TAG
docker push $REGISTRY/orin-task:latest
docker push $REGISTRY/orin-ocr:$TAG
docker push $REGISTRY/orin-ocr:latest
docker push $REGISTRY/orin-segmentation:$TAG
docker push $REGISTRY/orin-segmentation:latest

echo ""
echo "✅ All images built and pushed successfully!"
echo ""
echo "📋 Built images:"
echo "   - $REGISTRY/orin-web:$TAG"
echo "   - $REGISTRY/orin-server:$TAG"
echo "   - $REGISTRY/orin-task:$TAG"
echo "   - $REGISTRY/orin-ocr:$TAG"
echo "   - $REGISTRY/orin-segmentation:$TAG"
echo ""
echo "🚀 You can now deploy with: ./deploy-orin-tracked.sh" 