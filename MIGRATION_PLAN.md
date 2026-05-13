# DB Migration Plan — Era / Format / Block Overhaul

## Background

The current schema uses inconsistent terminology. This document defines the target
state and the migration steps needed to get there. **No code has been written for
this yet** — this is a planning document only.

---

## Terminology (final definitions)

| Term | Definition |
|---|---|
| **Era** | A time period of the game (HGSS, BW, XY, SM, SwSh, SV). Has rules text and a primer. Displayed on `/eras/<slug>`. |
| **Block** | A format where all sets of an era are legal. Created in the Formats admin, linked to an era. A block IS a format — `is_block = true`. |
| **Format** | Any collection of sets where only those cards are legal (Standard, Modified, etc.). Can span eras. |
| **Set** | An individual card set (HS Triumphant, Black & White Base, etc.). Sourced from pokemontcg.io API — not stored in our DB. |

---

## Current DB vs target DB

### `era_blocks` → becomes the **Eras** table

Needs new columns:
```sql
ALTER TABLE era_blocks ADD COLUMN ptcg_series  TEXT;  -- pokemontcg.io series string, e.g. "HeartGold & SoulSilver"
ALTER TABLE era_blocks ADD COLUMN rules_primer TEXT;  -- markdown prose (era primer text)
ALTER TABLE era_blocks ADD COLUMN rules_json   TEXT;  -- JSON object of structured rules (starting hand, prize cards, etc.)
```

Seed `ptcg_series` values to add after migration:
| slug | ptcg_series |
|---|---|
| hgss | HeartGold & SoulSilver |
| bw   | Black & White |
| xy   | XY |
| sm   | Sun & Moon |
| swsh | Sword & Shield |
| sv   | Scarlet & Violet |

### `eras` table → **vestigial, to be dropped later**

This table contained individual set-like entries (HS Triumphant, etc.) and was
incorrectly used for per-set rules text. With sets sourced from pokemontcg.io
directly, this table is no longer needed. Safe to drop once all foreign key
references are removed.

No existing code reads from this table in a user-facing way. The `AdminErasPage`
writes to it, but that page will be repurposed to manage `era_blocks` (Eras).

```sql
-- Future: drop after verifying nothing depends on it
DROP TABLE eras;
```

### `formats` table — gains era link + block flag

```sql
ALTER TABLE formats ADD COLUMN era_id   INTEGER REFERENCES era_blocks(id);
ALTER TABLE formats ADD COLUMN is_block INTEGER NOT NULL DEFAULT 0;
```

After adding the column, existing Block-type formats should have `is_block = 1`
and `era_id` set to the appropriate era. This must be done manually via the admin
UI or a data script.

The existing `legal_set_ids TEXT` column (JSON array of pokemontcg.io set IDs
like `["sv1","sv2"]`) remains and is still the source of truth for which sets
are in a format/block.

### `decks` table — no changes needed

`era_block_id` on decks references `era_blocks(id)` — this is already the Era
link and does not need to change. The column name `era_block_id` can remain as-is
in the DB; the API and frontend rename it to `era_id` in responses.

### `cards` table — no changes needed

`era_block_id` on cards already links to the era. The `regulation_mark` and
`set_id` fields (from pokemontcg.io) remain the mechanism for format filtering.

---

## API changes needed (post-migration)

| Current endpoint | Change |
|---|---|
| `GET /api/era-blocks` | Rename to `GET /api/eras`, return `era_blocks` |
| `GET /api/era-blocks/:id` | Rename to `GET /api/eras/:id` |
| `GET /api/eras` | Rename to `GET /api/sets` (or deprecate — sets come from pokemontcg.io) |
| `GET /api/eras/:id` | Rename to `GET /api/sets/:id` (or deprecate) |
| `GET /api/formats/:slug` | Add sets list fetched from pokemontcg.io via `legal_set_ids` |
| Admin `era-blocks` CRUD | Rename to `eras` CRUD, add `ptcg_series`, `rules_primer`, `rules_json` fields |

The existing `GET /api/admin/pokemontcg/sets` endpoint already fetches all sets
from pokemontcg.io. It will be used in the formats admin set picker.

---

## Frontend changes needed (post-migration)

### Pages to rewrite

- **`EraPage`** (`/eras/:slug`) — currently 100% hardcoded mock data. Needs to:
  - Fetch era from `GET /api/eras/:slug`
  - Fetch sets from pokemontcg.io filtered by `era.ptcg_series`
  - Render real `rules_primer` and `rules_json` from DB (admin-editable)
  - Show decks in this era from the API

- **`FormatsPage`** (`/formats`) — currently unknown state; needs to list formats/blocks from API

- **Format detail page** (`/formats/:slug`) — does not exist yet; needs creating:
  - Show format name, era link, sets (from pokemontcg.io via `legal_set_ids`)
  - Show decks using this format

### Admin pages to update

- **Admin Eras page** — repurpose from managing `eras` (sub-entries) to managing
  `era_blocks` (Eras). Add editable `ptcg_series`, `rules_primer`, `rules_json` fields.
  Remove sub-era management entirely.

- **Admin Formats page** — add:
  - `era_id` selector (which era this format belongs to)
  - `is_block` toggle (is this a Block format?)
  - Set picker: search pokemontcg.io sets, add to `legal_set_ids`

### Terminology sweep

All UI text, labels, and comments that use "Block" to mean "Era" or "Era" to mean
"Set" need to be corrected. Key locations:
- Left panel in `DeckDetailPage` ("HGSS Block" header → "HGSS Era")
- `AdminErasPage` labels
- Filter chips on `HomePage` and `StatsPage`
- `DeckSummary.era` field (currently stores the era_block `key`, e.g. "HGSS")

---

## Migration sequence (when ready to execute)

1. Write and run `0007_era_overhaul.sql` (the SQL above)
2. Seed `ptcg_series` values via admin or a one-time script
3. Update API endpoints (backwards-compat: keep old endpoints returning same data,
   add new endpoints with correct naming)
4. Update frontend pages (EraPage, FormatsPage, format detail)
5. Update admin pages (Eras, Formats)
6. Do terminology sweep
7. Drop `eras` table once confirmed unused
8. Remove old API endpoints

---

## Risk notes

- `era_block_id` column name appears in `cards`, `decks` tables — both FK references.
  SQLite does not rename FK column names when you rename a table, so if we ever rename
  `era_blocks` to `eras` we need to be careful. Safest: leave table names as-is in DB,
  alias in API responses only.
- The `eras` table has a CASCADE delete from `era_blocks`. Dropping `eras` requires
  removing that FK constraint first (recreate table without it, then drop).
- `legal_set_ids` is a JSON array stored as TEXT. If we ever need to query by set ID
  efficiently, this should become a proper junction table. Flag for future consideration.
