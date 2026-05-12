-- ── Cards ──────────────────────────────────────────────────────────────
-- Each card inserted once at its earliest-known era.
-- Shared staples (N, Ultra Ball, etc.) live in the era they debuted.

-- HGSS-era Pokémon
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Magnezone Prime',  'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Magneton',         'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Magnemite',        'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Eelektrik',        'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Tynamo',           'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Cleffa',           'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Reshiram',         'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Typhlosion Prime', 'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Quilava',          'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Cyndaquil',        'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Ninetales',        'Pokémon', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Vulpix',           'Pokémon', id FROM era_blocks WHERE slug='hgss';

-- HGSS-era Trainers (many are staples that carry into later eras)
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Professor Juniper',     'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'N',                     'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Junk Arm',              'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Rare Candy',            'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Ultra Ball',            'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Switch',                'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Lost World',            'Trainer', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Pokémon Communication', 'Trainer', id FROM era_blocks WHERE slug='hgss';

-- HGSS-era Energy
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Lightning Energy', 'Energy', id FROM era_blocks WHERE slug='hgss';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Fire Energy',      'Energy', id FROM era_blocks WHERE slug='hgss';

-- BW-era Pokémon
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Blastoise',       'Pokémon', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Wartortle',       'Pokémon', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Squirtle',        'Pokémon', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Keldeo-EX',       'Pokémon', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Black Kyurem-EX', 'Pokémon', id FROM era_blocks WHERE slug='bw';

-- BW-era Trainers
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Colress',                   'Trainer', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Skyla',                     'Trainer', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Superior Energy Retrieval', 'Trainer', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Tropical Beach',            'Trainer', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Float Stone',               'Trainer', id FROM era_blocks WHERE slug='bw';

-- BW-era Energy
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Water Energy',            'Energy', id FROM era_blocks WHERE slug='bw';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Double Colorless Energy', 'Energy', id FROM era_blocks WHERE slug='bw';

-- XY-era Pokémon
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Joltik',    'Pokémon', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Pumpkaboo', 'Pokémon', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Lampent',   'Pokémon', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Mew-EX',    'Pokémon', id FROM era_blocks WHERE slug='xy';

-- XY-era Trainers
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Teammates',          'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Professor Sycamore', 'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Battle Compressor',  'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'VS Seeker',          'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Puzzle of Time',     'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Escape Rope',        'Trainer', id FROM era_blocks WHERE slug='xy';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Dimension Valley',   'Trainer', id FROM era_blocks WHERE slug='xy';

-- XY-era Energy
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Psychic Energy', 'Energy', id FROM era_blocks WHERE slug='xy';

-- SM-era Pokémon
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Zoroark-GX', 'Pokémon', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Zorua',      'Pokémon', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Sableye',    'Pokémon', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Exeggcute',  'Pokémon', id FROM era_blocks WHERE slug='sm';

-- SM-era Trainers
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Brigette',       'Trainer', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Professor Kukui','Trainer', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Guzma',          'Trainer', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Acerola',        'Trainer', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Choice Band',    'Trainer', id FROM era_blocks WHERE slug='sm';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Field Blower',   'Trainer', id FROM era_blocks WHERE slug='sm';

-- SM-era Energy
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Darkness Energy', 'Energy', id FROM era_blocks WHERE slug='sm';

-- SwSh-era Pokémon
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Mew VMAX',   'Pokémon', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Mew V',      'Pokémon', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Genesect V', 'Pokémon', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Meloetta',   'Pokémon', id FROM era_blocks WHERE slug='swsh';

-- SwSh-era Trainers
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Cram-o-matic',      'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Boss''s Orders',    'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Elesa''s Sparkle',  'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Quick Ball',        'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Level Ball',        'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Power Tablet',      'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Battle VIP Pass',   'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Choice Belt',       'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Path to the Peak',  'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Marnie',            'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Collapsed Stadium', 'Trainer', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Air Balloon',       'Trainer', id FROM era_blocks WHERE slug='swsh';

-- SwSh-era Energy
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Fusion Strike Energy', 'Energy', id FROM era_blocks WHERE slug='swsh';
INSERT INTO cards (name, supertype, era_block_id) SELECT 'Twin Energy',          'Energy', id FROM era_blocks WHERE slug='swsh';

-- ── Decks ──────────────────────────────────────────────────────────────

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'magnezone-prime', 'Magnezone Prime',
  (SELECT id FROM era_blocks WHERE slug='hgss'),
  (SELECT id FROM formats   WHERE slug='modified'),
  'lightning';

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'reshiram-typhlosion', 'Reshiram & Typhlosion',
  (SELECT id FROM era_blocks WHERE slug='hgss'),
  (SELECT id FROM formats   WHERE slug='modified'),
  'fire';

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'blastoise-keldeo', 'Blastoise / Keldeo',
  (SELECT id FROM era_blocks WHERE slug='bw'),
  (SELECT id FROM formats   WHERE slug='modified'),
  'water';

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'night-march', 'Night March',
  (SELECT id FROM era_blocks WHERE slug='xy'),
  (SELECT id FROM formats   WHERE slug='modified'),
  'psychic';

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'zoroark-gx-control', 'Zoroark-GX Control',
  (SELECT id FROM era_blocks WHERE slug='sm'),
  (SELECT id FROM formats   WHERE slug='standard'),
  'darkness';

INSERT INTO decks (slug, name, era_block_id, format_id, energy_type)
SELECT 'mew-vmax', 'Mew VMAX',
  (SELECT id FROM era_blocks WHERE slug='swsh'),
  (SELECT id FROM formats   WHERE slug='standard'),
  'psychic';

-- ── Deck cards ─────────────────────────────────────────────────────────
-- Helper macro: SELECT deck.id, card.id, count, status

-- Magnezone Prime
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Magnezone Prime';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Magneton';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Magnemite';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Eelektrik';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Tynamo';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Cleffa';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Professor Juniper';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='N';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Junk Arm';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Rare Candy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Ultra Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Switch';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Lost World';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Pokémon Communication';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,11,'real'   FROM decks d,cards c WHERE d.slug='magnezone-prime'    AND c.name='Lightning Energy';

-- Reshiram & Typhlosion
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Reshiram';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Typhlosion Prime';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Quilava';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Cyndaquil';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Ninetales';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Vulpix';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Cleffa';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Professor Juniper';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='N';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'missing' FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Junk Arm';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'missing' FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Rare Candy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'proxy'   FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Ultra Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'missing' FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Switch';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,12,'real'   FROM decks d,cards c WHERE d.slug='reshiram-typhlosion' AND c.name='Fire Energy';

-- Blastoise / Keldeo
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Blastoise';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Wartortle';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Squirtle';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Keldeo-EX';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Black Kyurem-EX';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Professor Juniper';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='N';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'proxy'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Colress';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'proxy'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Skyla';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Rare Candy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'proxy'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Ultra Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Superior Energy Retrieval';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Tropical Beach';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Float Stone';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,11,'real'   FROM decks d,cards c WHERE d.slug='blastoise-keldeo'    AND c.name='Water Energy';

-- Night March (DCE = Double Colorless Energy)
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Joltik';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Pumpkaboo';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Lampent';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'ordered' FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Mew-EX';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Teammates';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Professor Sycamore';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='N';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Battle Compressor';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'ordered' FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='VS Seeker';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Ultra Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Puzzle of Time';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'ordered' FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Escape Rope';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'ordered' FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Float Stone';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Dimension Valley';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Double Colorless Energy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,5,'real'    FROM decks d,cards c WHERE d.slug='night-march'         AND c.name='Psychic Energy';

-- Zoroark-GX Control
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Zoroark-GX';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Zorua';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Sableye';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,1,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Exeggcute';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,1,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Brigette';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Professor Kukui';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Guzma';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Acerola';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Puzzle of Time';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Ultra Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'proxy'   FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='VS Seeker';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Float Stone';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,3,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Choice Band';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Field Blower';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Double Colorless Energy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,8,'real'    FROM decks d,cards c WHERE d.slug='zoroark-gx-control'  AND c.name='Darkness Energy';

-- Mew VMAX
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Mew VMAX';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Mew V';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'proxy'   FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Genesect V';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Meloetta';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Cram-o-matic';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Boss''s Orders';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Elesa''s Sparkle';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Quick Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Level Ball';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,8,'proxy'   FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Fusion Strike Energy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Twin Energy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Power Tablet';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'proxy'   FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Battle VIP Pass';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,4,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Psychic Energy';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Choice Belt';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'missing' FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Path to the Peak';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Marnie';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'real'    FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Collapsed Stadium';
INSERT INTO deck_cards (deck_id,card_id,count,status) SELECT d.id,c.id,2,'proxy'   FROM decks d,cards c WHERE d.slug='mew-vmax'            AND c.name='Air Balloon';
