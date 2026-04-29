# NepAI - AI-Powered Chat Application

A modern, production-ready AI chat application built with Next.js, featuring streaming responses, rate limiting, and real-time conversation management.

![NepAI](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-production-green)

## 🚀 Features

### Core Functionality
- **🤖 AI-Powered Conversations** - OpenAI GPT-4 integration with streaming responses
- **💬 Thread Management** - Create, view, and delete conversation threads
- **📊 Usage Quotas** - 6 chats per week rate limiting with visual indicators
- **🎨 Markdown Support** - Rich text formatting with syntax-highlighted code blocks
- **📱 Mobile Responsive** - Optimized for desktop, tablet, and mobile devices

### Technical Features
- **⚡ Real-time Streaming** - Token-by-token AI responses for instant feedback
- **🔒 Security First** - Rate limiting, input sanitization, OWASP headers
- **💾 Redis Caching** - Fast response times with intelligent cache invalidation
- **🔐 Authentication** - Clerk integration for secure user management
- **☸️ Kubernetes Ready** - Production deployment with K3s/K8s manifests
- **🔄 CI/CD Pipeline** - Automated testing, building, and deployment via GitHub Actions

## 📋 Prerequisites

- Node.js 20+ 
- MongoDB database
- Redis instance (Upstash recommended)
- Clerk account
- OpenAI API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone 
cd nepai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
MONGODB_URI=mongodb+srv://...

# Redis Cache
UPSTASH_REDIS_URL=rediss://...

# OpenAI
OPENAI_API_KEY=sk-...
```

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Rate Limiting

Edit `lib/redis.js` to adjust limits:

```javascript
// 6 chats per week
await rateLimit(userId, 'chat', 6, 604800)

// IP-based: 100 requests/min
await rateLimit(ip, 'ip', 100, 60)
```

### Cache TTL

Edit API routes to change cache duration:

```javascript
// Thread list: 60 seconds
await cache.set(cacheKey, threads, 60)

// Individual thread: 120 seconds
await cache.set(cacheKey, thread, 120)
```

## 🚀 Deployment

### Kubernetes (K3s/K8s)

1. **Build and push Docker image:**

```bash
docker build -t yourusername/nepai:latest .
docker push yourusername/nepai:latest
```

2. **Apply Kubernetes manifests:**

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

3. **Verify deployment:**

```bash
kubectl get pods -n nepai
kubectl logs -f deployment/nepai-app -n nepai
```

### CI/CD with GitHub Actions

Push to `main` branch triggers automatic:
- ✅ Testing and linting
- ✅ Docker image build
- ✅ Semantic versioning (auto-bump)
- ✅ Deployment to K8s
- ✅ Automatic rollback on failure

## 🔐 Security Features

- **OWASP Headers** - XSS, clickjacking, MIME sniffing protection
- **Input Sanitization** - Zod validation, SQL/NoSQL injection prevention
- **Rate Limiting** - Sliding window algorithm per user and IP
- **TLS Encryption** - Redis and MongoDB connections secured
- **Non-root Container** - Docker runs as unprivileged user

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message (streaming) |
| `/api/threads` | GET | List user threads |
| `/api/threads/[id]` | GET | Get specific thread |
| `/api/threads/[id]` | DELETE | Delete thread |
| `/api/usage` | GET | Get remaining quota |
| `/api/health` | GET | Health check |

## 🧪 Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```


## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - AI models
- [Clerk](https://clerk.com/) - Authentication
- [Upstash](https://upstash.com/) - Serverless Redis
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📧 Contact

Sandesh Pulami - [@pulami](https://github.com/pulami)




