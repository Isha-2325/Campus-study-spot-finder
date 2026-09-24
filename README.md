# QuietFind

QuietFind is a mobile-first campus study companion that helps students discover the best nearby study spaces based on location, vibe, quiet level, Wi‑Fi quality, and peer reviews.

It is built for students who want a quick answer to questions like:

- Where is the quietest place to study right now?
- Which nearby space has the strongest Wi‑Fi?
- Where can I work with a group without getting distracted?
- Which campus spots are best for deep focus or quick revision?

## Why QuietFind

QuietFind combines the convenience of a guided mobile app with a practical campus recommendation engine. It is designed to help students move quickly from signup to location-based discovery without overloading them with cluttered or complicated UI.

## Core Features

- Mobile-first onboarding flow
- Email or mobile sign-up flow with OTP simulation
- Location-aware campus recommendations
- Area-based discovery and filtering
- Sorting by study needs and preferences
- Quiet, café, coworking, and outdoor quiet-zone options
- Review-based spot ranking
- Real backend-ready architecture with PostgreSQL
- Graceful fallback to mock data when the database is not connected

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- pg client
- OpenStreetMap-based embedded map views
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

Create your local environment file from the sample:

```bash
copy .env.example .env.local
```

Then update `.env.local` with your local values:

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

If you want seed data for campus areas and study spots, run:

```bash
psql -U postgres -d campus_study_spot_finder -f postgres/seed.sql
```

### 4. Run the app locally

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

## API Overview

The app exposes the following backend endpoints:

- `GET /api/study-spots` — fetch campus areas and study spots
- `GET /api/reviews` — fetch reviews by spot
- `POST /api/reviews` — submit a student review
- `POST /api/auth` — sign-up and OTP flow
- `GET /api/health` — check app and database health

If no database is configured, the app falls back to the local mock dataset so development can continue smoothly.

## Notes

This project is structured as a real full-stack app rather than a static mock prototype. The backend is PostgreSQL-ready, and the frontend gracefully falls back to local data until a live database connection is configured.

## Roadmap

- Optional upgrade to a paid map provider later
- Real SMS or email OTP provider
- Live occupancy and availability data
- Campus admin dashboard
- Saved user preferences and personal study history
- Deployment to Vercel or another hosting platform

## License

This project is currently for learning and product prototyping purposes.
