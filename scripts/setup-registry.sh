#!/bin/bash

# DigitalOcean Container Registry Setup Script
# This script sets up DO Container Registry for your images

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

print_status "🐳 DigitalOcean Container Registry Setup"
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    print_error "doctl is not installed. Please install it first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Registry configuration
REGISTRY_NAME="nepai-registry"
REGISTRY_REGION="nyc1"  # Change to your preferred region

print_status "Registry configuration:"
echo "  Name: $REGISTRY_NAME"
echo "  Region: $REGISTRY_REGION"
echo ""

# Check if registry already exists
if doctl registry get $REGISTRY_NAME &> /dev/null; then
    print_warning "Registry '$REGISTRY_NAME' already exists"
else
    print_status "Creating container registry..."
    doctl registry create $REGISTRY_NAME --region $REGISTRY_REGION
    print_success "Registry created successfully!"
fi

# Login to registry
print_status "Logging into registry..."
doctl registry login

# Create repository if it doesn't exist
print_status "Setting up repositories..."
echo "Repositories will be created automatically when you push images"

# Build and push images
print_status "Building and pushing Docker images..."

# Build backend image
print_status "Building backend image..."
cd backend
docker build -t registry.digitalocean.com/$REGISTRY_NAME/nepai-backend:latest .
docker push registry.digitalocean.com/$REGISTRY_NAME/nepai-backend:latest
print_success "Backend image pushed!"

# Build frontend image
print_status "Building frontend image..."
cd ../frontend
docker build -t registry.digitalocean.com/$REGISTRY_NAME/nepai-frontend:latest .
docker push registry.digitalocean.com/$REGISTRY_NAME/nepai-frontend:latest
print_success "Frontend image pushed!"

cd ..

print_success "✅ Container registry setup complete!"
print_status "Registry URL: registry.digitalocean.com/$REGISTRY_NAME"
print_status "Next step: Run ./deploy-to-do.sh"
