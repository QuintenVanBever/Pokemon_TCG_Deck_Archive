-- Add energy_types JSON array column for multi-type decks
ALTER TABLE decks ADD COLUMN energy_types TEXT NULL DEFAULT NULL;
