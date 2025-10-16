#!/bin/bash

# DigitalOcean Kubernetes Deployment Script
# This script deploys NepAI to DigitalOcean Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Deploying NepAI to DigitalOcean Kubernetes"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if we can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    print_status "Make sure you've run: doctl kubernetes cluster kubeconfig save <cluster-id>"
    exit 1
fi

print_status "Connected to Kubernetes cluster: $(kubectl config current-context)"

# Check if registry is accessible
REGISTRY_NAME="nepai-registry"
print_status "Checking container registry access..."
if ! doctl registry get $REGISTRY_NAME &> /dev/null; then
    print_error "Container registry '$REGISTRY_NAME' not found."
    print_status "Please run: ./setup-registry.sh"
    exit 1
fi

print_success "Container registry is accessible"

# Update secrets with your actual values
print_warning "⚠️  IMPORTANT: Please update k8s/secrets.yaml with your actual values:"
print_warning "1. MongoDB URI (base64 encoded)"
print_warning "2. OpenAI API Key (base64 encoded)"
print_warning "3. API URL (your domain)"
echo ""

read -p "Have you updated the secrets.yaml file? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please update secrets.yaml and run this script again"
    exit 1
fi

# Deploy to Kubernetes
print_status "Deploying to DigitalOcean Kubernetes..."

cd k8s

# Create namespace
print_status "Creating production namespace..."
kubectl apply -f namespace.yaml

# Apply secrets
print_status "Applying secrets and configuration..."
kubectl apply -f secrets.yaml

# Apply services
print_status "Applying services..."
kubectl apply -f services.yaml

# Apply deployments
print_status "Applying backend deployment..."
kubectl apply -f backend-deployment.yaml

print_status "Applying frontend deployment..."
kubectl apply -f frontend-deployment.yaml

# Apply HPA
print_status "Applying Horizontal Pod Autoscaler..."
kubectl apply -f hpa.yaml

# Apply ingress
print_status "Applying ingress..."
kubectl apply -f ingress.yaml

# Wait for deployments to be ready
print_status "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/nepai-backend -n nepai-prod
kubectl wait --for=condition=available --timeout=600s deployment/nepai-frontend -n nepai-prod

# Show deployment status
print_status "Deployment Status:"
echo ""
print_status "Pods:"
kubectl get pods -n nepai-prod
echo ""
print_status "Services:"
kubectl get services -n nepai-prod
echo ""
print_status "Ingress:"
kubectl get ingress -n nepai-prod
echo ""

# Get ingress IP
INGRESS_IP=$(kubectl get ingress nepai-ingress -n nepai-prod -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

if [ "$INGRESS_IP" != "pending" ] && [ -n "$INGRESS_IP" ]; then
    print_success "🎉 NepAI deployment completed successfully!"
    print_status "Your application is accessible at:"
    echo "  🌐 IP Address: http://$INGRESS_IP"
    echo "  🔒 HTTPS: https://nepai.yourdomain.com (when DNS is configured)"
    echo ""
    print_warning "Next steps:"
    print_warning "1. Update your DNS A record to point to: $INGRESS_IP"
    print_warning "2. Replace 'nepai.yourdomain.com' with your actual domain in ingress.yaml"
    print_warning "3. Wait for SSL certificate to be issued (may take a few minutes)"
else
    print_warning "Deployment completed, but ingress IP is still pending..."
    print_status "Run this command to check ingress status:"
    echo "kubectl get ingress nepai-ingress -n nepai-prod -w"
fi

print_status "To view logs:"
echo "kubectl logs -f deployment/nepai-backend -n nepai-prod"
echo "kubectl logs -f deployment/nepai-frontend -n nepai-prod"

cd ..
print_success "✅ Deployment script completed!"
