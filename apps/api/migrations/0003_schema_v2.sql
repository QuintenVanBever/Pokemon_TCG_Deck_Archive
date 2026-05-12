-- ── Migration 0003: schema v2 ──────────────────────────────────────────
-- Adds eras table, extends decks with primer/status/size,
-- and migrates deck_cards from count+status to 4-column qty model.

-- 1. Individual eras (child of era_blocks)
CREATE TABLE eras (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  era_block_id INTEGER NOT NULL REFERENCES era_blocks(id) ON DELETE CASCADE,
  slug         TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  code         TEXT,
  release_date TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  rules_primer TEXT,
  rules_json   TEXT,
  UNIQUE (era_block_id, slug)
);
CREATE INDEX idx_eras_era_block_id ON eras(era_block_id);

-- 2. Extend decks
ALTER TABLE decks ADD COLUMN primer_md     TEXT;
ALTER TABLE decks ADD COLUMN manual_status TEXT;
ALTER TABLE decks ADD COLUMN intended_size INTEGER NOT NULL DEFAULT 60;

-- 3. Recreate deck_cards with 4-column qty model
CREATE TABLE deck_cards_v2 (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id           INTEGER NOT NULL REFERENCES decks(id)  ON DELETE CASCADE,
  card_id           INTEGER NOT NULL REFERENCES cards(id)  ON DELETE RESTRICT,
  intended_quantity INTEGER NOT NULL DEFAULT 1,
  qty_real          INTEGER NOT NULL DEFAULT 0,
  qty_proxy         INTEGER NOT NULL DEFAULT 0,
  qty_missing       INTEGER NOT NULL DEFAULT 0,
  qty_ordered       INTEGER NOT NULL DEFAULT 0,
  role_tag          TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  UNIQUE (deck_id, card_id),
  CHECK (qty_real + qty_proxy + qty_missing + qty_ordered = intended_quantity)
);

INSERT INTO deck_cards_v2 (deck_id, card_id, intended_quantity, qty_real, qty_proxy, qty_missing, qty_ordered)
SELECT
  deck_id,
  card_id,
  SUM(count)                                             AS intended_quantity,
  SUM(CASE status WHEN 'real'    THEN count ELSE 0 END)  AS qty_real,
  SUM(CASE status WHEN 'proxy'   THEN count ELSE 0 END)  AS qty_proxy,
  SUM(CASE status WHEN 'missing' THEN count ELSE 0 END)  AS qty_missing,
  SUM(CASE status WHEN 'ordered' THEN count ELSE 0 END)  AS qty_ordered
FROM deck_cards
GROUP BY deck_id, card_id;

DROP TABLE deck_cards;
ALTER TABLE deck_cards_v2 RENAME TO deck_cards;

CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
