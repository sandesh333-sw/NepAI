# 🤖 NepAI - Nepali AI Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https://nepai.143.198.243.230.nip.io-brightgreen)](https://nepai.143.198.243.230.nip.io)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-blue)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)](https://docker.com/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-orange)](https://github.com/features/actions)

NepAI is a modern, production-ready Nepali AI chat application designed to assist users with daily tasks and conversations, featuring custom Nepali accents and cultural context. Built with cutting-edge technologies and deployed on Kubernetes with full CI/CD automation.

## 🌟 Features

### 💬 **Smart AI Chat**
- **Daily Task Assistance**: Help with regular queries and tasks
- **Thread Management**: Create, manage, and delete conversation threads
- **Real-time Responses**: Fast, streaming AI responses

### 🎨 **Modern UI/UX**
- **Dark Theme**: Sleek, modern dark interface
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Typing Animation**: Smooth message animations
- **Intuitive Navigation**: Easy-to-use sidebar and chat interface

### 🚀 **Production Ready**
- **Kubernetes Deployment**: Auto-scaling, zero-downtime deployments
- **SSL/HTTPS**: Automatic Let's Encrypt certificates
- **Health Checks**: Automatic pod recovery and monitoring
- **CI/CD Pipeline**: Automatic deployments on code push
- **Multi-environment**: Development and production configurations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Node.js API   │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • Vite Build    │    │ • Express.js    │    │ • Threads       │
│ • Nginx Serve   │    │ • OpenAI API    │    │ • Chat History  │
│ • Docker        │    │ • CORS          │    │ • Cloud Atlas   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────────────────────┐
                                 │                               │
                    ┌─────────────────┐              ┌─────────────────┐
                    │   Kubernetes    │              │   GitHub        │
                    │   (Orchestration)│              │   Actions       │
                    │                 │              │   (CI/CD)       │
                    │ • Auto-scaling  │              │                 │
                    │ • Load Balancer │              │ • Auto Deploy   │
                    │ • SSL Certs     │              │ • Docker Build  │
                    │ • Health Checks │              │ • K8s Deploy    │
                    └─────────────────┘              └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **CSS3** - Custom styling with dark theme
- **Font Awesome** - Beautiful icons
- **Docker** - Containerized with Nginx

### **Backend**
- **Node.js 18** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **OpenAI API** - AI chat capabilities
- **CORS** - Cross-origin resource sharing

### **Infrastructure**
- **Kubernetes** - Container orchestration
- **DigitalOcean** - Cloud hosting
- **Docker Hub** - Image registry
- **GitHub Actions** - CI/CD automation
- **Let's Encrypt** - SSL certificates

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- Docker
- MongoDB Atlas account
- OpenAI API key
- DigitalOcean account (for production)

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/sandesh333-sw/NepAI.git
   cd NepAI
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your MongoDB URI and OpenAI API key to .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

## 🌐 Production Deployment

### **Live Application**
**🔗 [https://nepai.143.198.243.230.nip.io](https://nepai.143.198.243.230.nip.io)**

### **Deployment Features**
- ✅ **Zero-downtime deployments** with rolling updates
- ✅ **Auto-scaling** (1-3 replicas based on load)
- ✅ **SSL/HTTPS** with automatic certificate renewal
- ✅ **Health monitoring** with automatic pod recovery
- ✅ **CI/CD automation** - deploys on every push to main

### **Deploy Your Own**

1. **Fork this repository**
2. **Set up GitHub Secrets**:
   - `DOCKER_API_KEY` - Your Docker Hub token
   - `DO_ACCESS_TOKEN` - Your DigitalOcean API token
3. **Update cluster name** in `.github/workflows/deploy-do.yml`
4. **Push to main branch** - automatic deployment!

## 📁 Project Structure

```
NepAI/
├── 🎨 frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── styles/            # CSS files
│   │   └── main.jsx           # App entry point
│   ├── public/                # Static assets
│   ├── Dockerfile             # Frontend container
│   └── package.json
├── ⚙️ backend/                 # Node.js backend API
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   ├── server.js              # Express server
│   ├── Dockerfile             # Backend container
│   └── package.json
├── ☸️ k8s/                     # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── services.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml               # Horizontal Pod Autoscaler
│   └── secrets.yaml           # Environment variables
├── 🔄 .github/workflows/       # CI/CD pipeline
│   └── deploy-do.yml          # DigitalOcean deployment
```

## 🔧 Configuration

### **Environment Variables**

#### **Backend (.env)**
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
```

#### **Frontend (Build-time)**
```env
VITE_API_URL=https://nepai.143.198.243.230.nip.io
```

### **Kubernetes Secrets**
- `mongodb-uri` - Base64 encoded MongoDB connection string
- `openai-api-key` - Base64 encoded OpenAI API key

## 🚀 CI/CD Pipeline

The application uses GitHub Actions for automated deployment:

1. **On Push to Main**:
   - Run tests
   - Build Docker images
   - Push to Docker Hub
   - Deploy to Kubernetes
   - Zero-downtime rolling update

2. **Quality Gates**:
   - Automated testing
   - Docker image scanning
   - Kubernetes health checks

## 🔍 API Endpoints

### **Chat API**
- `GET /api/thread` - Get all chat threads
- `POST /api/thread` - Create new thread
- `DELETE /api/thread/:id` - Delete thread
- `POST /api/chat` - Send chat message

### **Health Check**
- `GET /health` - Application health status

## 🎯 Future Enhancements

### **Planned Features**
- 🎭 **Nepali Language Model**: Fine-tuned AI with Nepali tokens
- 🌍 **Multi-language Support**: Support for multiple languages
- 📱 **Mobile App**: React Native mobile application
- 🔐 **User Authentication**: User accounts and chat history
- 📊 **Analytics Dashboard**: Usage statistics and insights
- 🎨 **Theme Customization**: Multiple UI themes
- 🔊 **Voice Chat**: Voice input/output capabilities

### **Technical Improvements**
- 🔄 **Real-time Chat**: WebSocket integration
- 📈 **Advanced Monitoring**: Prometheus + Grafana
- 🔒 **Enhanced Security**: JWT authentication, rate limiting
- 🌐 **CDN Integration**: Global content delivery
- 📱 **PWA Support**: Progressive Web App features

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**


## 🙏 Acknowledgments

- **OpenAI** for providing the AI API
- **MongoDB** for the database service
- **DigitalOcean** for cloud infrastructure
- **Kubernetes** community for container orchestration
- **React** and **Node.js** communities for amazing tools

## 📞 Support

- **Live Demo**: [https://nepai.143.198.243.230.nip.io](https://nepai.143.198.243.230.nip.io)
- **Documentation**: [Deployment Guide](DEPLOYMENT-GUIDE.md)

---

**🌟 Made with ❤️  **
