# Economy design (MVP)

Parameters are stored in `EconomyConfig` and editable from admin.
This enables balancing without code redeploy.

Anti-cheat:
- server authority on all economic actions
- transaction boundaries for cash & ledger
- idempotency key for purchases
- planned anomaly detector for outlier profits
