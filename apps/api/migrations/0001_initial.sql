-- ── Lookup tables ──────────────────────────────────────────────────────

CREATE TABLE formats (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE era_blocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,  -- 'hgss', 'bw', 'xy', 'sm', 'swsh', 'sv'
  key        TEXT NOT NULL UNIQUE,  -- 'HGSS', 'BW', 'XY', 'SM', 'SwSh', 'SV'
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  dark       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ── Core tables ────────────────────────────────────────────────────────

CREATE TABLE cards (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  pokemontcg_id TEXT UNIQUE,
  name          TEXT NOT NULL,
  supertype     TEXT NOT NULL DEFAULT 'Pokémon',  -- 'Pokémon' | 'Trainer' | 'Energy'
  hp            INTEGER,
  energy_type   TEXT,
  era_block_id  INTEGER REFERENCES era_blocks(id),
  image_r2_key  TEXT,
  image_ext_url TEXT,
  is_custom     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE decks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  era_block_id INTEGER NOT NULL REFERENCES era_blocks(id),
  format_id    INTEGER NOT NULL REFERENCES formats(id),
  energy_type  TEXT NOT NULL,
  cover_r2_key TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE deck_cards (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES cards(id),
  count   INTEGER NOT NULL DEFAULT 1,
  status  TEXT    NOT NULL CHECK(status IN ('real','proxy','missing','ordered'))
);

-- ── Indexes ────────────────────────────────────────────────────────────

CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
CREATE INDEX idx_decks_era_block_id  ON decks(era_block_id);
CREATE INDEX idx_decks_format_id     ON decks(format_id);
CREATE INDEX idx_cards_era_block_id  ON cards(era_block_id);

-- ── Seed: formats ──────────────────────────────────────────────────────

INSERT INTO formats (slug, name) VALUES
  ('modified',  'Modified'),
  ('standard',  'Standard'),
  ('unlimited', 'Unlimited');

-- ── Seed: era_blocks ───────────────────────────────────────────────────

INSERT INTO era_blocks (slug, key, name, color, dark, sort_order) VALUES
  ('hgss', 'HGSS', 'HGSS Block', '#B88A00', '#6A5000', 1),
  ('bw',   'BW',   'BW Block',   '#505050', '#202020', 2),
  ('xy',   'XY',   'XY Block',   '#207035', '#0A3018', 3),
  ('sm',   'SM',   'SM Block',   '#B03818', '#581808', 4),
  ('swsh', 'SwSh', 'SwSh Block', '#1868A0', '#083050', 5),
  ('sv',   'SV',   'SV Block',   '#A01838', '#500818', 6);
