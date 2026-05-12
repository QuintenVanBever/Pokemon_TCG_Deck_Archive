-- ── Migration 0004: card set fields, display name, homepage fan slots ──

-- display_name: user-visible alias (falls back to name when null)
ALTER TABLE cards ADD COLUMN display_name TEXT;

-- pokemontcg.io set fields (replaces era_block as primary card origin)
ALTER TABLE cards ADD COLUMN set_id     TEXT;
ALTER TABLE cards ADD COLUMN set_name   TEXT;
ALTER TABLE cards ADD COLUMN set_series TEXT;

-- fan_slot: 1/2/3 = shown in homepage deck fan, NULL = not featured
ALTER TABLE deck_cards ADD COLUMN fan_slot INTEGER;
