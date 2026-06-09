# Czy pójdziesz ze mną na randkę?

Romantyczna aplikacja webowa do wysyłania propozycji randkowych przez Instagram/Messenger — z unikalnym linkiem, panelem admina i powiadomieniami email.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/randka run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Email: Nodemailer (Gmail SMTP)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — DB schema (dateLinks, visits, bookings)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/email.ts` — Email notification utility
- `artifacts/api-server/src/lib/geo.ts` — IP geolocation utility
- `artifacts/randka/src/` — React frontend

## Architecture decisions

- All unique date links stored in `date_links` table with short UUID IDs (12 chars)
- Visit tracking records IP + geolocation (via ipapi.co) on each `/l/:linkId` load
- Admin auth is stateless — password checked server-side, random token returned and stored in localStorage
- Email notifications are fire-and-forget (non-blocking) using nodemailer + Gmail SMTP
- Frontend state (linkId, chosen date type) passed between steps via localStorage

## Product

- Share a unique link via Instagram/Messenger with a romantic date proposal
- Recipient sees "Czy pójdziesz ze mną na randkę?" with TAK/NIE buttons
- NIE button escapes the cursor/touch so it's nearly impossible to click
- TAK flow: choose date type → pick date/time → confirm → confetti celebration
- Owner admin panel at `/admin` with password `EdmundoOw#123`

## User preferences

- Language: Polish UI
- Notification email: Edmundowoc745@gmail.com
- Admin password: stored in ADMIN_PASSWORD env var

## Gotchas

- Email requires GMAIL_APP_PASSWORD env var (Gmail App Password, not regular password)
  - Enable 2FA on Gmail first, then generate App Password at myaccount.google.com/apppasswords
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs`
- Express 5 wildcard routes require named params: `/{*splat}` not `*`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
