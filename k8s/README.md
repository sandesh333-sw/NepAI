# NepAI Kubernetes Deployment

This directory contains all the Kubernetes manifests needed to deploy NepAI to a production Kubernetes cluster.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates the `nepai` namespace |
| `secrets.yaml` | Contains secrets (MongoDB URI, OpenAI API key) and ConfigMap |
| `backend-deployment.yaml` | Backend service deployment |
| `frontend-deployment.yaml` | Frontend service deployment |
| `services.yaml` | Kubernetes services for backend and frontend |
| `hpa.yaml` | Horizontal Pod Autoscaler for auto-scaling |
| `ingress.yaml` | Ingress controller and TLS certificate |
| `deploy.sh` | Automated deployment script |

## 🚀 Quick Deployment

### Prerequisites

1. **Kubernetes cluster** (DigitalOcean, GKE, EKS, etc.)
2. **kubectl** configured to connect to your cluster
3. **Docker images** pushed to your registry
4. **Domain name** pointing to your cluster

### 1. Update Configuration

Before deploying, update these files:

#### `secrets.yaml`
```yaml
data:
  mongodb-uri: "your-base64-encoded-mongodb-uri"
  openai-api-key: "your-base64-encoded-openai-key"
  API_URL: "https://your-domain.com"  # Your actual domain
```

To encode secrets:
```bash
echo -n "mongodb://username:password@host:port/database" | base64
echo -n "your-openai-api-key" | base64
```

#### `ingress.yaml`
Replace `nepai.yourdomain.com` with your actual domain:
```yaml
spec:
  rules:
  - host: your-actual-domain.com
```

### 2. Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or deploy manually:
```bash
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f services.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml
```

## 🔧 Configuration Details

### Resource Limits

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| Frontend | 25m | 100m | 32Mi | 128Mi |
| Backend | 100m | 500m | 128Mi | 512Mi |

### Auto-scaling

- **Backend**: 2-10 replicas based on CPU/Memory usage
- **Frontend**: 2-5 replicas based on CPU/Memory usage
- **Scale-up**: Aggressive (100% increase)
- **Scale-down**: Conservative (10% decrease every 60s)

### Health Checks

Both services have:
- **Liveness Probe**: `/health` endpoint
- **Readiness Probe**: `/health` endpoint
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Security Features

- **Non-root containers**: Run as user 1001
- **Read-only root filesystem**: Where possible
- **Dropped capabilities**: All unnecessary capabilities removed
- **TLS/SSL**: Automatic certificate management with cert-manager

## 🌐 Ingress Configuration

### SSL/TLS
- **Automatic HTTPS**: Force SSL redirect enabled
- **Certificate**: Managed by cert-manager with Let's Encrypt
- **Timeout**: 600s for long-running AI requests

### Routing
- `/api/*` → Backend service (port 8080)
- `/*` → Frontend service (port 80)

## 📊 Monitoring & Scaling

### View Status
```bash
# Check pods
kubectl get pods -n nepai

# Check services
kubectl get services -n nepai

# Check ingress
kubectl get ingress -n nepai

# Check HPA
kubectl get hpa -n nepai
```

### Scaling
```bash
# Manual scaling
kubectl scale deployment nepai-backend --replicas=5 -n nepai
kubectl scale deployment nepai-frontend --replicas=3 -n nepai
```

## 🔍 Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n nepai
   kubectl logs <pod-name> -n nepai
   ```

2. **Services not accessible**
   ```bash
   kubectl get endpoints -n nepai
   kubectl describe service <service-name> -n nepai
   ```

3. **Ingress issues**
   ```bash
   kubectl describe ingress nepai-ingress -n nepai
   ```

4. **Certificate problems**
   ```bash
   kubectl get certificates -n nepai
   kubectl describe certificate nepai-ssl-cert -n nepai
   ```

### Health Checks

```bash
# Test backend health
curl https://your-domain.com/api/health

# Test frontend
curl https://your-domain.com/health
```

## 🔄 Updates & Rollouts

### Zero-downtime deployments
The deployment strategy ensures zero downtime:
- **RollingUpdate**: Max unavailable = 0, Max surge = 1
- **Health checks**: Ensure new pods are ready before removing old ones

### Update process
```bash
# Update image tag in deployment files
# Then apply changes
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Watch rollout
kubectl rollout status deployment/nepai-backend -n nepai
kubectl rollout status deployment/nepai-frontend -n nepai
```

## 📝 Environment Variables

### Backend
- `NODE_ENV`: production
- `PORT`: 8080
- `MONGODB_URI`: From secret
- `OPENAI_API_KEY`: From secret

### Frontend
- `VITE_API_URL`: Production API URL

## 🎯 Production Checklist

- [ ] Update domain name in ingress.yaml
- [ ] Set MongoDB URI in secrets.yaml
- [ ] Set OpenAI API key in secrets.yaml
- [ ] Update API_URL in secrets.yaml
- [ ] Configure DNS to point to ingress IP
- [ ] Test health endpoints
- [ ] Verify SSL certificate
- [ ] Monitor resource usage
- [ ] Set up monitoring/alerting
- [ ] Configure backup strategy for MongoDB

## 🔗 Related Documentation

- [DigitalOcean Kubernetes Setup](../DIGITALOCEAN-DEPLOYMENT.md)
- [Main Project README](../README.md)
- [Interview Preparation](../INTERVIEW-PREP.md)
