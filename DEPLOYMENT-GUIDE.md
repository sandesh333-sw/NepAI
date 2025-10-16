# 🚀 NepAI DigitalOcean Deployment Guide

Complete guide to deploy NepAI to DigitalOcean Kubernetes with CI/CD pipeline.

## 📋 Prerequisites

1. **DigitalOcean Account** with billing enabled
2. **Domain name** (optional, but recommended)
3. **GitHub repository** with your code
4. **Docker** installed locally
5. **doctl** (DigitalOcean CLI) installed

## 🛠️ Installation

### Install doctl
```bash
# macOS
brew install doctl

# Linux
snap install doctl

# Or download from: https://github.com/digitalocean/doctl/releases
```

### Authenticate doctl
```bash
doctl auth init
# Enter your DigitalOcean API token when prompted
```

## 🚀 Deployment Steps

### Step 1: Create Kubernetes Cluster

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Create cluster
./scripts/setup-do-cluster.sh
```

**What this does:**
- Creates a 2-node Kubernetes cluster
- Configures kubectl to connect to your cluster
- Sets up auto-upgrade and maintenance windows

### Step 2: Set up Container Registry

```bash
# Create registry and push images
./scripts/setup-registry.sh
```

**What this does:**
- Creates DigitalOcean Container Registry
- Builds and pushes Docker images
- Sets up authentication

### Step 3: Configure Secrets

**⚠️ IMPORTANT: Update `k8s/secrets.yaml` with your actual values:**

```bash
# Encode your secrets
echo -n "mongodb://username:password@host:port/database" | base64
echo -n "your-openai-api-key" | base64
```

Update the file:
```yaml
data:
  mongodb-uri: "your-base64-encoded-mongodb-uri"
  openai-api-key: "your-base64-encoded-openai-key"
  API_URL: "https://your-domain.com"  # Your actual domain
```

### Step 4: Deploy to Kubernetes

```bash
# Deploy application
./scripts/deploy-to-do.sh
```

**What this does:**
- Creates `nepai-prod` namespace
- Deploys all Kubernetes resources
- Waits for deployment to be ready
- Shows deployment status

## 🔄 CI/CD Setup

### Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `DO_ACCESS_TOKEN`: Your DigitalOcean API token
- `MONGODB_URI`: Your MongoDB connection string
- `OPENAI_API_KEY`: Your OpenAI API key

### Step 2: Configure Domain (Optional)

1. **Update ingress.yaml** with your domain:
```yaml
spec:
  rules:
  - host: your-actual-domain.com
```

2. **Update secrets.yaml** with your domain:
```yaml
data:
  API_URL: "https://your-actual-domain.com"
```

3. **Configure DNS** to point to your ingress IP:
```bash
# Get ingress IP
kubectl get ingress nepai-ingress -n nepai-prod
```

## 📊 Monitoring & Management

### Check Deployment Status
```bash
# View pods
kubectl get pods -n nepai-prod

# View services
kubectl get services -n nepai-prod

# View ingress
kubectl get ingress -n nepai-prod

# View logs
kubectl logs -f deployment/nepai-backend -n nepai-prod
kubectl logs -f deployment/nepai-frontend -n nepai-prod
```

### Scale Application
```bash
# Scale backend
kubectl scale deployment nepai-backend --replicas=3 -n nepai-prod

# Scale frontend
kubectl scale deployment nepai-frontend --replicas=3 -n nepai-prod
```

### Update Application
```bash
# Manual update
kubectl set image deployment/nepai-backend backend=registry.digitalocean.com/nepai-registry/nepai-backend:latest -n nepai-prod
kubectl rollout status deployment/nepai-backend -n nepai-prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Cluster not accessible**
```bash
# Check cluster status
doctl kubernetes cluster list

# Save kubeconfig
doctl kubernetes cluster kubeconfig save <cluster-id>
```

2. **Registry login issues**
```bash
# Login to registry
doctl registry login

# Check registry
doctl registry get nepai-registry
```

3. **Pods not starting**
```bash
# Check pod status
kubectl describe pod <pod-name> -n nepai-prod

# Check logs
kubectl logs <pod-name> -n nepai-prod
```

4. **Ingress not working**
```bash
# Check ingress status
kubectl describe ingress nepai-ingress -n nepai-prod

# Check certificate
kubectl get certificates -n nepai-prod
```

## 💰 Cost Optimization

### Resource Limits
- **Frontend**: 32Mi RAM, 25m CPU
- **Backend**: 128Mi RAM, 100m CPU
- **Auto-scaling**: 2-10 replicas based on load

### Estimated Monthly Cost
- **2-node cluster**: ~$24/month
- **Container Registry**: ~$5/month
- **Load Balancer**: ~$12/month
- **Total**: ~$41/month

## 🎯 Production Checklist

- [ ] Kubernetes cluster created
- [ ] Container registry set up
- [ ] Secrets configured
- [ ] Application deployed
- [ ] CI/CD pipeline working
- [ ] Domain configured
- [ ] SSL certificate issued
- [ ] Monitoring set up
- [ ] Backup strategy implemented

## 🆘 Support

If you encounter issues:

1. **Check logs**: `kubectl logs -f deployment/<service> -n nepai-prod`
2. **Verify secrets**: `kubectl get secrets -n nepai-prod`
3. **Check ingress**: `kubectl get ingress -n nepai-prod`
4. **Review CI/CD**: Check GitHub Actions logs

## 🎉 Success!

Your NepAI application is now running on DigitalOcean Kubernetes with:
- ✅ **Zero-downtime deployments**
- ✅ **Auto-scaling**
- ✅ **SSL certificates**
- ✅ **CI/CD pipeline**
- ✅ **Production-ready configuration**

**Your app is live at your configured domain!** 🌟
