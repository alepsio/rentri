# Skyward Nexus Tycoon (Monorepo)

MMO leggero browser-based airline tycoon, design originale, stack production-ready.

## Stack
- Web: Next.js + TypeScript + Tailwind + Zustand + React Query
- API: NestJS + Prisma + PostgreSQL + Redis + Socket.IO
- Queue/Tick: BullMQ-ready + scheduler tick ogni 5 minuti
- Auth: JWT access + refresh cookie rotante + argon2

## Monorepo
- `apps/web`
- `apps/api`
- `packages/shared`
- `infra`
- `docs`

## Quick start
```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
cp infra/.env.example apps/api/.env
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
pnpm dev
```

Web: `http://localhost:3000`
API: `http://localhost:4000/api`

## Security highlights
- Rate limiting Nest Throttler
- Password hashing argon2
- JWT access + refresh cookie httpOnly
- Idempotency key for monetary operations
- DB transactions for economic updates
- Audit log for admin actions

## Scripts
- `pnpm dev`
- `pnpm build`
- `pnpm test`
- `pnpm --filter api prisma:migrate`
- `pnpm --filter api prisma:seed`

## Roadmap short
Alliances, cargo contracts, dynamic slot auctions, advanced incidents, fuel hedging.
