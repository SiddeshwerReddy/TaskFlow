# 🚀 TaskFlow

**TaskFlow** is an enterprise-grade, distributed job processing and workflow platform. It is designed to handle heavy, asynchronous background tasks (like sending emails, generating reports, processing images, and running simulations) reliably without blocking the main web server.

![TaskFlow Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20Redis%20%7C%20Docker-blue?style=for-the-badge)

## ✨ Key Features

- **Asynchronous Processing:** Offloads heavy computing tasks to background workers using **BullMQ**.
- **Real-Time UI Updates:** Pushes instant job status updates to the frontend using **Socket.io** and **Redis Pub/Sub**.
- **Self-Healing Workers:** Automatic job retries, stalled job recovery, and exponential backoff.
- **Queue Observability:** Built-in **Bull-Board** admin dashboard for real-time Redis queue monitoring and manual intervention.
- **Secure Authentication:** JWT-based user authentication and protected React routes.
- **Fully Containerized:** Multi-stage NGINX builds and orchestrated backend services using **Docker Compose**.

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS v4, Axios, Socket.io-client |
| **Backend API** | Node.js, Express.js, Socket.io, JWT |
| **Background Workers** | BullMQ, Node.js |
| **Databases** | MongoDB (Primary Storage), Redis (Message Broker) |
| **DevOps** | Docker, NGINX, GitHub Actions (CI) |

## 🚀 Quick Start (Docker)

The absolute easiest way to run TaskFlow is using Docker. You do not need to install Node.js, MongoDB, or Redis on your machine.

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed.

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. **Start the architecture:**
   ```bash
   docker compose up -d --build
   ```
   *(This single command starts MongoDB, Redis, the Express API, the Background Worker, and the React NGINX server).*

3. **Access the application:**
   - 💻 **Frontend Web App:** `http://localhost:8080`
   - 📊 **Bull-Board (Queue Monitor):** `http://localhost:5000/admin/queues`
   - 🔌 **Backend API:** `http://localhost:5000/api/health`

## 🛑 Manual Start (Without Docker)

If you prefer to run the services manually in your terminal, you will need local instances of MongoDB and Redis running.

1. **Start the API:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Start the Worker:**
   ```bash
   cd backend
   npm run worker:dev
   ```
3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🏗️ Architecture & Deployment

TaskFlow is built with a highly decoupled architecture. The Web Server and the Background Workers are completely separate entities that communicate purely through Redis. This allows you to infinitely scale the number of background workers without affecting the performance of the web server.

For a deep dive into the architecture diagrams and instructions on how to deploy this stack to a cloud provider like AWS or DigitalOcean, please read the [Production Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md).

## 🛡️ CI/CD (GitHub Actions)

This repository includes a Continuous Integration (CI) pipeline (`.github/workflows/ci.yml`). On every push to the `main` branch, GitHub Actions will automatically:
- Verify the Node.js API syntax.
- Verify the Node.js Worker syntax.
- Execute a strict production build of the React frontend to catch compile-time errors.
