# API Design

## Endpoints

### 1. Registration
- **Method**: POST
- **URL**: `/api/auth/register`
- **Purpose**: Register a new user.
- **Auth**: None
- **Example Request**:
  ```json
  { "email": "user@example.com", "password": "password123", "name": "John Doe" }
  ```
- **Example Response**: `201 Created`
  ```json
  { "token": "jwt-token-string", "user": { "id": "...", "email": "..." } }
  ```

### 2. Login
- **Method**: POST
- **URL**: `/api/auth/login`
- **Purpose**: Authenticate user and issue JWT.
- **Auth**: None
- **Example Request**: `{ "email": "user@example.com", "password": "password123" }`
- **Example Response**: `200 OK` (Returns token)

### 3. Create Job
- **Method**: POST
- **URL**: `/api/jobs`
- **Purpose**: Submit a new job to the queue.
- **Auth**: Required (JWT)
- **Example Request**:
  ```json
  {
    "type": "email",
    "data": { "to": "test@example.com", "subject": "Hello", "body": "World" }
  }
  ```
- **Example Response**: `201 Created`
  ```json
  { "jobId": "65ab...", "status": "queued" }
  ```

### 4. List Jobs
- **Method**: GET
- **URL**: `/api/jobs?page=1&limit=10&status=completed`
- **Purpose**: Retrieve a paginated list of jobs for the current user.
- **Auth**: Required (JWT)
- **Example Response**: `200 OK` (Array of job objects)

### 5. View Job Details
- **Method**: GET
- **URL**: `/api/jobs/:id`
- **Purpose**: Get full details of a specific job.
- **Auth**: Required (JWT)
- **Example Response**: `200 OK` (Job object)

### 6. Cancel Job
- **Method**: POST
- **URL**: `/api/jobs/:id/cancel`
- **Purpose**: Attempt to cancel a queued job.
- **Auth**: Required (JWT)
- **Example Response**: `200 OK` `{ "message": "Job cancelled successfully" }`

### 7. Retry Failed Job
- **Method**: POST
- **URL**: `/api/jobs/:id/retry`
- **Purpose**: Re-queue a failed job.
- **Auth**: Required (JWT)
- **Example Response**: `200 OK` `{ "message": "Job requeued" }`

### 8. View Worker Status
- **Method**: GET
- **URL**: `/api/workers`
- **Purpose**: List active workers and their current load.
- **Auth**: Required (JWT, Admin only)
- **Example Response**: `200 OK` (Array of worker objects)

### 9. View Dashboard Metrics
- **Method**: GET
- **URL**: `/api/metrics`
- **Purpose**: Get aggregated stats (e.g., total jobs, success rate).
- **Auth**: Required (JWT)
- **Example Response**: `200 OK`
  ```json
  { "totalJobs": 1500, "failedJobs": 12, "activeWorkers": 3 }
  ```
