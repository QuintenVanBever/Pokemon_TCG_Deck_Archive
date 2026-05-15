# Pokémon TCG Deck Archive

Personal archive for physical Pokémon TCG decks. Tracks decklists per deck, card status (real / proxy / missing / ordered), era rules, and a buy list rolled up from everything that's still missing.

## Stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Frontend | React 18 + Vite, TanStack Router, inline CSS  |
| API      | Cloudflare Workers (Hono 4.6)                 |
| Database | Cloudflare D1 (SQLite)                        |
| Storage  | Cloudflare R2 (card images)                   |
| Auth     | HTTP Basic, password stored in session        |

## Getting started

```bash
pnpm install          # install all workspace deps

# Frontend (http://localhost:5173)
cd apps/web && pnpm dev

# API (local Wrangler dev server)
cd apps/api && pnpm dev
```

Set `VITE_API_URL` in `apps/web/.env.local` to point at the local Worker, or leave it empty to hit the deployed API.

## Project structure

```
apps/
  web/   Vite + React frontend
  api/   Cloudflare Worker (Hono), all API routes + D1 migrations
```

## Pages

| Route               | Description                                             |
|---------------------|---------------------------------------------------------|
| `/decks`            | Gallery of all decks with energy-type and era filters   |
| `/decks/:slug`      | Deck detail: sleeve grid, card status, primer           |
| `/stats`            | Per-deck table, aggregated buy list, collection totals  |
| `/eras/:slug`       | Era rules primer and associated decks                   |
| `/formats`          | Browse all formats                                      |
| `/formats/:slug`    | Format detail with legal sets and decks                 |
| `/admin/*`          | Password-protected admin panel (decks, cards, formats)  |

## Admin panel

Navigate to `/admin` and enter the admin password. Features:

- **Decks** — create, edit metadata, manage cards and quantities
- **Cards** — full card catalog with era/set/supertype filters; import from pokemontcg.io by name, set, or card ID
- **Formats** — manage formats and their legal set / regulation-mark rules
- **Blocks & Eras** — manage era blocks with color themes and rules primers

### TCG Live import

In the deck editor, paste a TCG Live export. Cards are matched against the local DB by set code + card number. Unrecognised cards are fetched from pokemontcg.io and queued for import with a per-card era selector (defaulting to the deck's era) before being added.

## Card status

Each copy of a card in a deck has one of four states:

| Status    | Meaning                          |
|-----------|----------------------------------|
| **Real**  | Physical card in hand            |
| **Proxy** | Printed and sleeved              |
| **Missing** | Not yet sourced                |
| **Ordered** | Bought, in transit             |

## Deploying

```bash
# Deploy the Worker
cd apps/api && pnpm deploy

# Frontend deploys automatically on push to main via Cloudflare Pages
```
