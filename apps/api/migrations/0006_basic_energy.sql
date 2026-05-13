-- Add basic energy flag so basic energies can be format/era agnostic in card search
ALTER TABLE cards ADD COLUMN is_basic_energy INTEGER NOT NULL DEFAULT 0;
