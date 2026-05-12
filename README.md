# Pokémon TCG Deck Archive

Personal archive for physical Pokémon TCG decks. Tracks decklists per deck, card status (real / proxy / missing / ordered), era rules, and a buy list rolled up from everything that's still missing.

## Stack

| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | React + Vite, TanStack Router               |
| API      | Cloudflare Workers (Hono)                   |
| Database | Cloudflare D1 (SQLite)                      |
| Storage  | Cloudflare R2 (card images)                 |
| Auth     | Cloudflare Access (admin routes only)       |

## Getting started

```bash
cd apps/web && npm install
npm run dev
# → http://localhost:5173
```

The frontend runs on mock data in `apps/web/src/data/decks.ts`. No backend needed to browse the UI.

## Project structure

```
apps/
  web/    Vite + React frontend
  api/    Cloudflare Worker (Hono), all API routes
```

## Pages

| Route          | Description                                   |
|----------------|-----------------------------------------------|
| `/decks`       | Gallery of all decks with energy/era filters  |
| `/decks/:slug` | Deck detail: sleeve grid with card status     |
| `/stats`       | Buy list and collection overview              |
| `/eras/:slug`  | Era rules, primer, and associated decks       |
| `/formats`     | Browse all era blocks                         |

## Card status

Each copy of a card in a deck has one of four states: **Real** (physical card in hand), **Proxy** (printed and sleeved), **Missing** (not yet sourced), or **Ordered** (bought, in transit).

## Deploying

```bash
# Deploy the Worker
cd apps/api && npm run deploy

# Frontend deploys automatically on push to main via Cloudflare Pages
```