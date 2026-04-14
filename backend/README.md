# Express TypeScript Campaign API

Backend service for authentication and campaign management, built with Express, TypeScript, PostgreSQL, and JWT.

## Features

- Health check endpoint
- Auth flow (register, login, get current user)
- Campaign CRUD (for authenticated users)
- Campaign scheduling and send actions
- Campaign delivery stats
- Input validation with Zod

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL (postgres.js)
- JWT (jsonwebtoken)
- Zod
- dotenv

## Project Structure

```text
backend/
  src/
    index.ts
    configs/
      env.ts
      jwt.ts
      postgres.ts
    controllers/
      user.controller.ts
      campaign.controller.ts
    middlewares/
      auth.middleware.ts
    routes/
      auth.route.ts
      campaign.route.ts
      index.ts
    validators/
      auth.validator.ts
      campaign.validator.ts
  migrations/
    001_initial_schema.sql
    002_seed_demo_data.sql
  tests/
    campaign-rules.test.ts
```

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

## Environment Variables

Create a .env file in backend/ (or in the repository root).

```env
POSTGRES_URI=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_with_a_secure_secret
```

Notes:

- Server listens on port 3000.
- The app will throw during startup if POSTGRES_URI or JWT_SECRET is missing.

## Installation

```bash
cd backend
npm install
```

## Database Setup

Run the initial schema migration:

```bash
psql "$POSTGRES_URI" -f migrations/001_initial_schema.sql
```

Load demo seed data:

```bash
psql "$POSTGRES_URI" -f migrations/002_seed_demo_data.sql
```

## Run the App

Development mode:

```bash
npm run dev
```

Start mode:

```bash
npm start
```

Base URL:

```text
http://localhost:3000
```

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <token>
```

## API Endpoints

### Health

- GET /healthcheck

Response:

```json
{ "status": "ok" }
```

### Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me (protected)

Register body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Login body:

```json
{
  "email": "jane@example.com"
}
```

Auth success response shape:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "<jwt>"
  }
}
```

### Campaigns (all protected)

- POST /campaigns
- GET /campaigns
- GET /campaigns/:id
- PATCH /campaigns/:id
- DELETE /campaigns/:id
- POST /campaigns/:id/schedule
- POST /campaigns/:id/send
- GET /campaigns/:id/stats

Create campaign body:

```json
{
  "name": "April Promo",
  "subject": "20% Off This Week",
  "body": "Hello! Enjoy our special offer.",
  "recipientEmails": ["alice@example.com", "bob@example.com"]
}
```

Update campaign body (at least one field is required):

```json
{
  "subject": "Updated Subject"
}
```

Schedule campaign body:

```json
{
  "scheduledAt": "2026-05-01T10:00:00.000Z"
}
```

List campaigns query params:

- limit: number, default 10, max 100
- offset: number, default 0
- search: string, default empty

Example:

```http
GET /campaigns?limit=10&offset=0&search=promo
```

## Campaign Rules

- New campaigns start in draft status.
- Only draft campaigns can be edited or deleted.
- Only draft campaigns can be scheduled.
- Sending is allowed for draft or scheduled campaigns and changes status to sent.

## Testing

```bash
npm test
```
