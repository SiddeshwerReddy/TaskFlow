# Queue and Worker Design

## Components
- **Job Producer**: The Express API server pushing jobs to Redis via BullMQ.
- **Redis**: In-memory data store holding queues, job metadata, and events.
- **BullMQ Queues**: The queue abstraction managing job states (waiting, active, completed, failed, delayed).
- **Worker Consumers**: Independent Node.js processes pulling jobs from BullMQ and executing them.

## Worker Concurrency
Workers can be configured to process multiple jobs concurrently. Node.js is single-threaded, but since our jobs (especially email/reporting) involve I/O, Node can efficiently handle concurrent tasks. Heavy CPU tasks (like image processing) may require spawning child processes or using worker threads to avoid event loop blocking.

## Job Acknowledgement and Completion
When a worker finishes executing a job, it returns a resolved Promise (completion) or throws an Error (failure). BullMQ automatically acknowledges the job and moves it to the completed or failed set in Redis. Our worker logic will explicitly update MongoDB with the final status.

## Retry Policies and Exponential Backoff
BullMQ handles retries natively. We configure jobs with a maximum attempt count (e.g., 3) and an exponential backoff strategy.
- Attempt 1 fails -> delay 10s -> retry
- Attempt 2 fails -> delay 20s -> retry
- Attempt 3 fails -> move to failed set.

## Dead-Letter Handling
Jobs that exhaust all retries remain in the BullMQ "failed" set. They act as dead-lettered jobs. Users can manually retry them via the API, which tells BullMQ to re-queue them.

## Idempotency
We do not promise exactly-once execution. Due to network failures or crashes, a job might be processed more than once (at-least-once delivery). Therefore, job handlers must be designed to be idempotent (e.g., checking if an email was already sent before sending it again, or safely overwriting a generated report).

## Delayed and Recurring Jobs
BullMQ supports delayed jobs (run in X milliseconds) and repeatable jobs (cron schedules). We will leverage this for the scheduling feature in Week 2.

## Worker Crashes and Stalled-Job Recovery
If a worker crashes while processing a job, the job is left in the 'active' state. BullMQ automatically detects stalled jobs via a heartbeat mechanism (locks). When a lock expires without being renewed, BullMQ moves the stalled job back to the wait queue or marks it as failed, depending on configuration.
