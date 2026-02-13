# Architecture

- **Web app** consumes REST and WebSocket `/events` for tick/news.
- **API** serves auth, profile, airline ops, economy, leaderboard and admin.
- **PostgreSQL** stores persistent entities and immutable ledger.
- **Redis/BullMQ** prepared for scheduled jobs, retries, dead-letter queues.
- **Tick engine** runs every 5 minutes (1 in-game hour) and writes ledger outcomes.
