# legal-front — Web app (Next.js + TypeScript)

The web front end for the Legal Platform. RTL Arabic, Cairo font, and the design tokens
(`--accent` / `--gold`) ported from the prototype. Talks to the **legal-back** API.

## Prerequisites
- Node 20+ / npm
- A running **legal-back** API (default `http://localhost:5080`) and **legal-db** (Postgres + Redis)

## Getting started
```bash
cp .env.example .env.local        # set NEXT_PUBLIC_API_BASE_URL if not :5080
npm install
npm run dev                       # http://localhost:3000
```
The home page calls `${NEXT_PUBLIC_API_BASE_URL}/health/ready` to prove the front↔back wire.
(legal-back's CORS allows `http://localhost:3000`.)

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run lint`

## Structure
- `app/login` — Nafath login: national id → match number → (test) simulate approval → poll → store JWT
- `app/cases` — authenticated cases list + create (redirects to `/login` without a token)
- `app/page.tsx` — redirects to `/cases`
- `lib/api.ts` — typed legal-back client · `lib/auth.ts` — token storage
- `app/globals.css` — design tokens + base styles

## Try it (needs legal-db + legal-back running)
```bash
npm run dev            # http://localhost:3000 → /login
# sign in with a seeded national id: 1111111111 (Firm A admin), then "simulate approval"
```

## Next
Real screens (sessions, clients, invoices) against the legal-back API; a shared component library;
replace the test "simulate approval" with the real Nafath app step. `mobile.html` specs the mobile flows.
