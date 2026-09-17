# LECTOR (MindEcho) — Agile Backend Development Plan

> **Product reference:** [PRODUCT.md](./PRODUCT.md)  
> **Frontend:** React 19 + Vite (TypeScript) — currently mocked via `localStorage`  
> **Goal:** Build a backend that is **modular, contract-driven, and change-friendly** so new features (LLM providers, payment gateways, study algorithms) can be swapped or extended without rewriting core logic.

---

## Table of Contents

1. [Agile Design Principles](#1-agile-design-principles)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Phase Overview](#4-phase-overview)
5. [Phase 0 — Foundation & Project Skeleton](#phase-0--foundation--project-skeleton)
6. [Phase 1 — Authentication & User Identity](#phase-1--authentication--user-identity)
7. [Phase 2 — Notes & Knowledge Repository](#phase-2--notes--knowledge-repository)
8. [Phase 3 — Calendar & Study Mode](#phase-3--calendar--study-mode)
9. [Phase 4 — Feynman Evaluation Engine (LLM + STT)](#phase-4--feynman-evaluation-engine-llm--stt)
10. [Phase 5 — Spaced Repetition & Dashboard Analytics](#phase-5--spaced-repetition--dashboard-analytics)
11. [Phase 6 — Subscriptions & LLM Token Billing](#phase-6--subscriptions--llm-token-billing)
12. [Phase 7 — Frontend Integration & API Client Layer](#phase-7--frontend-integration--api-client-layer)
13. [Phase 8 — Background Workers, Notifications & Production Hardening](#phase-8--background-workers-notifications--production-hardening)
14. [Cross-Phase Concerns](#14-cross-phase-concerns)
15. [localStorage → API Migration Map](#15-localstorage--api-migration-map)
16. [Risk Register & Change Buffers](#16-risk-register--change-buffers)
17. [Definition of Done (per phase)](#17-definition-of-done-per-phase)

---

## 1. Agile Design Principles

These principles apply to **every phase** and are what make the backend ready to welcome change:

| Principle | How we apply it |
|---|---|
| **Contract-first APIs** | Define OpenAPI 3.1 specs before implementation. Frontend and backend agree on schemas; changes are versioned (`/api/v1/...`). |
| **Hexagonal / ports-and-adapters** | Core business logic (SM-2, evaluation scoring) lives in pure modules with no HTTP or DB imports. External services (LLM, STT, Stripe) are behind interfaces. |
| **Domain-driven modules** | Organize by bounded context: `auth`, `notes`, `calendar`, `evaluations`, `billing`, `analytics` — each with its own routes, service, repository. |
| **Schema versioning** | Every schema change is tracked via `migrate-mongo` scripts (indexes, data backfills). Never hand-edit production DB. |
| **Feature flags** | Gate incomplete features (`ENABLE_VOICE_EVAL`, `ENABLE_BILLING`) so partial phases can ship safely. |
| **Idempotent endpoints** | POST checkout, evaluation submissions use idempotency keys to survive retries. |
| **Event hooks (optional early, required later)** | Emit domain events (`NoteCreated`, `EvaluationCompleted`) so future features (notifications, analytics) plug in without touching core handlers. |
| **Incremental frontend cutover** | Keep `localStorage` fallback behind an `USE_API` env flag until Phase 7; swap one context method at a time. |
| **Thin controllers, fat services** | HTTP handlers validate + delegate; all rules live in testable service functions. |

---

## 2. Recommended Tech Stack

| Layer | Recommendation | Why (agility) |
|---|---|---|
| **Runtime** | Node.js 22 + TypeScript | Shares types with React frontend; large ecosystem for LLM SDKs. |
| **Framework** | Fastify or Express + Zod validation | Fast, middleware-friendly; Zod schemas generate OpenAPI and TS types. |
| **Database** | **MongoDB 7** | Document model fits notes (Markdown), nested LLM feedback, and evolving evaluation schemas without rigid migrations. |
| **ODM** | Mongoose | Type-safe schemas, middleware hooks, aggregation pipelines for dashboard analytics. |
| **Auth** | JWT (access) + refresh tokens in httpOnly cookie | Stateless scaling; refresh rotation for security. |
| **File storage** | S3-compatible (MinIO locally, AWS S3 prod) | Audio uploads decoupled from app server. |
| **Queue / workers** | BullMQ + Redis | Async evaluation jobs, daily retention decay without blocking API. |
| **LLM** | Adapter interface → OpenAI / Gemini / Claude | Swap provider by env var, not code rewrite. |
| **STT** | Adapter interface → Whisper API / Deepgram | Same pattern as LLM. |
| **Payments** | Stripe (or Razorpay for India) behind `PaymentProvider` port | Mock provider for dev/test. |
| **API docs** | Swagger UI from OpenAPI spec | Living contract for frontend team. |
| **Testing** | Vitest (unit) + Supertest (integration) + mongodb-memory-server | Fast feedback on service logic without Docker in CI. |

> **Why MongoDB for LECTOR?** Notes are self-contained documents (title + Markdown content + SM-2 state). Evaluations store variable-shape LLM `feedback` objects naturally. Calendar settings can embed inside the user document. PRODUCT.md §7 already lists MongoDB as an option.
>
> **Trade-off to watch:** Cross-document consistency (e.g. deleting a note should orphan-check evaluations) is enforced in service layer, not DB foreign keys. Use `userId` on every collection and always scope queries by authenticated user.
>
> **Alternative:** Python FastAPI + Motor/PyMongo is equally valid. API contracts from PRODUCT.md remain identical.

### MongoDB Collections Overview

| Collection | Key fields | Relationships |
|---|---|---|
| `users` | `email`, `passwordHash`, embedded `calendarSettings` | Root document per learner |
| `notes` | `userId`, `content`, SM-2 fields | `userId` → `users._id` |
| `evaluations` | `userId`, `noteId`, `feedback` (embedded) | References user + note |
| `important_dates` | `userId`, `date`, `priority` | `userId` → `users._id` |
| `subscriptions` | `userId`, `planId`, `status` | 1:1 with user |
| `usage_records` | `userId`, `type`, `date`, `count` | Daily usage counters |

API responses expose string IDs (e.g. `note-1` or `ObjectId` hex) — use a consistent serializer so the frontend never sees raw BSON.

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                       │
│   AuthContext │ NotesContext │ Pages (Dashboard, Calendar…)     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST /api/v1/*
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Gateway Layer                          │
│   CORS │ Rate Limit │ JWT Middleware │ Request Validation     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     ▼                      ▼                      ▼
┌─────────┐           ┌───────────┐          ┌────────────┐
│  auth   │           │   notes   │          │  calendar  │
│ module  │           │  module   │          │   module   │
└────┬────┘           └─────┬─────┘          └─────┬──────┘
     │                      │                        │
     └──────────────────────┼────────────────────────┘
                            ▼
                   ┌────────────────┐
                   │    MongoDB     │
                   │  (collections) │
                   └────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Async Worker Layer (Phase 8)                 │
│   Evaluation Queue │ Retention Decay Job │ Notification Dispatch│
└───────────┬─────────────────────┬───────────────────────────────┘
            ▼                     ▼
     ┌─────────────┐       ┌─────────────┐
     │ LLM Adapter │       │ STT Adapter │
     │ (GPT/Gemini)│       │ (Whisper)   │
     └─────────────┘       └─────────────┘
```

---

## 4. Phase Overview

| Phase | Name | Duration (est.) | Ships | PRODUCT.md refs |
|---|---|---|---|---|
| **0** | Foundation & Project Skeleton | 3–5 days | Runnable API, DB, OpenAPI scaffold | §6 Run & Build |
| **1** | Authentication & User Identity | 3–5 days | Register, login, JWT middleware | §4.1, `memoroute_auth` |
| **2** | Notes & Knowledge Repository | 4–6 days | Notes CRUD + user scoping | §4.2, `NoteItem` types |
| **3** | Calendar & Study Mode | 3–4 days | Settings + important dates | §4.4, calendar localStorage keys |
| **4** | Feynman Evaluation Engine | 7–10 days | LLM scoring, STT, evaluation records | §4.3, `NewConcept.tsx` |
| **5** | Spaced Repetition & Dashboard Analytics | 5–7 days | SM-2 engine, due items, aggregates | §4.3 SM-2, `Dashboard.tsx` |
| **6** | Subscriptions & Billing | 5–7 days | Plans, checkout, usage limits | §4.5, `LLMPayment.tsx` |
| **7** | Frontend Integration | 4–6 days | Replace localStorage with API client | §5, §7 handover checklist |
| **8** | Workers, Notifications & Hardening | 5–8 days | Background jobs, monitoring, prod deploy | §7 SM-2 worker, notifications |

**Total estimated timeline:** 8–12 weeks for a small team (1–2 backend devs), with each phase independently demoable.

---

## Phase 0 — Foundation & Project Skeleton

### Objective
Establish the monorepo/backend folder structure, tooling, and conventions so every subsequent phase plugs into the same foundation.

### Deliverables

```
apps/api/
├── src/
│   ├── app.ts                 # Fastify/Express bootstrap
│   ├── config/                # env validation (Zod)
│   ├── modules/               # domain modules (empty shells)
│   │   ├── auth/
│   │   ├── notes/
│   │   ├── calendar/
│   │   ├── evaluations/
│   │   ├── billing/
│   │   └── analytics/
│   ├── shared/
│   │   ├── middleware/        # error handler, auth guard stub
│   │   ├── ports/             # LLMProvider, STTProvider, PaymentProvider interfaces
│   │   └── utils/
│   ├── models/                # Mongoose schemas (User, Note, Evaluation…)
│   └── db/
│       └── connection.ts      # MongoDB connection singleton
├── migrations/                # migrate-mongo scripts (indexes, backfills)
├── openapi/
│   └── spec.yaml              # generated or hand-written v1 contract
├── tests/
├── docker-compose.yml         # MongoDB + Redis + MinIO
├── .env.example
└── package.json
```

### Tasks

- [x] Initialize `apps/api/` with TypeScript (match frontend conventions).
- [x] Add root `docker-compose.yml`: MongoDB 7, Redis 7, MinIO.
- [x] Configure Mongoose connection + `migrate-mongo` for index/data migrations.
- [x] Create `User` model shell and `src/db/connection.ts`.
- [x] Implement health check: `GET /api/health` → `{ status: "ok", version: "0.1.0" }`.
- [x] Set up global error handler returning consistent JSON: `{ error: { code, message, details? } }`.
- [x] Add request logging (pino) and correlation IDs.
- [x] Scaffold OpenAPI spec with placeholder paths for all PRODUCT.md endpoints.
- [x] Configure CORS for `http://localhost:43123` (Vite dev server).
- [x] Add `npm run dev` for backend with hot reload (tsx watch).
- [x] Document env vars in `.env.example`.

### Agile hooks

- **Versioned API prefix:** `/api/v1/` from day one.
- **Port interfaces** for LLM, STT, Payment — stub implementations that return mock data.
- **Feature flag service:** simple env-based `FeatureFlags` object.

### Exit criteria

- `docker compose up` starts all infra.
- `GET /api/health` returns 200.
- OpenAPI spec lists all planned endpoints (can return 501 Not Implemented).
- CI runs lint + typecheck on push.

---

## Phase 1 — Authentication & User Identity

### Objective
Replace the demo `AuthContext` localStorage login with real JWT-based auth matching PRODUCT.md §4.1.

### API Endpoints

| Method | Path | Status |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Implement |
| `POST` | `/api/v1/auth/login` | Implement |
| `POST` | `/api/v1/auth/refresh` | Add (not in PRODUCT.md but needed for security) |
| `POST` | `/api/v1/auth/logout` | Add |
| `GET` | `/api/v1/auth/me` | Add — returns current user profile |

### Database Schema

**Collection:** `users`

```typescript
// src/models/User.ts
const UserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  // Embedded 1:1 — avoids extra join for every calendar request
  calendarSettings: {
    studyMode:      { type: String, enum: ['exam', 'skill'], default: 'exam' },
    examTargetDate: { type: Date },
    examTitle:      { type: String },
  },
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });
```

### Tasks

- [ ] Password hashing with bcrypt (cost factor 12).
- [ ] JWT access token (15 min) + refresh token (7 days, stored hashed in DB or Redis).
- [ ] `authMiddleware` — validates Bearer token, attaches `req.user`.
- [ ] Input validation: email format, password min 8 chars.
- [ ] Rate limit login/register (5 req/min per IP).
- [ ] Return user object matching frontend `User` interface + `id` field.

### Response contract (from PRODUCT.md)

```json
{
  "token": "JWT_BEARER_TOKEN_HERE",
  "user": {
    "id": "usr_98123",
    "name": "Jane Doe",
    "email": "jane@university.edu"
  }
}
```

### Agile hooks

- Auth module is isolated — swapping to OAuth (Google/GitHub) later only adds new routes + `OAuthProvider` port.
- User ID format (`usr_*`) can be a presentation layer concern (prefix in serializer).

### Exit criteria

- Register + login flow works via curl/Postman.
- Protected route returns 401 without token.
- Unit tests for password hash + token verify.

---

## Phase 2 — Notes & Knowledge Repository

### Objective
Persist the Notion-style workspace notes per user, replacing `memoroute_notion_notes` localStorage.

### API Endpoints

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/v1/notes` | List all notes for authenticated user |
| `GET` | `/api/v1/notes/:id` | Single note (add — frontend may need it) |
| `POST` | `/api/v1/notes` | Create note |
| `PATCH` | `/api/v1/notes/:id` | Update note (add — workspace edits) |
| `DELETE` | `/api/v1/notes/:id` | Delete note |

### Database Schema

**Collection:** `notes`

```typescript
// src/models/Note.ts
const NoteSchema = new Schema({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:           { type: String, required: true },
  subject:         { type: String, required: true },
  icon:            { type: String, default: 'file-text' },
  content:         { type: String, required: true },  // Markdown
  lectorScore:     { type: Number },
  practiceCount:   { type: Number, default: 0 },
  lastPracticed:   { type: Date },
  retentionHealth: { type: Number, default: 70 },
  nextReviewDate:  { type: Date },
  // SM-2 internal state (not exposed in API response initially)
  easinessFactor:  { type: Number, default: 2.5 },
  interval:        { type: Number, default: 0 },
  repetition:      { type: Number, default: 0 },
}, { timestamps: true });

NoteSchema.index({ userId: 1, nextReviewDate: 1 });
NoteSchema.index({ userId: 1, subject: 1 });
// Text search on title + content
NoteSchema.index({ title: 'text', content: 'text' });
```

### Mapping to frontend `NoteItem`

| Frontend field | API field | Notes |
|---|---|---|
| `id` | `id` | |
| `title` | `title` | |
| `subject` | `subject` | |
| `icon` | `icon` | Lucide icon name |
| `content` | `content` | Markdown string |
| `lectorScore` | `lectorScore` | Optional until first evaluation |
| `practiceCount` | `practiceCount` | |
| `lastPracticed` | `lastPracticed` | ISO date string `YYYY-MM-DD` in API |
| `retentionHealth` | `retentionHealth` | 0–100 |
| `nextReviewDate` | `nextReviewDate` | ISO date string |
| `createdAt` | `createdAt` | |
| `updatedAt` | `updatedAt` | |

### Tasks

- [ ] CRUD service with user-scoped queries (never leak cross-user data).
- [ ] Pagination on `GET /notes` (`?page=1&limit=50`) — prepare for scale.
- [ ] Search/filter query params: `?subject=Computer Science&search=binary`.
- [ ] Validate `icon` against allowed list (optional).
- [ ] Seed script for demo data matching `DEFAULT_NOTES` in `NotesContext.tsx`.

### Agile hooks

- `content` stored as Markdown text today; add `contentFormat` enum later if rich-text (Notion blocks) is needed.
- SM-2 fields (`easinessFactor`, `interval`, `repetition`) stored now but hidden from API — Phase 5 exposes computed `nextReviewDate`.

### Exit criteria

- Full CRUD via authenticated API.
- Integration test: user A cannot read user B's notes.
- Response shape matches PRODUCT.md §4.2 exactly.

---

## Phase 3 — Calendar & Study Mode

### Objective
Persist adaptive calendar settings and important dates, replacing `memoroute_study_mode`, `memoroute_exam_target_date`, `memoroute_exam_title`, and `memoroute_important_dates`.

### API Endpoints

| Method | Path | PRODUCT.md |
|---|---|---|
| `GET` | `/api/v1/calendar/settings` | §4.4 |
| `POST` | `/api/v1/calendar/settings` | §4.4 |
| `GET` | `/api/v1/calendar/important-dates` | §4.4 |
| `POST` | `/api/v1/calendar/important-dates` | §4.4 |
| `DELETE` | `/api/v1/calendar/important-dates/:id` | Add (frontend has delete) |
| `PATCH` | `/api/v1/calendar/important-dates/:id` | Add (future-proof) |

### Database Schema

**Calendar settings** — embedded in `users.calendarSettings` (see Phase 1). Updated via `$set` on the user document.

**Collection:** `important_dates`

```typescript
// src/models/ImportantDate.ts
const ImportantDateSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true },
  date:        { type: Date, required: true },
  subject:     { type: String, required: true },
  priority:    { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  description: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

ImportantDateSchema.index({ userId: 1, date: 1 });
```

### Tasks

- [ ] Auto-create `CalendarSettings` with defaults on user registration (exam mode, null exam date).
- [ ] Validate `examTargetDate` is in the future when `studyMode = exam`.
- [ ] Return dates as `YYYY-MM-DD` strings in API responses.
- [ ] `GET /calendar/important-dates?from=2026-09-01&to=2026-10-31` for calendar view filtering.

### Agile hooks

- `StudyMode` enum extensible (e.g., add `intensive` later).
- Important dates are independent of notes — link via `subject` string now; add `noteIds[]` relation later if needed.

### Exit criteria

- Settings round-trip matches PRODUCT.md schemas.
- `AdaptiveCalendar.tsx` can be wired with zero localStorage for calendar data.

---

## Phase 4 — Feynman Evaluation Engine (LLM + STT)

### Objective
Implement the core differentiator: AI-powered Feynman technique evaluation with voice transcription, matching PRODUCT.md §4.3 and `NewConcept.tsx` flow.

### API Endpoints

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/evaluations/feynman` | Main evaluation endpoint |
| `GET` | `/api/v1/evaluations` | List user's evaluation history |
| `GET` | `/api/v1/evaluations/:id` | Single evaluation detail |

### Request handling

Supports both:
- `multipart/form-data` — `noteId`, `audioFile`, `selfRating`
- `application/json` — `noteId`, `explanationText`, `selfRating`

### Processing pipeline

```
Request received
    │
    ├─► Validate noteId belongs to user
    │
    ├─► If audioFile → STT Adapter → transcript
    │   Else use explanationText
    │
    ├─► Load note.content as source material
    │
    ├─► LLM Adapter → structured evaluation
    │     • lectorScore (0–10)
    │     • strengths[], missingConcepts[], improvementTip
    │     • correctness, clarity, completeness (0–100)
    │
    ├─► Store Evaluation record
    │
    └─► Return response (SM-2 update deferred to Phase 5)
```

### Database Schema

**Collection:** `evaluations`

```typescript
// src/models/Evaluation.ts
const EvaluationSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  noteId:       { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
  mode:         { type: String, enum: ['voice', 'text'], required: true },
  transcript:   { type: String },
  selfRating:   { type: Number, min: 1, max: 10 },
  lectorScore:  { type: Number, required: true },
  correctness:  { type: Number, required: true },
  clarity:      { type: Number, required: true },
  completeness: { type: Number, required: true },
  // Embedded subdocument — shape can evolve without migration
  feedback: {
    strengths:       [String],
    missingConcepts: [String],
    improvementTip:  String,
  },
  audioUrl:     { type: String },  // S3 key if voice
}, { timestamps: { createdAt: true, updatedAt: false } });

EvaluationSchema.index({ userId: 1, createdAt: -1 });
```

### Port interfaces (agile core)

```typescript
// shared/ports/llm-provider.ts
interface LLMProvider {
  evaluateFeynman(input: {
    sourceContent: string;
    userExplanation: string;
    topic: string;
  }): Promise<FeynmanEvaluationResult>;
}

// shared/ports/stt-provider.ts
interface STTProvider {
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<string>;
}
```

### Implementations

| Environment | LLM | STT |
|---|---|---|
| **Development** | `MockLLMProvider` — returns canned scores | `MockSTTProvider` — returns fixed transcript |
| **Staging** | OpenAI GPT-4o | OpenAI Whisper |
| **Production** | Configurable via `LLM_PROVIDER` env | Configurable via `STT_PROVIDER` env |

### LLM system prompt (from PRODUCT.md)

> Act as the Feynman Evaluation Master. Compare the user's simplified explanation against the source note text. Evaluate clarity, missing key concepts, and inaccuracies. Return a score out of 10 and constructive breakdown.

Use structured output (JSON mode) for reliable parsing.

### Tasks

- [ ] Multipart upload handler with 10 MB audio limit.
- [ ] Upload audio to MinIO/S3; store key in `Evaluation.audioUrl`.
- [ ] Async option: return `202 Accepted` with `evaluationId` + polling endpoint for long audio files.
- [ ] Rate limit evaluations per plan (stub: 10/day for free — enforced in Phase 6).
- [ ] Map response to PRODUCT.md §4.3 schema including `updatedNoteState` (computed from note after evaluation).

### Agile hooks

- Evaluation pipeline is a **composable chain** — add plagiarism check, language detection, or rubric templates as new steps.
- `feedback` stored as an embedded subdocument — add fields (e.g. `rubricScores`) without migrations.
- Queue-based processing (BullMQ) optional in this phase, required in Phase 8.

### Exit criteria

- Text evaluation returns valid PRODUCT.md response.
- Voice evaluation transcribes + evaluates end-to-end (with real or mock providers).
- Evaluation history queryable per user.

---

## Phase 5 — Spaced Repetition & Dashboard Analytics

### Objective
Implement the SuperMemo SM-2 algorithm and exam-mode compression logic, powering the dashboard and calendar review scheduling.

### SM-2 Algorithm (from PRODUCT.md §4.3)

```
quality = mapScoreToQuality(lectorScore)  // 0–5 scale
EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
if quality < 3:
    repetition = 0, interval = 1
else:
    repetition += 1
    interval = repetition == 1 ? 1 : repetition == 2 ? 6 : round(interval * EF')
nextReviewDate = today + interval (days)
```

### Exam Mode compression (from `NotesContext.tsx`)

When `studyMode === 'exam'` and `examTargetDate` is set:
- Compress intervals so all topics are reviewed before the exam.
- Formula: `daysAdd = max(1, min(2, floor(daysLeft / 3)))` (current frontend logic — refine with SM-2 overlay).

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Aggregated stats for `Dashboard.tsx` |
| `GET` | `/api/v1/dashboard/due-today` | Notes due for review today |
| `GET` | `/api/v1/dashboard/retention-health` | Per-note and average retention |
| `POST` | `/api/v1/notes/:id/recalculate` | Manual trigger after evaluation (internal) |

### Dashboard summary response

```json
{
  "avgLectorScore": 9.07,
  "retentionAverage": 90,
  "totalSessionsToday": 3,
  "dueTodayCount": 2,
  "recentExplanations": [ /* last 10 PracticeExplanation shape */ ]
}
```

### Service design

```typescript
// modules/analytics/spaced-repetition.service.ts
class SpacedRepetitionService {
  calculateNextReview(note: Note, quality: number, settings: CalendarSettings): ReviewResult;
  applyExamModeCompression(interval: number, examDate: Date): number;
  computeRetentionHealth(correctness: number, clarity: number, completeness: number): number;
}
```

Pure functions — fully unit-testable with table-driven tests.

### Tasks

- [x] Wire SM-2 update into evaluation pipeline (Phase 4 callback).
- [x] Update `Note` SM-2 fields + `nextReviewDate` + `retentionHealth` after each evaluation.
- [x] `recordPracticeSession` equivalent now lives server-side.
- [x] Dashboard aggregation via MongoDB aggregation pipeline (`$match`, `$group`, `$avg`).
- [x] `GET /dashboard/due-today` returns notes where `nextReviewDate <= today`.

### Agile hooks

- Algorithm behind `RepetitionStrategy` interface — swap SM-2 for FSRS or custom LECTOR algorithm later.
- `studyMode` behavior configured via strategy pattern, not if/else spaghetti.

### Exit criteria

- After evaluation, note's `nextReviewDate` and `retentionHealth` update correctly.
- Dashboard summary matches what frontend currently computes from localStorage.
- Unit tests cover SM-2 edge cases (quality < 3 resets, EF floor at 1.3).

---

## Phase 6 — Subscriptions & LLM Token Billing

### Objective
Implement subscription plans and checkout, gating evaluation usage per PRODUCT.md §4.5 and `LLMPayment.tsx`.

### Plans (from frontend)

| Plan ID | Name | Evaluations/day | Voice | Exam Mode |
|---|---|---|---|---|
| `starter` | Starter | 10 | No | Basic |
| `pro` | Pro Mastery | Unlimited | Yes | Full |
| `team` | Team Edu | Unlimited | Yes | Full + sharing |

### API Endpoints

| Method | Path | PRODUCT.md |
|---|---|---|
| `POST` | `/api/v1/subscriptions/checkout` | §4.5 |
| `GET` | `/api/v1/subscriptions/current` | Add |
| `POST` | `/api/v1/subscriptions/cancel` | Add |
| `GET` | `/api/v1/subscriptions/plans` | Add — list available plans |

### Database Schema

**Collection:** `subscriptions`

```typescript
// src/models/Subscription.ts
const SubscriptionSchema = new Schema({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planId:           { type: String, enum: ['starter', 'pro', 'team'], required: true },
  status:           { type: String, enum: ['active', 'canceled', 'past_due', 'trialing'], default: 'active' },
  billingCycle:     { type: String, enum: ['monthly', 'annual'], required: true },
  externalId:       { type: String },  // Stripe subscription ID
  currentPeriodEnd: { type: Date },
}, { timestamps: true });
```

**Collection:** `usage_records`

```typescript
// src/models/UsageRecord.ts
const UsageRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:   { type: String, enum: ['evaluation', 'stt_minutes'], required: true },
  count:  { type: Number, default: 1 },
  date:   { type: Date, required: true },  // normalized to UTC midnight
}, { timestamps: { createdAt: true, updatedAt: false } });

UsageRecordSchema.index({ userId: 1, type: 1, date: 1 }, { unique: true });
```

### Tasks

- [x] `PaymentProvider` port with `MockPaymentProvider` (dev) and `StripeProvider` (prod).
- [x] Checkout creates/updates subscription; returns PRODUCT.md response shape.
- [x] Usage middleware on `POST /evaluations/feynman` — check daily limits.
- [x] Webhook handler: `POST /api/v1/webhooks/stripe` for payment events.
- [x] Default new users to `starter` plan.

### Agile hooks

- Plan definitions in config/DB, not hardcoded — marketing can add plans without deploy.
- Usage limits enforced via `UsagePolicy` service, not scattered checks.

### Exit criteria

- Checkout flow works with mock payment token.
- Free user blocked after 10 evaluations/day with clear 429 response.
- `GET /subscriptions/current` returns active plan info.

---

## Phase 7 — Frontend Integration & API Client Layer

### Objective
Replace all `localStorage` persistence in `AuthContext.tsx` and `NotesContext.tsx` with API calls, using a feature flag for gradual rollout.

### New frontend files

```
src/
├── lib/
│   └── api/
│       ├── client.ts          # fetch wrapper with auth header + error handling
│       ├── auth.api.ts
│       ├── notes.api.ts
│       ├── calendar.api.ts
│       ├── evaluations.api.ts
│       ├── dashboard.api.ts
│       └── subscriptions.api.ts
├── hooks/
│   ├── useNotesQuery.ts       # optional: React Query wrappers
│   └── useAuth.ts
└── types/
    └── api.ts                 # shared types mirroring OpenAPI schemas
```

### Migration strategy (one context at a time)

| Step | Context method | API call | Fallback |
|---|---|---|---|
| 1 | `login` / `logout` | `POST /auth/login` | localStorage if `VITE_USE_API=false` |
| 2 | `addNote`, `updateNote`, `deleteNote` | Notes CRUD | localStorage |
| 3 | `setStudyMode`, `addImportantDate` | Calendar endpoints | localStorage |
| 4 | `recordPracticeSession` | `POST /evaluations/feynman` | localStorage |
| 5 | Dashboard aggregates | `GET /dashboard/summary` | computed locally |

### API client pattern

```typescript
// src/lib/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('memoroute_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

### Tasks

- [ ] Add `VITE_API_URL` and `VITE_USE_API` to frontend `.env`.
- [ ] Store JWT in `localStorage` as `memoroute_token` (or httpOnly cookie if same-origin).
- [ ] Update `AuthContext` to call register/login APIs.
- [ ] Update `NotesContext` methods to call backend; keep optimistic UI updates.
- [ ] Update `NewConcept.tsx` to POST multipart evaluation.
- [ ] Update `LLMPayment.tsx` to call checkout API.
- [ ] Add loading/error states to all pages.
- [ ] Remove or gate localStorage writes behind `!USE_API`.

### Agile hooks

- API client is the **single integration point** — backend URL or auth strategy changes touch one file.
- Consider `@tanstack/react-query` for caching/refetch — optional but reduces context complexity.

### Exit criteria

- Full user journey works with `VITE_USE_API=true`: register → login → create note → practice → see dashboard update.
- `VITE_USE_API=false` still works offline with localStorage (demo mode).

---

## Phase 8 — Background Workers, Notifications & Production Hardening

### Objective
Add async processing, daily retention decay, notification dispatch, and production-ready observability.

### Workers

| Job | Schedule | Purpose |
|---|---|---|
| `retention-decay` | Daily 00:00 UTC | Decrease `retentionHealth` for overdue notes (Ebbinghaus curve) |
| `due-review-reminder` | Daily 08:00 UTC | Email/push for notes due today |
| `evaluation-processor` | On demand (queue) | Long-running voice evaluations |
| `usage-reset` | Daily 00:00 UTC | Reset daily evaluation counters |

### Retention decay formula (suggested)

```
daysOverdue = today - nextReviewDate
if daysOverdue > 0:
    retentionHealth = max(0, retentionHealth - (daysOverdue * 5))
```

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/notifications` | In-app notification feed |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark read |
| `GET` | `/api/v1/users/settings/notifications` | Email/push preferences |

### Production checklist

- [ ] HTTPS + secure headers (helmet).
- [ ] Structured logging with request IDs (pino → JSON).
- [ ] Error tracking (Sentry).
- [ ] MongoDB connection pooling (`maxPoolSize: 50` in Mongoose options).
- [ ] Rate limiting per user (not just per IP).
- [ ] Backup strategy (mongodump cron or MongoDB Atlas automated backups).
- [ ] CI/CD pipeline: test → build → deploy.
- [ ] Load test evaluation endpoint (target: 50 concurrent users).
- [ ] API versioning deprecation policy documented.

### Agile hooks

- Workers consume domain events — adding a new side effect (Slack alert, analytics) means subscribing to events, not editing evaluation handler.
- Notification channels behind `NotificationProvider` port (email, push, in-app).

### Exit criteria

- Daily cron jobs run in staging without manual trigger.
- Overdue notes show decreased retention on dashboard.
- Production deployment documented in README.

---

## 14. Cross-Phase Concerns

### Error response standard (all phases)

```json
{
  "error": {
    "code": "NOTE_NOT_FOUND",
    "message": "Note with id note-1 not found",
    "details": {}
  }
}
```

### HTTP status codes

| Code | Usage |
|---|---|
| `200` | Success |
| `201` | Created (register, create note) |
| `202` | Accepted (async evaluation) |
| `400` | Validation error |
| `401` | Missing/invalid token |
| `403` | Forbidden (plan limit) |
| `404` | Resource not found |
| `429` | Rate limit / usage limit |
| `500` | Internal error |

### Security (apply from Phase 1 onward)

- Never log passwords or JWTs.
- Sanitize Markdown content (XSS prevention on render — frontend concern, but validate size).
- Audio files: virus scan hook (optional), MIME type validation.
- NoSQL injection prevented — validate all inputs with Zod; never pass raw user objects into `$where`.
- CORS restricted to known origins in production.

### Testing pyramid

| Layer | Tool | Coverage target |
|---|---|---|
| Unit | Vitest | SM-2, serializers, validators — 90%+ |
| Integration | Supertest + Testcontainers | All API endpoints — 80%+ |
| E2E | Playwright (optional) | Critical user flows — key paths |

---

## 15. localStorage → API Migration Map

| localStorage Key | Frontend file | Backend phase | API endpoint(s) |
|---|---|---|---|
| `memoroute_auth` | `AuthContext.tsx` | Phase 1 | `POST /auth/login`, `POST /auth/register` |
| `memoroute_notion_notes` | `NotesContext.tsx` | Phase 2 | `GET/POST/PATCH/DELETE /notes` |
| `memoroute_practice_explanations` | `NotesContext.tsx` | Phase 4 | `GET /evaluations` |
| `memoroute_study_mode` | `NotesContext.tsx` | Phase 3 | `GET/POST /calendar/settings` |
| `memoroute_exam_target_date` | `NotesContext.tsx` | Phase 3 | `GET/POST /calendar/settings` |
| `memoroute_exam_title` | `NotesContext.tsx` | Phase 3 | `GET/POST /calendar/settings` |
| `memoroute_important_dates` | `NotesContext.tsx` | Phase 3 | `GET/POST /calendar/important-dates` |
| `memoroute_llm_plan` | `LLMPayment.tsx` | Phase 6 | `GET /subscriptions/current` |

---

## 16. Risk Register & Change Buffers

| Risk | Impact | Mitigation | Phase |
|---|---|---|---|
| LLM API costs spike | High | Usage limits (Phase 6), caching similar evaluations, mock provider for dev | 4, 6 |
| LLM response inconsistency | Medium | Structured JSON output, Zod validation, retry with fallback prompt | 4 |
| Audio upload latency | Medium | Async queue (Phase 8), client-side compression | 4, 8 |
| SM-2 vs frontend logic mismatch | Medium | Port frontend formula first, then refine; snapshot tests | 5 |
| Payment provider change | Low | `PaymentProvider` port abstraction | 6 |
| Schema changes break frontend | Medium | OpenAPI codegen for shared types, API versioning | 0, 7 |
| Team wants GraphQL instead of REST | Low | Service layer is GraphQL-agnostic; add Apollo layer later | Any |

### Built-in change buffers

1. **API versioning** — `/api/v1/` allows v2 without breaking clients.
2. **Embedded subdocuments** — `feedback`, future metadata without schema migrations.
3. **Port interfaces** — swap external services via env config.
4. **Feature flags** — ship code dark, enable when ready.
5. **Event system** — new features subscribe to events, don't fork handlers.

---

## 17. Definition of Done (per phase)

Each phase is complete when:

- [ ] All endpoints for the phase are implemented and match OpenAPI spec.
- [ ] Mongoose model updated and `migrate-mongo` script applied (if indexes changed).
- [ ] Unit tests pass for service logic.
- [ ] Integration tests pass for API routes.
- [ ] `.env.example` updated with new variables.
- [ ] Phase section in this document marked with completion date.
- [ ] Demoable via curl/Postman/Swagger UI without frontend.
- [ ] Code reviewed and merged to `main`.

---

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| 0 — Foundation | ✅ Complete | 2026-09-18 | Monorepo + API skeleton shipped |
| 1 — Authentication | ✅ Complete | 2026-09-18 | JWT register/login/refresh/me |
| 2 — Notes | ✅ Complete | 2026-09-18 | Notes CRUD + debounced PATCH sync |
| 3 — Calendar | ✅ Complete | 2026-09-18 | Settings + important dates API |
| 4 — Evaluations | ✅ Complete | 2026-09-18 | Feynman text/voice evaluation API |
| 5 — Spaced Repetition | ⬜ Not started | — | |
| 6 — Billing | ⬜ Not started | — | |
| 7 — Frontend Integration | ⬜ Not started | — | |
| 8 — Workers & Hardening | ⬜ Not started | — | |

---

## Quick Start (after Phase 0)

```bash
# From repo root
npm install
npm run docker:up          # MongoDB, Redis, MinIO
cp apps/api/.env.example apps/api/.env
npm run migrate:up
npm run dev:all            # web :43123 + api :3000
```

---

*This document is the single source of truth for backend development phasing. Update the [Phase Completion Log](#phase-completion-log) as each phase ships.*
