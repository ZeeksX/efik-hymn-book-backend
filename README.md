# Efik Hymn Book Backend

A production-ready Express + TypeScript + MongoDB backend for the Efik hymn book application. The architecture is structured as a modular monolith with public hymn reading APIs, authenticated user features, and role-based administration.

## Overview

This backend is designed around the primary user need: opening the correct hymn quickly and reliably. It supports:

- public hymn listing and lookup by number
- Efik-aware search normalization
- category browsing
- auth and user profiles
- favorites and reading history
- admin hymn/category workflows
- Swagger/OpenAPI documentation
- secure middleware and validation

## Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Zod validation
- JWT access and refresh auth
- Argon2 password hashing
- Swagger UI
- Vitest + Supertest

## Architecture

```text
src/
├── app.ts
├── server.ts
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── logger.ts
├── middleware/
│   ├── authenticate.ts
│   ├── authorize.ts
│   ├── errorHandler.ts
│   ├── notFound.ts
│   └── validate.ts
├── modules/
│   ├── auth/
│   ├── categories/
│   ├── hymns/
│   ├── search/
│   └── users/
├── routes/
│   └── index.ts
├── shared/
│   ├── errors.ts
│   └── utils/
└── types/
```

## Installation

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start MongoDB locally or use Docker Compose.
4. Run the app in development mode:

```bash
npm run dev
```

## Environment variables

See `.env.example` for the standard configuration:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `API_PUBLIC_URL`
- `LOG_LEVEL`
- `COOKIE_DOMAIN`

## MongoDB setup

Local development:

```bash
mongod
```

Or with Docker:

```bash
docker compose up -d mongo
```

## Development commands

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm test
npm run seed
npm run import:hymns
```

## Testing

```bash
npm test
```

The initial suite contains a health-check test and is ready for additional integration coverage.

## Seed data

```bash
npm run seed
```

The seed script creates a safe development dataset with sample category records and demo hymn entries, but it does not wipe a production database.

## API docs

Swagger is exposed at:

```text
http://localhost:4000/api/docs
```

The deployed API should set `API_PUBLIC_URL` to its public Render URL. Swagger is also available at `/docs`, and the raw OpenAPI document is available at `/openapi.json`.

## Authentication architecture

The API uses:

- short-lived access tokens for API requests
- longer-lived refresh tokens for session renewal
- role-based authorization using `user`, `editor`, and `admin`
- protected user routes via the `authenticate` middleware

Public read endpoints remain unauthenticated.

## Deployment

The app is designed for deployment on Render, Railway, Fly.io, AWS, or DigitalOcean. It listens on `process.env.PORT` and gracefully handles SIGINT/SIGTERM with shutdown hooks.

## Bulk hymn import

A placeholder import script is available at:

```bash
npm run import:hymns
```

This script is intentionally simple and can be expanded into a validated bulk import workflow for production hymn datasets.

## Frontend integration notes

Public response DTOs prefer clean identifiers and stable shapes suitable for a React frontend, while internals remain Mongoose-based behind the API layer.

## Security notes

- Helmet security headers enabled
- CORS restricted to the configured frontend origin
- rate limiting in place
- JSON body limits enforced
- validation at request and env boundaries
- no plaintext password storage
- no secrets in logs
