# Express TS Campaign Workspace

Monorepo with:

- backend API for auth and campaign management
- frontend campaign console UI

This README is the top-level guide. Detailed docs are in each app folder:

- Backend guide: backend/README.md
- Frontend guide: frontend/README.md

## Workspace Structure

```text
express-ts/
	backend/
		src/
		migrations/
		tests/
	frontend/
		src/
```

## Tech Overview

Backend:

- Express + TypeScript
- PostgreSQL via postgres.js
- JWT auth
- Zod validation

Frontend:

- React + TypeScript + Vite
- MUI UI components
- Redux Toolkit for auth/UI state
- React Query for server state
- Axios for API calls

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

## Environment Setup

1. Create backend env file at backend/.env:

```env
POSTGRES_URI=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_with_a_secure_secret
```

2. Create frontend env file at frontend/.env:

```env
VITE_BACKEND_URL=http://localhost:3000
```

## Install Dependencies

Install each app separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Database Migration

From backend/ run:

```bash
psql "$POSTGRES_URI" -f migrations/001_initial_schema.sql
psql "$POSTGRES_URI" -f migrations/002_seed_demo_data.sql
```

## Run the Project

Use two terminals.

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Default local URLs:

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Local Setup Status

Current state:

- Manual local setup is supported and documented above.
- Docker Compose setup is not available yet in this repository (no compose file exists).

If you want the default entrypoint to be docker compose up, add:

- a docker-compose.yml at repository root
- Dockerfiles for backend and frontend
- a PostgreSQL service plus migration step

## Backend API Summary

Public:

- GET /healthcheck
- POST /auth/register
- POST /auth/login

Protected (Bearer token required):

- GET /auth/me
- POST /campaigns
- GET /campaigns
- GET /campaigns/:id
- PATCH /campaigns/:id
- DELETE /campaigns/:id
- POST /campaigns/:id/schedule
- POST /campaigns/:id/send
- GET /campaigns/:id/stats

## Common Commands

Backend:

```bash
cd backend
npm run dev
npm start
npm test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Seed Data and Demo Flow

Current state:

- Seed script is available at backend/migrations/002_seed_demo_data.sql.
- Script is idempotent and safe to re-run for local demos.

Quick demo flow with current backend behavior:

1. Login with any valid email using POST /auth/login.
2. If the user does not exist, backend creates it automatically.
3. Use returned JWT token to create and manage campaigns.

Example login request:

```bash
curl -X POST http://localhost:3000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"demo@northstar-mail.com"}'
```

## Notes

- Frontend API wrapper is named src/lib/mockApi.ts, but it currently makes real HTTP requests.
- Backend and frontend README files contain endpoint examples and deeper implementation details.

## How I Used Claude Code

I used Claude Code with GitHub Copilot in VS Code for implementation support.

### What I Used It For

Backend:

- Create CRUD layout
- Define input validation rules
- Write unit tests
- Write SQL queries
- Draft documentation and comments

Frontend:

- Build UI pages for backend endpoints
- Style components (buttons, forms, etc.)
- Mock data flows
- Draft documentation and comments

### Example Prompts

- Let create the CRUD follow the rules include the input validation (attach the rules)
- Let write some unit test cases for the campaign rules (attach the rules)
- Build pages to integrate with these routes (attach backend route TypeScript file)

### What Needed Manual Correction

- Some generated SQL in the campaign controller did not match requirements.
- Example: it inserted into campaigns and campaign_recipients without inserting missing recipients first.

### What I Did Not Delegate to AI

- Define database schema
- Configure third-party libraries
