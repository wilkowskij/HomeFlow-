# homeflow-api

REST API for HomeFlow — AI-powered home buying companion. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Auth**: JWT + bcryptjs
- **AI**: Anthropic SDK (claude-sonnet-4-20250514)
- **Validation**: Zod
- **Logging**: Winston

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma migrate dev --name init

# Start development server (with hot reload)
npm run dev
```

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start with ts-node-dev hot reload |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled dist/index.js |
| `npm run lint` | ESLint check |
| `npx prisma studio` | Open Prisma database UI |
| `npx prisma migrate dev` | Run migrations |

## API Endpoints

### Auth `POST /api/auth/*`
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Refresh JWT |
| GET | `/auth/oauth/google` | Google OAuth |

### Properties `GET /api/properties/*`
| Method | Path | Description |
|---|---|---|
| GET | `/properties` | Search with filters |
| GET | `/properties/recommendations` | AI-curated matches |
| GET | `/properties/:id` | Property detail |
| GET | `/properties/:id/availability` | Available slots |
| GET | `/properties/:id/neighborhood` | Neighborhood data |

### Schedule `POST /api/schedule/*`
| Method | Path | Description |
|---|---|---|
| GET | `/schedule` | List appointments |
| POST | `/schedule` | Book appointment |
| PATCH | `/schedule/:id` | Update appointment |
| DELETE | `/schedule/:id` | Cancel appointment |
| POST | `/schedule/itinerary/optimize` | AI route optimization |

### Journey `GET /api/journey/*`
| Method | Path | Description |
|---|---|---|
| GET | `/journey` | Get pipeline state |
| PATCH | `/journey/stage/:id/task/:id` | Toggle task |
| POST | `/journey/advance` | Advance stage |
| POST | `/journey/agent/connect` | Connect agent |
| GET | `/journey/documents` | Document checklist |

### Chat `POST /api/chat/*`
| Method | Path | Description |
|---|---|---|
| POST | `/chat` | Send message |
| POST | `/chat/stream` | Streaming response (SSE) |
| GET | `/chat/suggestions` | Context-aware suggestions |

### Users `GET /api/users/*`
| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |
| PATCH | `/users/me/buyer-profile` | Update buyer profile |
| GET | `/users/me/saved-homes` | Saved homes list |
| POST | `/users/me/saved-homes/:id` | Save a home |
| DELETE | `/users/me/saved-homes/:id` | Remove saved home |

## Environment Variables
See `.env.example` for all required variables.

## Database
Uses PostgreSQL via Prisma ORM. Key models: `User`, `BuyerProfile`, `Property`, `SavedHome`, `ViewingAppointment`, `JourneyPipeline`, `ChatSession`, `ChatMessage`.

## Docker
```bash
docker build -t homeflow-api .
docker run -p 3001:3001 --env-file .env homeflow-api
```
Or use the root `docker-compose.yml` to run the full stack.
