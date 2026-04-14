# Campaign Console Frontend

React + TypeScript frontend for the campaign workflow app. It connects to the backend auth and campaign endpoints and provides pages for login, listing campaigns, creating drafts, and viewing campaign details.

## Features

- Login flow with route protection
- Campaign list with pagination
- Campaign creation with recipient validation
- Campaign detail view with schedule/send/delete actions
- Global notifications for mutation results
- Loading and error states across API views

## Tech Stack

- React 19
- TypeScript
- Vite
- MUI
- Redux Toolkit
- React Query
- React Router
- Axios

## Project Structure

```text
frontend/
  src/
    App.tsx
    main.tsx
    app/
      store.ts
      hooks.ts
    components/
      AppShell.tsx
      AuthGuard.tsx
      CampaignStatusBadge.tsx
      ErrorState.tsx
      LoadingCard.tsx
      RateStat.tsx
    features/
      auth/
        authSlice.ts
      ui/
        uiSlice.ts
    lib/
      mockApi.ts
    pages/
      LoginPage.tsx
      CampaignsPage.tsx
      NewCampaignPage.tsx
      CampaignDetailPage.tsx
    types.ts
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (recommended)

## Environment Variables

Create a .env file in frontend/:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Notes:

- If VITE_BACKEND_URL is not set, the app uses an empty base URL and calls relative paths such as /auth/login.
- Make sure this URL points to the backend API base (same host that serves /auth and /campaigns).

## Installation

```bash
cd frontend
npm install
```

## Run the App

Development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Routes

- /login
- /campaigns
- /campaigns/new
- /campaigns/:id

Behavior:

- Unauthenticated users are redirected to /login.
- Authenticated users are redirected from / to /campaigns.

## Data and State

- Auth state is stored in Redux (token + userEmail).
- API server state is managed by React Query.
- API requests are implemented in src/lib/mockApi.ts.
- JWT token is attached to Authorization headers for protected endpoints.

## Backend Contract (used by frontend)

- POST /auth/login
- GET /campaigns
- POST /campaigns
- GET /campaigns/:id
- POST /campaigns/:id/schedule
- POST /campaigns/:id/send
- DELETE /campaigns/:id

## Current Notes

- The client-side module name is mockApi.ts, but it currently performs real HTTP calls through Axios.
- The login screen seeds an email from demoCredentials for convenience.
