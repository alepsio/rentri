# SkyLedger Airlines

Browser game gestionale multiplayer in stile airline tycoon, sviluppato come progetto vendibile:

- Registrazione e login account con sessioni sicure (cookie HTTP-only).
- Gestione compagnia: cassa, reputazione, flotta, valore aziendale.
- Economia dinamica: prezzo carburante e domanda globale variabili nel tempo.
- Simulazione tratte con range aeromobile, costi operativi, ricavi passeggeri e profitto.
- Classifica globale e feed live via Server-Sent Events.

## Avvio

```bash
npm start
```

Apri `http://localhost:3000`.

## Stack

- Node.js HTTP server (senza dipendenze esterne)
- Frontend vanilla mobile-first
- Persistenza file JSON (`data/store.json`)

## Nota prodotto

Questo progetto è **ispirato ai simulatori airline manager**, ma con implementazione originale (brand, codice, struttura e contenuti proprietari).
