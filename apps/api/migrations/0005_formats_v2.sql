-- Extend formats with legal set IDs and regulation marks
ALTER TABLE formats ADD COLUMN regulation_marks TEXT;   -- JSON array: '["E","F","G"]'
ALTER TABLE formats ADD COLUMN legal_set_ids    TEXT;   -- JSON array: '["sv1","sv2"]'
ALTER TABLE formats ADD COLUMN sort_order       INTEGER NOT NULL DEFAULT 0;

-- Add regulation mark to cards (populated from pokemontcg.io import)
ALTER TABLE cards ADD COLUMN regulation_mark TEXT;
