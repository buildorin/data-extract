#!/bin/bash

# Deploy Orin following official Chunkr repo pattern
# Uses orin-secret consistently throughout

set -e

NAMESPACE="orin"
RELEASE_NAME="orin"

echo "🚀 Deploying Orin with official Chunkr pattern..."

# Check if namespace exists, create if not
if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    echo "📦 Creating namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE
fi

# Check required secrets
echo "🔍 Checking secrets..."
if ! kubectl get secret orin-secret -n $NAMESPACE >/dev/null 2>&1; then
    echo "❌ Secret 'orin-secret' not found. Please create it first."
    exit 1
fi

if ! kubectl get secret ghcr-secret -n $NAMESPACE >/dev/null 2>&1; then
    echo "❌ Secret 'ghcr-secret' not found. Please create it first."
    exit 1
fi

# Test GHCR authentication
echo "🔍 Testing GHCR authentication..."
if ! kubectl run test-ghcr --image=ghcr.io/buildorin/orin-server:latest --restart=Never --namespace=$NAMESPACE --timeout=30s --rm=true >/dev/null 2>&1; then
    echo "⚠️  GHCR authentication failed. Please ensure your token has 'read:packages' permission."
    echo "   You can update the secret manually or check your GitHub token permissions."
    echo "   Required permissions: read:packages"
    exit 1
fi



# Check required configmaps
echo "🔍 Checking configmaps..."
REQUIRED_CONFIGMAPS=("llm-models-configmap" "keycloak-config" "keycloak-realm-config" "minio-init-config")

for cm in "${REQUIRED_CONFIGMAPS[@]}"; do
    if ! kubectl get configmap $cm -n $NAMESPACE >/dev/null 2>&1; then
        echo "❌ ConfigMap '$cm' not found. Please create it first."
        exit 1
    fi
done

echo "✅ All prerequisites are in place!"

# Deploy using official Chunkr pattern with Orin customizations
echo "📦 Deploying with Helm..."
echo "Using: values.yaml + infrastructure.yaml (Orin customizations included)"

helm upgrade --install $RELEASE_NAME ./kube/charts/chunkr \
    --namespace $NAMESPACE \
    --values ./kube/charts/chunkr/values.yaml \
    --values ./kube/charts/chunkr/infrastructure.yaml \
    --set services.postgres.enabled=true \
    --set services.web.imagePullSecrets[0].name=ghcr-secret \
    --set services.server.imagePullSecrets[0].name=ghcr-secret \
    --set services.task.imagePullSecrets[0].name=ghcr-secret \
    --set services.ocr.imagePullSecrets[0].name=ghcr-secret \
    --set services.segmentation.imagePullSecrets[0].name=ghcr-secret \
    --wait \
    --timeout=10m

echo "✅ Deployment completed!"
echo ""
echo "🔍 Checking deployment status..."
kubectl get pods -n $NAMESPACE

echo ""
echo "🌐 Services will be available at:"
echo "   - Web UI: https://app.useorin.com"
echo "   - API: https://api.app.useorin.com"
echo "   - Keycloak: https://auth.app.useorin.com"
echo "   - MinIO: https://s3.app.useorin.com"
echo ""
echo "📊 Monitor deployment with:"
echo "   kubectl get pods -n $NAMESPACE -w"
echo ""
echo "🔧 Troubleshoot with:"
echo "   kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=chunkr" 