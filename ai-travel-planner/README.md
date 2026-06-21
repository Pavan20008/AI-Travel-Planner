# Trao AI Travel Planner

A secure, multi-user web application for creating, customizing, and saving AI-powered travel itineraries. Built with Express.js, Next.js, MongoDB, and Google Gemini.

## Features

- **JWT Authentication** — Secure user registration and login with bcrypt password hashing
- **AI Itinerary Generation** — Day-by-day plans via Google Gemini with budget-aware pricing
- **Dynamic Editing** — Add/remove activities, regenerate specific days with feedback
- **Budget Estimates** — Breakdown of transport, accommodation, food, and activities
- **Hotel Recommendations** — Tier-matched lodging suggestions
- **Weather-Aware Packing Assistant** — Climate and activity-based packing checklists with check-off tracking

## Project Structure

```
ai-travel-planner/
├── backend/          # Express.js REST API
│   ├── config/       # MongoDB connection
│   ├── middleware/   # JWT auth
│   ├── models/       # User & Trip schemas
│   ├── controllers/  # Auth & trip logic + Gemini integration
│   └── routes/       # API route bindings
└── frontend/         # Next.js App Router client
    └── src/
        ├── app/      # Pages (login, register, dashboard)
        ├── components/
        ├── types/
        └── utils/    # API client with auth headers
```

## Prerequisites

- Node.js 18.x or 20.x (LTS)
- MongoDB Atlas cluster (free tier)
- Google AI Studio API key ([Gemini](https://aistudio.google.com/))

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | Gemini model ID (default: gemini-2.0-flash) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## API Endpoints

### Auth (public)
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `GET /api/auth/me` — Current user (protected)

### Trips (protected — requires `Authorization: Bearer <token>`)
- `POST /api/trips/generate` — Generate new AI itinerary
- `GET /api/trips` — List user's trips
- `GET /api/trips/:id` — Get single trip
- `PUT /api/trips/:id` — Update trip (itinerary, packing list)
- `DELETE /api/trips/:id` — Delete trip
- `POST /api/trips/:id/activities` — Add activity to a day
- `DELETE /api/trips/:id/activities` — Remove activity from a day
- `POST /api/trips/:id/regenerate-day` — Regenerate a specific day via AI
- `POST /api/trips/:id/regenerate-packing` — Regenerate packing list via AI

## Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Connect repo, set root to `backend/`
3. Add environment variables from `.env.example`
4. Start command: `npm start`

### Frontend (Vercel)
1. Connect repo, set root to `frontend/`
2. Add environment variable: `NEXT_PUBLIC_API_URL` should point to your deployed backend URL
3. Deploy

> Note: The backend is a separate Express service and should be deployed on a Node.js host such as Render, Railway, or Heroku. The frontend on Vercel will call that backend via `NEXT_PUBLIC_API_URL`.

## Verification Checklist

| Test | Expected |
|---|---|
| GET `/api/trips` without auth header | HTTP 401 |
| User A creates trip, User B logs in | User B sees empty list |
| Invalid Gemini API key | Exponential backoff retries, then graceful 500 |
| Mobile viewport | Grid collapses to single column |

## License

ISC
