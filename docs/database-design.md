# Database Design (MongoDB)

## User Schema
Stores registered users.
- `_id`: ObjectId
- `email`: String, Required, Unique, Indexed
- `passwordHash`: String, Required
- `name`: String, Required
- `role`: String (e.g., 'admin', 'user'), Default: 'user'
- `createdAt`: Date
- `updatedAt`: Date

## Job Schema
Tracks the lifecycle of submitted jobs.
- `_id`: ObjectId
- `userId`: ObjectId (Reference to User), Indexed
- `bullJobId`: String, Indexed (Maps to BullMQ Job ID)
- `type`: String, Required, Enum: ['email', 'report', 'image', 'simulation']
- `data`: Object (JSON payload containing job-specific parameters)
- `status`: String, Enum: ['queued', 'processing', 'completed', 'failed', 'cancelled', 'retrying'], Default: 'queued', Indexed
- `result`: Object (Output of the job, if any)
- `error`: String (Error message if failed)
- `progress`: Number (0-100)
- `attempts`: Number, Default: 0
- `createdAt`: Date
- `startedAt`: Date
- `completedAt`: Date
- `updatedAt`: Date

## Worker Schema
Tracks active worker nodes.
- `_id`: ObjectId
- `workerId`: String, Required, Unique
- `status`: String, Enum: ['active', 'idle', 'offline']
- `currentJobId`: ObjectId (Reference to Job), Nullable
- `lastHeartbeat`: Date, Indexed
- `createdAt`: Date

## Job Lifecycle
1. **Queued**: Job is saved in MongoDB and pushed to Redis.
2. **Processing**: Worker picks up the job.
3. **Completed**: Job finishes successfully.
4. **Failed**: Job fails and no retries are left.
5. **Retrying**: Job failed but will be retried by BullMQ.
6. **Cancelled**: User manually aborts a pending job.

## Consistency Challenge
MongoDB operations (updating job status) and Redis operations (queueing) are not inherently atomic. A dual-write issue can occur if the application crashes between writing to MongoDB and pushing to Redis.
- **Future Recovery Strategy**: A reconciliation cron job can periodically scan MongoDB for jobs stuck in 'queued' for too long without a corresponding job in Redis, and either requeue them or mark them as failed.
