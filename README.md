# Campus Study Spot Finder

A mobile-first campus app that helps students discover the best nearby study environment based on their current location, preferred study mode, and campus vibe.

## Overview

Campus Study Spot Finder is designed for students who need to quickly answer questions like:

- Where can I study quietly for an exam?
- Which place has the best Wi-Fi for a long work session?
- Is there a coworking-friendly space nearby for group review?
- Where can I get a quick coffee and still stay productive?

The app ranks study locations using a mix of user location, spot quality, noise level, Wi-Fi strength, outlet access, and current work mode.

## Features

- Live geolocation-aware recommendations
- Smart ranking for nearby campus spaces
- Study mode filters:
  - Deep focus
  - Group review
  - Quick recharge
- Search and filter options for vibe, Wi-Fi, outlets, and crowd level
- Save favorite study spots locally
- Community review cards with student feedback
- Interactive study assistant chat
- Mobile-first, app-style interface

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React icons

## Project Structure

```text
campus-study-spot-finder/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── study-spot-finder.tsx
├── lib/
│   └── mock-data.ts
├── postgres/
│   └── schema.sql
├── public/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev -- --hostname 0.0.0.0
```

Then open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
```

## Notes

This version uses a realistic campus dataset and geolocation-based scoring in the frontend. If you want a production-ready app, the next step would be connecting it to a backend or campus database with live occupancy and real venue data.

## Roadmap

- Real backend API for campus locations
- Admin panel to manage study spaces
- Map integration with walking directions
- Real-time occupancy indicators
- Authentication and saved student preferences
- Deployment to Vercel or another hosting platform

## Repository

```text
https://github.com/Isha-2325/Campus-study-spot-finder.git
```
