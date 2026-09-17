# LECTOR (MindEcho)

AI-powered cognitive learning platform — Feynman technique evaluation + adaptive spaced repetition.

**SIH 2026** — Team: All Six Not Found

## Monorepo structure

```
lector/
├── apps/
│   ├── web/                 # React 19 + Vite frontend
│   └── api/                 # Fastify + MongoDB backend
├── docs/
│   ├── PRODUCT.md           # Product & API contracts
│   └── phases.md            # Backend development phases
├── docker-compose.yml       # MongoDB, Redis, MinIO
└── package.json             # npm workspaces root
```

## Prerequisites

- Node.js 20+
- Docker (for MongoDB, Redis, MinIO)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure
npm run docker:up

# 3. Configure API and frontend (first time)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Run migrations (optional, after MongoDB is up)
npm run migrate:up

# 5. Start frontend + backend
npm run dev:all
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:43123 |
| API health | http://localhost:3000/api/v1/health |
| OpenAPI spec | http://localhost:3000/api/v1/openapi |
| MinIO console | http://localhost:9001 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | Backend only |
| `npm run dev:all` | Both concurrently |
| `npm run build` | Build all workspaces |
| `npm run docker:up` | Start MongoDB, Redis, MinIO |
| `npm run migrate:up` | Apply MongoDB index migrations |

## Development status

| Phase | Status |
|-------|--------|
| 0 — Foundation | ✅ Complete |
| 1 — Auth | ✅ Complete (JWT register/login/refresh) |
| 2 — Notes | ✅ Complete (CRUD + API integration) |
| 3 — Calendar | ✅ Complete (settings + important dates) |
| 4 — Evaluations | ✅ Complete (Feynman text/voice + mock LLM/STT) |
| 5 — Spaced Repetition | ✅ Complete (SM-2 + dashboard analytics) |
| 6 — Billing | ✅ Complete (plans, checkout, usage limits) |
| 7 — Frontend Integration | ✅ Complete (`VITE_USE_API` cutover) |
| 8 | Planned — see [docs/phases.md](./docs/phases.md) |

Set `VITE_USE_API=true` in `apps/web/.env` to use the live API instead of localStorage demo mode.

## Documentation

- [Product spec & API contracts](./docs/PRODUCT.md)
- [Backend phase plan](./docs/phases.md)
