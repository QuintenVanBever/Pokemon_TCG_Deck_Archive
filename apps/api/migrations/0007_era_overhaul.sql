-- Era overhaul: add ptcg_series + rules fields to era_blocks, era_id + is_block to formats

ALTER TABLE era_blocks ADD COLUMN ptcg_series  TEXT;
ALTER TABLE era_blocks ADD COLUMN rules_primer TEXT;
ALTER TABLE era_blocks ADD COLUMN rules_json   TEXT;

ALTER TABLE formats ADD COLUMN era_id   INTEGER REFERENCES era_blocks(id);
ALTER TABLE formats ADD COLUMN is_block INTEGER NOT NULL DEFAULT 0;

-- Seed ptcg_series so the pokemontcg.io set filter works immediately
UPDATE era_blocks SET ptcg_series = 'HeartGold & SoulSilver' WHERE slug = 'hgss';
UPDATE era_blocks SET ptcg_series = 'Black & White'          WHERE slug = 'bw';
UPDATE era_blocks SET ptcg_series = 'XY'                     WHERE slug = 'xy';
UPDATE era_blocks SET ptcg_series = 'Sun & Moon'             WHERE slug = 'sm';
UPDATE era_blocks SET ptcg_series = 'Sword & Shield'         WHERE slug = 'swsh';
UPDATE era_blocks SET ptcg_series = 'Scarlet & Violet'       WHERE slug = 'sv';
