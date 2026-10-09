# Development Roadmap (21 Days)

## Week 1: Core Application and E2E Job Processing
- **Day 1**: Requirements, Architecture, and Git Setup (Completed)
- **Day 2**: Project Initialization, ESLint/Prettier, Express Server & MongoDB Connection
- **Day 3**: User Authentication (Register/Login API)
- **Day 4**: Job Queue Setup (Redis & BullMQ basics)
- **Day 5**: API implementation for Job Submission and Listing
- **Day 6**: Worker Service scaffolding and initial Job Processors
- **Day 7**: End-to-end integration: Submit job -> Queue -> Process -> Update DB

## Week 2: Reliability, Retries, Scheduling & Real-time
- **Day 8**: Advanced Worker Logic (Retries, Exponential Backoff)
- **Day 9**: Job Cancellation and Manual Retries via API
- **Day 10**: React Dashboard Scaffold (Vite, Tailwind, Routing)
- **Day 11**: Frontend Authentication and Dashboard UI
- **Day 12**: Socket.io Integration for Real-time Job Status Updates
- **Day 13**: Job Scheduling (Delayed and Cron jobs)
- **Day 14**: Worker Status Monitoring and Dashboard Metrics

## Week 3: Testing, Docker, CI/CD & Polish
- **Day 15**: Unit Testing Backend (Jest)
- **Day 16**: Integration Testing Backend (Supertest)
- **Day 17**: Frontend Testing (React Testing Library)
- **Day 18**: Docker & Docker Compose setup
- **Day 19**: CI/CD Pipeline (GitHub Actions)
- **Day 20**: Load Testing and Performance Optimization
- **Day 21**: Final Review, Documentation Polish, and Interview Prep

## Acceptance Criteria
- **Week 1**: A user can create an account, submit a job via API, and see it processed by the worker and stored in MongoDB.
- **Week 2**: The frontend dashboard is functional. Real-time updates flow from worker to UI. Failed jobs retry gracefully.
- **Week 3**: The app runs in Docker, passes automated tests, and is ready to be showcased.
