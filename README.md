# Agribnv

Farm stays and agricultural experiences across the Philippines.

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui + Radix primitives
- Supabase (auth, database, realtime, edge functions)
- React Query, React Hook Form + Zod, React Router
- MapLibre GL, Recharts, Framer Motion
- Vitest + Testing Library

## Getting started

Requires Node.js 18+ and npm.

```sh
# Install dependencies
npm install

# Copy env template and fill in Supabase values
cp .env.example .env

# Start the dev server (http://localhost:8080)
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Environment variables

All client-side env vars are `VITE_*` prefixed and get bundled into the browser build — do not put secrets here. The Supabase `PUBLISHABLE_KEY` is the anon key and is safe to expose.

| Var | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |

## Project layout

- `src/` — application code (pages, components, hooks, lib)
- `supabase/` — migrations and edge functions
- `public/` — static assets
