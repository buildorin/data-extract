#!/bin/bash

# Set your registry and tag here
REGISTRY=yourrepo
TAG=customtag

set -e

echo "Building and pushing custom images to $REGISTRY with tag $TAG..."

# Build and push server

echo "Building server..."
docker build -t $REGISTRY/server:$TAG -f docker/server/Dockerfile .
echo "Pushing server..."
docker push $REGISTRY/server:$TAG

# Build and push task
echo "Building task..."
docker build -t $REGISTRY/task:$TAG -f docker/task/Dockerfile .
echo "Pushing task..."
docker push $REGISTRY/task:$TAG

# Build and push web
echo "Building web..."
docker build -t $REGISTRY/web:$TAG -f docker/web/Dockerfile ./docker/web
echo "Pushing web..."
docker push $REGISTRY/web:$TAG

# Build and push segmentation-backend
echo "Building segmentation-backend..."
docker build -t $REGISTRY/segmentation-yolo-cpu:$TAG -f docker/segmentation/Dockerfile .
echo "Pushing segmentation-backend..."
docker push $REGISTRY/segmentation-yolo-cpu:$TAG

# Build and push ocr-backend
echo "Building ocr-backend..."
docker build -t $REGISTRY/doctr-small:$TAG -f docker/doctr/Dockerfile .
echo "Pushing ocr-backend..."
docker push $REGISTRY/doctr-small:$TAG

# Build and push ocr (nginx proxy)
echo "Building ocr (nginx proxy)..."
docker build -t $REGISTRY/ocr:$TAG -f docker/ocr/Dockerfile ./docker/ocr
echo "Pushing ocr..."
docker push $REGISTRY/ocr:$TAG

# Build and push segmentation (nginx proxy)
echo "Building segmentation (nginx proxy)..."
docker build -t $REGISTRY/segmentation:$TAG -f docker/segmentation/Dockerfile ./docker/segmentation
echo "Pushing segmentation..."
docker push $REGISTRY/segmentation:$TAG

echo "All images built and pushed!" 