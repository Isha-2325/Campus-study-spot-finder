# QuietFind

A mobile-first campus study app that helps students discover the best nearby study environment based on location, study mode, and real campus feedback.

## Overview

Campus Study Spot Finder is designed for students who want a quick answer to questions like:

- Where is the quietest spot for revision?
- Which place has the best Wi‑Fi for a long session?
- Where can I study with a group nearby?
- Which campus spaces are best for focused work and low crowding?

The app ranks places using location, noise level, Wi‑Fi strength, outlet availability, crowd density, and study preference.

## Features

- Mobile-first onboarding flow
- Email/mobile sign-up with OTP simulation
- Location-aware recommendations
- Sort and filter controls
- Campus-area selection flow
- Save favorite study spots
- Student review cards and recommendation scoring
- Backend API ready for a real Postgres database
- Graceful fallback to local mock data when no database is configured

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- pg client
- OpenStreetMap-based map embeds for a free, no-billing setup
- Lucide React icons

## Project Structure

```text
campus-study-spot-finder/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── health/
│   │   ├── reviews/
│   │   └── study-spots/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── study-spot-finder.tsx
├── lib/
│   ├── db.ts
│   ├── mock-data.ts
│   └── ...
├── postgres/
│   ├── schema.sql
│   └── seed.sql
├── public/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── ...
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the sample env file:

```bash
copy .env.example .env.local
```

Update the values in `.env.local` for your local Postgres instance:

```env
NEXT_PUBLIC_MAP_PROVIDER=openstreetmap
NEXT_PUBLIC_MAP_EMBED_URL=https://www.openstreetmap.org/export/embed.html
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campus_study_spot_finder
NEXT_PUBLIC_APP_NAME=QuietFind
```

### 3. Start PostgreSQL

Create a local database named `campus_study_spot_finder` and then run the schema:

```bash
psql -U postgres -d campus_study_spot_finder -f postgres/schema.sql
```

If you want seed campus and study spot data, run:

```bash
psql -U postgres -d campus_study_spot_finder -f postgres/seed.sql
```

### 4. Run the app

```bash
npm run dev -- --hostname 0.0.0.0
```

Then open:

```text
http://localhost:3000
```

### 5. Production build

```bash
npm run build
```

## Backend API

The app already exposes these real backend routes:

- `GET /api/study-spots` — load campus areas and study spots
- `GET /api/reviews` — fetch reviews by spot
- `POST /api/reviews` — add a review
- `POST /api/auth` — sign-up and OTP flow
- `GET /api/health` — app and DB status check

If `DATABASE_URL` is missing or unreachable, the app falls back to mock local data so development can continue without a database.

## Notes

This is now structured as a real full-stack app rather than a static mock prototype. The backend is Postgres-ready, but the app still gracefully degrades to the local dataset until a live database is connected.

## Roadmap

- Optional upgrade to a paid map provider later
- Real SMS/email OTP provider
- Live occupancy and availability data
- Campus admin dashboard
- Authentication and saved student preferences
- Deployment to Vercel or another hosting platform
