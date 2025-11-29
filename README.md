# 🤖 NepAI - Nepali AI Assistant

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-blue)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

NepAI is a smart and aware AI chat assistant. It helps with daily tasks, maintains conversation threads, and provides real-time responses with a modern, dark-themed interface.

## 🏗️ Architecture

We use a modern microservices-inspired architecture deployed on Kubernetes. Here's how it works:

1.  **Entry Point**: All traffic enters through a **Traefik Ingress Controller** (Load Balancer).
2.  **Routing**:
    *   `/` requests go to the **Frontend Service**.
    *   `/api` requests go to the **Backend Service**.
3.  **Frontend**: A **React** application (built with Vite) served by **Nginx**. It handles the UI, user interactions, and real-time chat animations.
4.  **Backend**: A **Node.js/Express** API that manages logic. It connects to:
    *   **MongoDB Atlas** for storing chat history and threads.
    *   **OpenAI API** for generating intelligent responses.
5.  **Infrastructure**: The entire system runs on a **Kubernetes** cluster, ensuring auto-scaling, health monitoring, and zero-downtime deployments.

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, Tailwind-like CSS, Nginx
*   **Backend**: Node.js, Express.js, Mongoose
*   **Database**: MongoDB Atlas
*   **AI Engine**: OpenAI GPT Models
*   **DevOps**: Docker, Kubernetes (k3s), GitHub Actions, Custom HomeLab Kubernetes Server

## 🚀 Quick Start

### Prerequisites
*   Node.js 18+
*   Docker
*   MongoDB Atlas URI & OpenAI API Key

### Run Locally

1.  **Clone the repo**
    ```bash
    git clone https://github.com/sandesh333-sw/NepAI.git
    cd NepAI
    ```

2.  **Start Backend**
    ```bash
    cd backend
    # Create .env file with PORT, MONGODB_URI, OPENAI_API_KEY
    npm install
    npm run dev
    ```

3.  **Start Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Visit**: `http://localhost:5173`

## 🌐 Deployment

The application is production-ready and includes Kubernetes manifests in the `k8s/` directory.

*   **CI/CD**: GitHub Actions automatically builds and deploys changes to the cluster.


