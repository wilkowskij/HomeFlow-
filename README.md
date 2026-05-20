# HomeFlow

**AI-powered home buying companion for New Jersey buyers.**

HomeFlow reduces the stress of buying a home by combining smart property recommendations, frictionless scheduling, a transparent pipeline tracker, and an always-available AI coach — all in a mobile-first experience.

---

## Repositories

| Repo | Description | Stack |
|---|---|---|
| `homeflow-shared` | Shared TypeScript types & constants | TypeScript |
| `homeflow-web` | Frontend app (all 5 MVP flows) | React 18, Vite, Tailwind, Zustand |
| `homeflow-api` | REST API + auth + DB | Node.js, Express, Prisma, PostgreSQL |
| `homeflow-ai-service` | AI recommendations, NLP search, insights | Python, FastAPI, Anthropic |
| `homeflow-infrastructure` | Docker Compose, CI/CD, Terraform | Docker, GitHub Actions, Terraform |

---

## MVP Features

1. **Onboarding & Profile** — guided questionnaire, budget/timeline, pre-approval upload
2. **Smart Search & Discovery** — map/list view, natural language search, AI "Smart Matches"
3. **Scheduling & Travel** — book viewings, AI-optimized multi-stop itinerary builder
4. **Pipeline Tracker ("My Journey")** — 5-stage visual pipeline, task checklists, agent connect
5. **AI Coach & Chat** — contextual guidance, proactive nudges, Anthropic-powered

---

## Quick Start (Local Dev)

### Option A — Docker Compose (recommended)

```bash
git clone <your-org>/homeflow-infrastructure
cd homeflow-infrastructure
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| AI Service | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Option B — pnpm workspaces (Node services only)

```bash
# Root of monorepo
corepack enable
pnpm install

# Terminal 1 — API
cd homeflow-api && cp .env.example .env && npm run dev

# Terminal 2 — Frontend
cd homeflow-web && cp .env.example .env && pnpm dev

# Terminal 3 — AI Service (Python)
cd homeflow-ai-service && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

---

## Environment Setup

Each service has an `.env.example`. The critical variable everywhere is:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key at https://console.anthropic.com

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 homeflow-web                    │
│       React + Vite + Tailwind + Zustand         │
│           Mobile-first, NJ-focused              │
└──────────────┬──────────────┬───────────────────┘
               │              │
     ┌─────────▼──────┐  ┌────▼───────────────────┐
     │  homeflow-api  │  │  homeflow-ai-service   │
     │  Express + JWT │  │  FastAPI + Anthropic   │
     │  Prisma + PG   │  │  Recommendations, NLP  │
     └─────────┬──────┘  └────────────────────────┘
               │
     ┌─────────▼──────┐
     │   PostgreSQL   │
     │     Redis      │
     └────────────────┘
```

---

## CI/CD

GitHub Actions workflows in `homeflow-infrastructure/.github/workflows/`:
- Push to `main` → lint → type-check → build → Docker push to GHCR
- PRs → lint + type-check only

---

## Tech Decisions

| Decision | Choice | Why |
|---|---|---|
| Frontend state | Zustand + persist | Simple, no boilerplate, mobile-friendly |
| AI chat | Direct Anthropic SDK | Low latency, streaming support |
| ORM | Prisma | Type-safe, great DX, easy migrations |
| Monorepo | pnpm workspaces | Lightweight, fast, no Turborepo complexity for MVP |
| Styling | Tailwind CSS | Rapid mobile-first development |
| Auth | JWT + refresh tokens | Stateless, works well with mobile |

---

## NJ Market Focus

Mock data includes properties in:
- **Freehold, NJ** — Monmouth County hub
- **Marlboro, NJ** — Top-rated schools, suburban
- **Howell, NJ** — Growing market, value plays

All AI responses are tuned for NJ buyers (commute to NYC, NJ Transit, school districts, market trends).

---

## Contributing

1. Branch from `develop`
2. PR title: `feat/`, `fix/`, `chore/`
3. CI must pass
4. Squash merge to `develop`, then PR to `main` for releases
