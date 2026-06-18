# Foodio Backend

Express + MongoDB REST API and Socket.IO server for the Foodio food delivery app.

## Tech Stack

- Node.js 20+, Express 5, Mongoose, Socket.IO
- JWT auth, Stripe, BullMQ + Redis, Cloudinary

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed database with sample data |
| `npm test` | Skipped for now (scaffold in `tests/`) |

## API

- Health: `GET /health`
- REST base: `http://localhost:3001/api/v1`
- Socket.IO namespaces: `/orders`, `/drivers`

> **macOS:** Port 5000 is used by AirPlay Receiver. This project defaults to **3001** instead.

## Environment

See [`.env.example`](.env.example) for all required variables.
