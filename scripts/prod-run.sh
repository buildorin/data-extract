#!/bin/bash

# Complete production deployment script 
# Combines image building and deployment for GKE cluster
# Similar to dev-run.sh but for production

set -e

echo "🚀 Production Deployment Pipeline"
echo "================================="
echo "This script will:"
echo "1. Build production images for webapp and server"
echo "2. Push images to ghcr.io/buildorin registry"
echo "3. Deploy to GKE cluster using Helm"
echo "================================="

# Configuration
NAMESPACE="chunkr"
RELEASE_NAME="chunkr"

# Get version
if [ -f ".release-please-manifest.json" ]; then
    VERSION=$(grep -o '"\.": "[^"]*"' .release-please-manifest.json | cut -d'"' -f4)
else
    VERSION=$(date +%Y%m%d-%H%M%S)
fi

echo "Version: $VERSION"
echo "Registry: ghcr.io/buildorin"
echo "Namespace: $NAMESPACE"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check Helm
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed or not in PATH"
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Please ensure kubectl is configured for your GKE cluster"
    exit 1
fi

CURRENT_CONTEXT=$(kubectl config current-context)
echo "✅ Connected to cluster: $CURRENT_CONTEXT"

# Check Docker registry login
echo "🔐 Checking Docker registry access..."
if ! docker info | grep -q "Username"; then
    echo "❌ Not logged into Docker registry"
    echo "Please run: docker login ghcr.io"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Ask for confirmation
read -p "🚨 Deploy to production cluster '$CURRENT_CONTEXT'? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🏗️  Step 1: Building production images..."
echo "======================================="

# Function to build and push image
build_and_push() {
    local service=$1
    local dockerfile_path=$2
    local image_name="ghcr.io/buildorin/orin-${service}"
    
    echo "🔨 Building ${service} image..."
    echo "Image: ${image_name}:${VERSION}"
    
    # Build for linux/amd64 (GKE production)
    docker build \
        --platform linux/amd64 \
        --no-cache \
        -t "${image_name}:${VERSION}" \
        -t "${image_name}:latest" \
        -t "${image_name}:${GIT_SHA}" \
        -f "${dockerfile_path}" \
        .
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful for ${service}"
        
        # Push all tags
        echo "📤 Pushing ${service} images..."
        docker push "${image_name}:${VERSION}"
        docker push "${image_name}:latest"
        docker push "${image_name}:${GIT_SHA}"
        
        echo "✅ Successfully pushed ${service} images"
    else
        echo "❌ Build failed for ${service}"
        exit 1
    fi
    
    echo ""
}

# Get git SHA
GIT_SHA=$(git rev-parse --short HEAD)

# Build webapp image
echo "🌐 Building webapp image..."
build_and_push "web" "docker/web/Dockerfile"

# Build server image
echo "🔧 Building server image..."
build_and_push "server" "docker/server/Dockerfile"

echo ""
echo "🚀 Step 2: Deploying to GKE cluster..."
echo "======================================"

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "📁 Creating namespace $NAMESPACE..."
    kubectl create namespace $NAMESPACE
else
    echo "✅ Namespace $NAMESPACE already exists"
fi

# Check if secrets exist
echo "🔐 Checking secrets..."
if ! kubectl get secret orin-secret -n $NAMESPACE &> /dev/null; then
    echo "❌ Secret 'orin-secret' not found in namespace $NAMESPACE"
    echo "Please create the secret first. Check kube/README.md for instructions."
    exit 1
fi

# Check if LLM models configmap exists
if ! kubectl get configmap llm-models-configmap -n $NAMESPACE &> /dev/null; then
    echo "❌ ConfigMap 'llm-models-configmap' not found in namespace $NAMESPACE"
    echo "Please create the configmap first. Check kube/README.md for instructions."
    exit 1
fi

echo "✅ Required secrets and configmaps found"

# Deploy to cluster
echo "🚀 Deploying with images:"
echo "  Web: ghcr.io/buildorin/orin-web:$VERSION"
echo "  Server: ghcr.io/buildorin/orin-server:$VERSION"

CHART_PATH="./kube/charts/chunkr"
VALUES_FILE="./kube/charts/chunkr/values.yaml"
INFRASTRUCTURE_FILE="./kube/charts/chunkr/infrastructure.yaml"
CURRENT_VALUES_FILE="./current-values.yaml"

helm upgrade --install $RELEASE_NAME $CHART_PATH \
    --namespace $NAMESPACE \
    --values $VALUES_FILE \
    --values $INFRASTRUCTURE_FILE \
    --values $CURRENT_VALUES_FILE \
    --set "services.web.image.tag=$VERSION" \
    --set "services.server.image.tag=$VERSION" \
    --set "services.task.image.tag=$VERSION" \
    --wait \
    --timeout 10m

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Production deployment completed successfully!"
    echo ""
    echo "📊 Quick Status Check:"
    kubectl get pods -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE_NAME
    
    echo ""
    echo "🔗 Access your application:"
    kubectl get ingress -n $NAMESPACE
    
    echo ""
    echo "📋 Management Commands:"
    echo "  View all resources: kubectl get all -n $NAMESPACE"
    echo "  View server logs:   kubectl logs -f deployment/$RELEASE_NAME-server -n $NAMESPACE"
    echo "  View web logs:      kubectl logs -f deployment/$RELEASE_NAME-web -n $NAMESPACE"
    echo "  Scale deployment:   kubectl scale deployment/$RELEASE_NAME-server --replicas=3 -n $NAMESPACE"
    echo "  Delete deployment:  helm uninstall $RELEASE_NAME -n $NAMESPACE"
    echo ""
    echo "✅ Production deployment is ready!"
else
    echo "❌ Deployment failed"
    exit 1
fi