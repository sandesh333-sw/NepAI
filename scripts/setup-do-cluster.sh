#!/bin/bash

# DigitalOcean Kubernetes Cluster Setup Script
# This script helps you create and configure a DOKS cluster

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

print_status "🚀 DigitalOcean Kubernetes Cluster Setup"
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    print_error "doctl is not installed. Please install it first:"
    echo "https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if doctl is authenticated
if ! doctl account get &> /dev/null; then
    print_error "doctl is not authenticated. Please run:"
    echo "doctl auth init"
    exit 1
fi

print_success "doctl is installed and authenticated"

# Create cluster
print_status "Creating DigitalOcean Kubernetes cluster..."

CLUSTER_NAME="nepai-cluster"
REGION="nyc1"  # Change to your preferred region
NODE_SIZE="s-2vcpu-2gb"  # 2 vCPU, 2GB RAM
NODE_COUNT=2

print_status "Cluster configuration:"
echo "  Name: $CLUSTER_NAME"
echo "  Region: $REGION"
echo "  Node Size: $NODE_SIZE"
echo "  Node Count: $NODE_COUNT"
echo ""

read -p "Do you want to create the cluster with these settings? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cluster creation cancelled"
    exit 1
fi

print_status "Creating cluster... This may take a few minutes..."
doctl kubernetes cluster create $CLUSTER_NAME \
    --region $REGION \
    --size $NODE_SIZE \
    --count $NODE_COUNT \
    --auto-upgrade \
    --surge-upgrade \
    --maintenance-window "sunday=04:00"

print_success "Cluster created successfully!"

# Get cluster ID
CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name --no-header | grep $CLUSTER_NAME | awk '{print $1}')
print_status "Cluster ID: $CLUSTER_ID"

# Save kubeconfig
print_status "Saving kubeconfig..."
doctl kubernetes cluster kubeconfig save $CLUSTER_ID

# Verify connection
print_status "Verifying cluster connection..."
kubectl cluster-info

print_success "✅ Cluster setup complete!"
print_status "Next steps:"
echo "1. Run: ./setup-registry.sh"
echo "2. Run: ./deploy-to-do.sh"
echo ""
print_status "Your cluster is ready for deployment! 🎉"
