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
- `app/` — App Router (`layout.tsx` sets RTL + Cairo, `page.tsx` is the status demo)
- `app/globals.css` — design tokens + base styles

## Next
Build the real screens (cases, sessions, clients, invoices) against the legal-back API, using a
shared component library. The prototype's `mobile.html` is the spec for mobile daily-companion flows.
