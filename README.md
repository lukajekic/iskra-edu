# Iskra

Iskra is a Serbian language platform for teaching programming in schools. It brings together classroom and student management, programming exercises, automated code evaluation, exams, AI-supported teaching tools, and progress reporting.

This repository contains the web frontend and Node.js API. Code execution is provided by Judge0 CE. The application is under active development; deployment details and capabilities may change.

## Features

- **Classroom management:** teachers can organize students, lessons, folders, and programming or theory tasks.
- **Code practice:** students submit solutions for automated evaluation and receive results in the application.
- **Exams:** teachers can create exams, review submissions, and manage grading.
- **AI tools:** Iskra Planner helps teachers prepare plans, while Canvas generates mind maps. Student-facing AI mentoring is also available for supported tasks.
- **Progress and parent reports:** teachers can review student activity; parent reports are available through a separate report flow.
- **Live updates:** Socket.IO is used for selected classroom and grading updates.
- **Administration:** protected administrative tools include account management and approval workflows.

## Repository layout

```text
.
├── backend/       Express API, MongoDB models, authentication, and Socket.IO
├── frontend/      React and Vite web application
└── python-judge/  Legacy isolated Python code execution service
└── ruby-judge/    Legacy isolated Ruby code execution service
```

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT, Socket.IO
- **Code execution:** Judge0 CE for Python and Ruby submissions
- **AI integrations:** configured backend AI endpoint, Groq-powered Planner and Canvas

## Requirements

- Node.js compatible with the versions required by the frontend and backend dependencies
- npm
- MongoDB, either local or hosted
- A reachable Judge0 CE instance
- Credentials for the external AI services used by the features you want to run

## Configuration

Create environment files locally; do not commit secrets.

### Frontend: `frontend/.env`

```env
VITE_BACKEND=http://localhost:3000
VITE_FIREBASE=
VITE_METRICA=
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=
```

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND` | Base URL of the backend API. |
| `VITE_FIREBASE` | Firebase API key used by the maintenance/status integration. |
| `VITE_METRICA` | Optional Metrica project identifier used for application events. |
| `VITE_POSTHOG_KEY` | PostHog project key used by the frontend error/analytics integration. |
| `VITE_POSTHOG_HOST` | PostHog host corresponding to the project key. |

The frontend reads these values at build time. Only put public client configuration in `VITE_*` variables; never put private API secrets there. See [`frontend/.env.example`](frontend/.env.example) for a starter file.

**Privacy note:** PostHog is currently configurable in the frontend. Review its data collection settings before enabling it with student accounts.

### Backend: `backend/.env`

```env
PORT=3000
MONGO_SECRET=mongodb://127.0.0.1:27017/iskra
JWT_SECRET=replace-with-a-long-random-secret
AI_ENDPOINT=
AI_API_KEY=
GROQ_API_KEY=
EVENT_LOG_HMAC_SECRET=
EVENT_LOG_RETENTION_DAYS=30
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Port used by the API; defaults to `3000`. |
| `MONGO_SECRET` | MongoDB connection URI. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens and protect portal OTP secrets. |
| `AI_ENDPOINT` | Endpoint used by the student AI mentor integration. |
| `AI_API_KEY` | Credential for the configured student AI endpoint. |
| `GROQ_API_KEY` | Credential used by Iskra Planner and Canvas. |
| `EVENT_LOG_HMAC_SECRET` | Optional dedicated secret for pseudonymizing actor and request source identifiers in operational logs. If omitted, `JWT_SECRET` is used. |
| `EVENT_LOG_RETENTION_DAYS` | Event log retention in days; defaults to 30 and is capped at 365. |

Use strong, unique secrets in deployed environments. The backend currently configures allowed frontend origins in `backend/server.js`; add your local or deployment frontend origin there when needed. See [`backend/.env.example`](backend/.env.example) for a starter file.

## Run locally

Start MongoDB and configure the backend and frontend environment files above. Then run each application in a separate terminal:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL when it starts. The frontend's `VITE_BACKEND` value must point to the running API.

### Judge0 CE

The backend uses Judge0 CE for Python and Ruby. For RapidAPI, set `JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com`, put the RapidAPI key in the backend-only `JUDGE0_AUTH_TOKEN` environment variable, set `JUDGE0_AUTH_TOKEN_HEADER=x-rapidapi-key`, and set `JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com`. Never put this key in frontend variables or source control. For another Judge0 instance, configure its base URL and authentication headers accordingly. Set `JUDGE0_PYTHON_LANGUAGE_ID` and `JUDGE0_RUBY_LANGUAGE_ID` to IDs returned by that instance's `/languages` endpoint. The common CE IDs are 71 and 72. Run-code requests use Judge0's asynchronous submission endpoint and poll its token; grading jobs are sent as batches.

For Render, set `JUDGE0_CALLBACK_BASE_URL` to the public backend origin and `JUDGE0_CALLBACK_SECRET` to a long random secret. Callbacks are signed and can wake a sleeping backend. The UI also polls authenticated job status, which provides recovery if a callback is missed. MongoDB must be reachable and persistent for queued job records.

## Useful commands

```bash
# Frontend
cd frontend
npm run dev
npm run build
npm run lint

# Backend
cd backend
npm run dev
npm start
```


## Current architecture notes

- Practice and exam grading use a MongoDB-backed durable queue. Exam jobs have higher dispatch priority than practice jobs; already accepted Judge0 submissions cannot be reordered. Jobs are claimed atomically, retried with bounded backoff, and submitted in batches. Exam results are persisted before Socket.IO notification; the exam page also polls every pending practical job and applies terminal status from the authenticated REST endpoint, so a missed/disconnected socket event does not lose the result. Signed Judge0 callbacks can wake a sleeping backend; polling provides recovery if a callback is missed.
- On free Render web services, the first request after 15 minutes of inactivity can take about a minute to wake the backend. Pending jobs survive in MongoDB, but work cannot be dispatched by an asleep backend until a request wakes it. A separate always-on worker removes that delay and requires a paid Render worker plan. Avoid using Render Free Key Value as the only queue store because its contents are in-memory and can be lost on restart.
- Configure `JUDGE0_CALLBACK_BASE_URL` to the public backend origin to let Judge0 completion callbacks wake the web service. Signed callbacks are an optimization; job state remains recoverable by polling Judge0 tokens.
- Socket.IO rooms and some coordination state are held by the backend process, so the current setup assumes a single backend instance unless shared coordination is added.
- Operational and security events are written to MongoDB's `event_logs` collection. Records expire automatically after the configured retention period. Backend and frontend telemetry excludes request bodies, source code, prompts, credentials, error messages, and raw actor/source identifiers.
- Parent reports are handled through the application portal; this README does not describe an email delivery flow.

### Event log

Each record uses the same envelope: `schemaVersion`, `eventId`, `occurredAt`, `expiresAt`, `category`, `type`, `severity`, `outcome`, `service`, `environment`, `actor`, `request`, `target`, `details`, and `error`. The event model validates the common fields and limits `details` to a fixed set of diagnostic fields.

The current instrumentation records backend failures and slow requests, browser errors and unhandled rejections, authentication failures, rate-limit rejections, and judge-service response timings/failures. Actor IDs and request source addresses are HMAC-pseudonymized with `EVENT_LOG_HMAC_SECRET` (or `JWT_SECRET` as a fallback). Repeated rate-limit events from the same pseudonymous source and route are coalesced for one minute.

Writes use a bounded in-memory queue and MongoDB batches so logging does not hold up application responses. This is best-effort telemetry: entries may be dropped during MongoDB outages or process shutdown. Use the hosting platform's process logs for durable crash records. The TTL index removes records after `EVENT_LOG_RETENTION_DAYS`.

## Support

For product support, contact **podrska@iskraedu.zohodesk.eu**.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
