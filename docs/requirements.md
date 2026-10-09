# Requirements

## The Problem TaskFlow Solves
In modern web applications, executing heavy or long-running tasks synchronously during an HTTP request blocks the server and leads to poor user experiences, timeouts, and resource exhaustion.

## Why Synchronous Background Processing is Problematic
Synchronous processing forces the client to wait until the task completes. If the task fails, the request fails. It also makes scaling difficult because web servers must hold connections open while performing heavy compute or I/O.

## How Asynchronous Job Processing Solves It
By offloading these tasks to a message queue and independent worker processes, the web server can immediately respond to the client (e.g., "Job accepted"). Workers can then process the jobs asynchronously, retrying them if they fail, without blocking the API.

## Target Users and Example Use Cases
- **Target Users**: System administrators, business analysts, data scientists.
- **Example Use Cases**:
  - Bulk email sending
  - Generating large PDF or CSV reports
  - Processing and resizing user-uploaded images
  - Running complex data simulations

## Functional Requirements
- Users can submit jobs to a queue via a REST API.
- The system processes jobs asynchronously in the background.
- Users can view the status of their jobs (queued, processing, completed, failed) via a dashboard in real-time.
- Users can cancel pending jobs.
- Users can manually retry failed jobs.
- Initial supported job types:
  1. Email simulation
  2. Report generation
  3. Image processing
  4. Controlled simulation tasks for testing failures and processing delays

## Non-functional Requirements
- **Strictly JavaScript**: No TypeScript used anywhere in the codebase.
- **Reliability**: Jobs should not be lost if a worker crashes.
- **Scalability**: The system should support multiple worker instances.
- **Observability**: Metrics and job statuses must be trackable.

## MVP Scope vs Future Enhancements
- **MVP Scope**: Basic API, React dashboard, MongoDB for persistence, Redis/BullMQ for queueing, basic job types, and Docker setup.
- **Future Enhancements**: Complex DAG (Directed Acyclic Graph) workflows, exactly-once semantics, rate limiting, and multi-tenant isolation.
