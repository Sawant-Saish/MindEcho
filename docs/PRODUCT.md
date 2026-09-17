# LECTOR (MindEcho) — Product & Backend Developer Handover Specification

## 1. Executive Product Overview

**LECTOR (MindEcho)** is an intelligent AI-powered cognitive learning platform based on the **Feynman Technique** and **Adaptive Spaced Repetition**.

### Problem Addressed
- **The Illusion of Competence**: Passive reading and highlighting lead to rapid memory decay (Ebbinghaus Forgetting Curve). Learners feel they understand a concept when reading, but fail during exams or real-world recall.
- **Suboptimal Revision Timing**: Traditional calendars use static intervals rather than adapting to individual retention strength or upcoming exam deadlines.

### The LECTOR Solution
1. **Feynman Technique Voice & Text Studio**: Learners explain concepts in their own simple words using voice recording or written responses.
2. **Adaptive Spaced Repetition Engine**: Calculates retention decay curves and dynamic review intervals based on explanation accuracy.
3. **Dual Study Modes**:
   - **Exam Mode**: Compresses revision frequencies dynamically to ensure 100% topic mastery before a target exam date.
   - **Skill Mastery Mode**: Expands review intervals gradually for lifelong retention without arbitrary time pressure.
4. **Notion-Style Workspace**: Interactive notes repository with live reading progress tracking (`ReadingProgress`) and word-count-based reading time estimates.

---

## 2. Tech Stack & Frontend Architecture

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 8 (TypeScript) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design Tokens (Dark Mocha & Warm Gold Theme) |
| **Icons & UI** | Lucide React + ShadCN Component Pattern |
| **Animations** | Framer Motion + Motion/React + Canvas Confetti + NumberFlow |
| **State Management** | React Context API (`AuthContext`, `NotesContext`) + LocalStorage fallback |
| **Routing** | React Router v7 (`BrowserRouter`) |

---

## 3. Frontend Route Map & Page Descriptions

| Route | Component | Purpose & Features |
|---|---|---|
| `/` | `Landing.tsx` | High-converting landing page with Hero, Cognitive Problem explanation, 4-Pillar Solutions, 6-Member Team Scroll, Literature Research Paper Sample, and Interactive Contact Form. |
| `/dashboard` | `Dashboard.tsx` | Central analytics hub featuring Spaced Repetition Grid (`LearningDashboardGrid`), Retention Health charts, Due Today items, and Quick Practice triggers. |
| `/subjects` | `NotionWorkspace.tsx` | Notion-style multi-note workspace. Features Markdown viewer, live `ReadingProgress` bar, search/filter, and direct "Start Practice Test" actions. |
| `/concept/new` | `NewConcept.tsx` | Feynman Technique Practice Studio. Supports voice recording via Web Audio API, document uploads, step-by-step prompts, and self-evaluation matrix. |
| `/calendar` | `AdaptiveCalendar.tsx` | Interactive Spaced Repetition Calendar. Allows toggling Exam Mode vs. Skill Mode, setting target exam dates, marking important events, and viewing scheduled review dates. |
| `/payment` | `LLMPayment.tsx` | Interactive Starfield Pricing Toggle (`PricingSection`) with Monthly/Annual 20% discount confetti switch, plan selection, and payment card checkout interface. |
| `/login` | `Login.tsx` | Authentication login page with dark mocha aesthetic. |

---

## 4. Backend Developer API Integration Contracts

The backend developer should build a REST or GraphQL API (e.g. Node.js/Express, FastAPI, Go, or Django) matching the following endpoint contracts.

### 4.1 Authentication Endpoints

#### `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`**:
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

#### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jane@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**: Same schema as register response.

---

### 4.2 Notes & Knowledge Repository API

#### `GET /api/notes`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "note-1",
      "title": "Binary Search Trees & Traversal",
      "subject": "Computer Science",
      "icon": "code",
      "content": "# Binary Search Trees (BST)\n...",
      "createdAt": "2026-09-10T00:00:00Z",
      "updatedAt": "2026-09-17T00:00:00Z",
      "lectorScore": 9.2,
      "practiceCount": 4,
      "lastPracticed": "2026-09-17",
      "retentionHealth": 94,
      "nextReviewDate": "2026-09-20"
    }
  ]
  ```

#### `POST /api/notes`
- **Request Body**:
  ```json
  {
    "title": "Quantum Physics Fundamentals",
    "subject": "Physics & Engineering",
    "icon": "zap",
    "content": "# Wave-Particle Duality\n..."
  }
  ```

#### `DELETE /api/notes/:id`
- **Response `200 OK`**: `{ "success": true, "deletedId": "note-1" }`

---

### 4.3 Feynman Voice/Text Evaluation & LLM Engine API

#### `POST /api/evaluations/feynman`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Parameters**:
  - `noteId` (string, required)
  - `explanationText` (string, optional)
  - `audioFile` (file/blob audio/webm, optional)
  - `selfRating` (number 1-10, optional)
- **Backend LLM Processing Logic**:
  1. If `audioFile` is provided, transcribe audio to text using Whisper / Speech-to-Text API.
  2. Prompt LLM (OpenAI GPT-4o / Gemini 1.5 Pro) with system instructions:
     > *"Act as the Feynman Evaluation Master. Compare the user's simplified explanation against the source note text. Evaluate clarity, missing key concepts, and inaccuracies. Return a score out of 10 and constructive breakdown."*
  3. Calculate SuperMemo SM-2 Spaced Repetition interval updates:
     - New `easinessFactor` $EF' = EF + (0.1 - (5 - \text{quality}) \times (0.08 + (5 - \text{quality}) \times 0.02))$
     - New `nextReviewDate` based on SM-2 interval or compressed Exam Mode interval.
- **Response `200 OK`**:
  ```json
  {
    "evaluationId": "eval_88712",
    "noteId": "note-1",
    "lectorScore": 8.8,
    "transcript": "A binary search tree keeps smaller numbers on the left and larger numbers on the right...",
    "feedback": {
      "strengths": ["Correctly identified BST node ordering rules", "Clear explanation of in-order traversal"],
      "missingConcepts": ["Did not mention deletion case for nodes with two children"],
      "improvementTip": "Practice explaining in-order successor replacement."
    },
    "updatedNoteState": {
      "practiceCount": 5,
      "lastPracticed": "2026-09-18",
      "retentionHealth": 92,
      "nextReviewDate": "2026-09-23"
    }
  }
  ```

---

### 4.4 Adaptive Calendar & Exam Mode API

#### `GET /api/calendar/settings`
- **Response `200 OK`**:
  ```json
  {
    "studyMode": "exam",
    "examTargetDate": "2026-09-25",
    "examTitle": "Final CS Midterm Exam"
  }
  ```

#### `POST /api/calendar/settings`
- **Request Body**:
  ```json
  {
    "studyMode": "exam",
    "examTargetDate": "2026-09-25",
    "examTitle": "Final CS Midterm Exam"
  }
  ```

#### `GET /api/calendar/important-dates`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "date-1",
      "title": "Final CS Midterm Exam",
      "date": "2026-09-25",
      "subject": "Computer Science",
      "priority": "high",
      "description": "Covers BSTs, Graph Algorithms, and Backpropagation."
    }
  ]
  ```

#### `POST /api/calendar/important-dates`
- **Request Body**:
  ```json
  {
    "title": "Physics Thermodynamics Quiz",
    "date": "2026-09-28",
    "subject": "Physics & Engineering",
    "priority": "medium",
    "description": "Carnot engine efficiency and Second Law entropy."
  }
  ```

---

### 4.5 Subscriptions & LLM Token Billing API

#### `POST /api/subscriptions/checkout`
- **Request Body**:
  ```json
  {
    "planId": "pro",
    "billingCycle": "monthly",
    "paymentToken": "tok_mock_card_1234"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "subscriptionId": "sub_9921",
    "status": "active",
    "currentPeriodEnd": "2026-10-18T00:00:00Z"
  }
  ```

---

## 5. Local Storage Fallback Keys (Current Frontend Mocking)

Until backend API integration is attached, the frontend persists key state using browser `localStorage`:
- `memoroute_notes`: Array of `NoteItem` objects.
- `memoroute_important_dates`: Array of `ImportantDateItem` objects.
- `memoroute_study_mode`: `'exam'` | `'skill'`.
- `memoroute_exam_date`: Target exam date string (`YYYY-MM-DD`).
- `memoroute_exam_title`: Target exam title string.
- `memoroute_llm_plan`: Selected subscription plan (`'free'` | `'pro'` | `'team'`).
- `memoroute_auth`: Authentication state flag & user profile.

---

## 6. How to Run & Build Project

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Production Build
npm run build
```

---

## 7. Handover Checklist for Backend Developer

- [ ] Implement JWT/OAuth authentication middleware.
- [ ] Connect PostgreSQL / MongoDB database for `users`, `notes`, `evaluations`, and `important_dates`.
- [ ] Integrate Speech-to-Text service (Whisper API or Deepgram) for audio explanation processing.
- [ ] Connect LLM API (OpenAI GPT-4o / Anthropic Claude / Google Gemini 1.5 Pro) for Feynman technique scoring.
- [ ] Implement SuperMemo SM-2 algorithm worker service for daily retention decay calculation and automated email/push notifications for due revisions.
- [ ] Replace `localStorage` calls in `src/context/NotesContext.tsx` with `fetch` / Axios REST API queries.
