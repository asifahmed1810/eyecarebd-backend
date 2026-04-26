# eyecare-bd-backend

Backend for the EyeCareBD app.

## Tech
- Node.js (ESM)
- Express.js
- MongoDB + Mongoose
- JWT auth (register/login)

## Setup
1. Install deps:

```bash
npm i
```

2. Create `.env` (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Start MongoDB (local or Atlas), then run:

```bash
npm run dev
```

Server starts on `http://localhost:5000` by default.

## Endpoints
- `GET /api/health` → health check
- `POST /api/auth/register` → create user
- `POST /api/auth/login` → login and get JWT
- `GET /api/me` → returns current user (requires `Authorization: Bearer <token>`)

