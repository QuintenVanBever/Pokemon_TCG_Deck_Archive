export type EraKey     = 'HGSS' | 'BW' | 'XY' | 'SM' | 'SwSh' | 'SV'
export type EraClass   = 'hgss' | 'bw' | 'xy' | 'sm' | 'swsh' | 'sv'
export type EnergyType = 'fire' | 'water' | 'grass' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'dragon' | 'colorless'
export type CardStatus = 'real' | 'proxy' | 'missing' | 'ordered'
export type DeckStatus = 'playable' | 'wip' | 'awaiting'

export interface DeckCard {
  name: string
  count: number
  status: CardStatus
}

export interface FeaturedCard {
  name: string
  type: EnergyType
  hp: number
}

export interface Deck {
  slug: string
  name: string
  era: EraKey
  eraClass: EraClass
  eraLabel: string
  format: string
  energy: EnergyType
  counts: { real: number; proxy: number; missing: number; ordered: number }
  featuredCards: FeaturedCard[]
  cards: DeckCard[]
}

export const ENERGY_META: Record<EnergyType, { color: string; dark: string; art: string; abbr: string; label: string }> = {
  fire:      { color: '#C8391A', dark: '#6A1508', art: 'radial-gradient(ellipse 70% 80% at 45% 65%, #FF9966 0%, #D94020 45%, #7A1A08 100%)', abbr: 'FIRE',    label: 'Fire'      },
  water:     { color: '#1560B8', dark: '#082860', art: 'radial-gradient(ellipse 60% 70% at 50% 60%, #99CCFF 0%, #1560B8 50%, #082860 100%)', abbr: 'WATER',   label: 'Water'     },
  grass:     { color: '#257A35', dark: '#0C3818', art: 'radial-gradient(ellipse 65% 75% at 50% 65%, #88DD88 0%, #257A35 50%, #0C3818 100%)', abbr: 'GRASS',   label: 'Grass'     },
  lightning: { color: '#B88A00', dark: '#5A4200', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #FFE066 0%, #C09010 55%, #6A5000 100%)', abbr: 'LIGHTN',  label: 'Lightning' },
  psychic:   { color: '#8828A0', dark: '#401058', art: 'radial-gradient(ellipse 60% 70% at 50% 50%, #DDA8EE 0%, #9030A0 50%, #481858 100%)', abbr: 'PSYCHIC', label: 'Psychic'   },
  fighting:  { color: '#A02818', dark: '#501008', art: 'radial-gradient(ellipse 65% 75% at 40% 60%, #D07060 0%, #A82818 50%, #581008 100%)', abbr: 'FIGHT',   label: 'Fighting'  },
  darkness:  { color: '#1A0A3A', dark: '#080210', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #6040A0 0%, #200850 50%, #080210 100%)', abbr: 'DARK',    label: 'Darkness'  },
  metal:     { color: '#556080', dark: '#243040', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #C8D8E8 0%, #607090 55%, #283040 100%)', abbr: 'METAL',   label: 'Metal'     },
  dragon:    { color: '#2A4090', dark: '#0C1848', art: 'linear-gradient(150deg, #2A4090 0%, #5830A8 50%, #2A4090 100%)',                      abbr: 'DRAGON',  label: 'Dragon'    },
  colorless: { color: '#6A6050', dark: '#302C28', art: 'radial-gradient(ellipse 60% 70% at 50% 50%, #C8C0B0 0%, #706858 55%, #342E28 100%)', abbr: 'CLR',     label: 'Colorless' },
}

export const ERA_META: Record<EraKey, { color: string; dark: string; eraClass: EraClass }> = {
  HGSS: { color: '#B88A00', dark: '#6A5000', eraClass: 'hgss' },
  BW:   { color: '#505050', dark: '#202020', eraClass: 'bw'   },
  XY:   { color: '#207035', dark: '#0A3018', eraClass: 'xy'   },
  SM:   { color: '#B03818', dark: '#581808', eraClass: 'sm'   },
  SwSh: { color: '#1868A0', dark: '#083050', eraClass: 'swsh' },
  SV:   { color: '#A01838', dark: '#500818', eraClass: 'sv'   },
}

export const BAR_COLORS = {
  real:    '#3EE080',
  proxy:   '#C090FF',
  missing: '#FF4444',
  ordered: '#44BBFF',
}

export const STATUS_COLORS = {
  real:    '#2E8B57',
  proxy:   '#7B52C4',
  missing: '#CC3333',
  ordered: '#1E78C4',
}

export function deriveDeckStatus(
  counts: { real: number; proxy: number; missing: number; ordered: number },
  intendedSize = 60,
): DeckStatus {
  const total = counts.real + counts.proxy + counts.missing + counts.ordered
  if (counts.missing > 0 || total < intendedSize) return 'wip'
  if (counts.ordered > 0) return 'awaiting'
  return 'playable'
}

export const DECKS: Deck[] = [
  {
    slug: 'magnezone-prime',
    name: 'Magnezone Prime',
    era: 'HGSS', eraClass: 'hgss', eraLabel: 'HGSS Block · Lightning',
    format: 'Modified', energy: 'lightning',
    counts: { real: 60, proxy: 0, missing: 0, ordered: 0 },
    featuredCards: [
      { name: 'Magnezone Prime', type: 'lightning', hp: 140 },
      { name: 'Eelektrik',       type: 'lightning', hp: 80  },
      { name: 'Cleffa',          type: 'colorless', hp: 30  },
    ],
    cards: [
      { name: 'Magnezone Prime',         count: 3,  status: 'real' },
      { name: 'Magneton',                count: 3,  status: 'real' },
      { name: 'Magnemite',               count: 4,  status: 'real' },
      { name: 'Eelektrik',               count: 4,  status: 'real' },
      { name: 'Tynamo',                  count: 4,  status: 'real' },
      { name: 'Cleffa',                  count: 2,  status: 'real' },
      { name: 'Professor Juniper',       count: 4,  status: 'real' },
      { name: 'N',                       count: 4,  status: 'real' },
      { name: 'Junk Arm',                count: 4,  status: 'real' },
      { name: 'Rare Candy',              count: 4,  status: 'real' },
      { name: 'Ultra Ball',              count: 4,  status: 'real' },
      { name: 'Switch',                  count: 4,  status: 'real' },
      { name: 'Lost World',              count: 2,  status: 'real' },
      { name: 'Pokémon Communication',   count: 4,  status: 'real' },
      { name: 'Lightning Energy',        count: 11, status: 'real' },
    ],
  },
  {
    slug: 'reshiram-typhlosion',
    name: 'Reshiram & Typhlosion',
    era: 'HGSS', eraClass: 'hgss', eraLabel: 'HGSS Block · Fire',
    format: 'Modified', energy: 'fire',
    counts: { real: 42, proxy: 8, missing: 10, ordered: 0 },
    featuredCards: [
      { name: 'Reshiram',         type: 'fire',      hp: 130 },
      { name: 'Typhlosion Prime', type: 'fire',      hp: 140 },
      { name: 'Cleffa',           type: 'colorless', hp: 30  },
    ],
    cards: [
      { name: 'Reshiram',          count: 3,  status: 'real'    },
      { name: 'Typhlosion Prime',  count: 3,  status: 'real'    },
      { name: 'Quilava',           count: 3,  status: 'real'    },
      { name: 'Cyndaquil',         count: 4,  status: 'real'    },
      { name: 'Ninetales',         count: 2,  status: 'proxy'   },
      { name: 'Vulpix',            count: 2,  status: 'proxy'   },
      { name: 'Cleffa',            count: 2,  status: 'real'    },
      { name: 'Professor Juniper', count: 4,  status: 'real'    },
      { name: 'N',                 count: 4,  status: 'real'    },
      { name: 'Junk Arm',          count: 4,  status: 'missing' },
      { name: 'Rare Candy',        count: 4,  status: 'missing' },
      { name: 'Ultra Ball',        count: 4,  status: 'proxy'   },
      { name: 'Switch',            count: 3,  status: 'missing' },
      { name: 'Fire Energy',       count: 12, status: 'real'    },
    ],
  },
  {
    slug: 'blastoise-keldeo',
    name: 'Blastoise / Keldeo',
    era: 'BW', eraClass: 'bw', eraLabel: 'BW Block · Water',
    format: 'Modified', energy: 'water',
    counts: { real: 48, proxy: 12, missing: 0, ordered: 0 },
    featuredCards: [
      { name: 'Blastoise',  type: 'water', hp: 140 },
      { name: 'Keldeo-EX',  type: 'water', hp: 170 },
    ],
    cards: [
      { name: 'Blastoise',                 count: 3,  status: 'real'  },
      { name: 'Wartortle',                 count: 3,  status: 'real'  },
      { name: 'Squirtle',                  count: 4,  status: 'real'  },
      { name: 'Keldeo-EX',                 count: 3,  status: 'real'  },
      { name: 'Black Kyurem-EX',           count: 2,  status: 'real'  },
      { name: 'Professor Juniper',         count: 4,  status: 'real'  },
      { name: 'N',                         count: 4,  status: 'real'  },
      { name: 'Colress',                   count: 3,  status: 'proxy' },
      { name: 'Skyla',                     count: 3,  status: 'proxy' },
      { name: 'Rare Candy',                count: 4,  status: 'real'  },
      { name: 'Ultra Ball',                count: 4,  status: 'proxy' },
      { name: 'Superior Energy Retrieval', count: 4,  status: 'real'  },
      { name: 'Tropical Beach',            count: 2,  status: 'proxy' },
      { name: 'Float Stone',               count: 2,  status: 'proxy' },
      { name: 'Water Energy',              count: 11, status: 'real'  },
    ],
  },
  {
    slug: 'night-march',
    name: 'Night March',
    era: 'XY', eraClass: 'xy', eraLabel: 'XY Block · Psychic',
    format: 'Modified', energy: 'psychic',
    counts: { real: 50, proxy: 0, missing: 0, ordered: 10 },
    featuredCards: [
      { name: 'Joltik',    type: 'lightning', hp: 30  },
      { name: 'Pumpkaboo', type: 'psychic',   hp: 60  },
      { name: 'Mew-EX',    type: 'psychic',   hp: 120 },
    ],
    cards: [
      { name: 'Joltik',             count: 4, status: 'real'    },
      { name: 'Pumpkaboo',          count: 4, status: 'real'    },
      { name: 'Lampent',            count: 4, status: 'real'    },
      { name: 'Mew-EX',             count: 2, status: 'ordered' },
      { name: 'Teammates',          count: 2, status: 'real'    },
      { name: 'Professor Sycamore', count: 4, status: 'real'    },
      { name: 'N',                  count: 2, status: 'real'    },
      { name: 'Battle Compressor',  count: 4, status: 'real'    },
      { name: 'VS Seeker',          count: 4, status: 'ordered' },
      { name: 'Ultra Ball',         count: 4, status: 'real'    },
      { name: 'Puzzle of Time',     count: 4, status: 'real'    },
      { name: 'Escape Rope',        count: 2, status: 'ordered' },
      { name: 'Float Stone',        count: 2, status: 'ordered' },
      { name: 'Dimension Valley',   count: 3, status: 'real'    },
      { name: 'DCE',                count: 4, status: 'real'    },
      { name: 'Psychic Energy',     count: 5, status: 'real'    },
    ],
  },
  {
    slug: 'zoroark-gx-control',
    name: 'Zoroark-GX Control',
    era: 'SM', eraClass: 'sm', eraLabel: 'SM Block · Darkness',
    format: 'Standard', energy: 'darkness',
    counts: { real: 54, proxy: 6, missing: 0, ordered: 0 },
    featuredCards: [
      { name: 'Zoroark-GX', type: 'darkness', hp: 210 },
      { name: 'Zorua',       type: 'darkness', hp: 60  },
    ],
    cards: [
      { name: 'Zoroark-GX',              count: 4, status: 'real'  },
      { name: 'Zorua',                   count: 4, status: 'real'  },
      { name: 'Sableye',                 count: 3, status: 'real'  },
      { name: 'Exeggcute',               count: 1, status: 'real'  },
      { name: 'Brigette',                count: 1, status: 'real'  },
      { name: 'Professor Kukui',         count: 4, status: 'real'  },
      { name: 'Guzma',                   count: 4, status: 'real'  },
      { name: 'Acerola',                 count: 2, status: 'real'  },
      { name: 'Puzzle of Time',          count: 4, status: 'real'  },
      { name: 'Ultra Ball',              count: 4, status: 'real'  },
      { name: 'VS Seeker',               count: 4, status: 'proxy' },
      { name: 'Float Stone',             count: 2, status: 'proxy' },
      { name: 'Choice Band',             count: 3, status: 'real'  },
      { name: 'Field Blower',            count: 2, status: 'real'  },
      { name: 'Double Colorless Energy', count: 4, status: 'real'  },
      { name: 'Darkness Energy',         count: 8, status: 'real'  },
    ],
  },
  {
    slug: 'mew-vmax',
    name: 'Mew VMAX',
    era: 'SwSh', eraClass: 'swsh', eraLabel: 'SwSh Block · Psychic',
    format: 'Standard', energy: 'psychic',
    counts: { real: 30, proxy: 15, missing: 15, ordered: 0 },
    featuredCards: [
      { name: 'Mew VMAX',   type: 'psychic', hp: 310 },
      { name: 'Mew V',      type: 'psychic', hp: 200 },
      { name: 'Genesect V', type: 'grass',   hp: 190 },
    ],
    cards: [
      { name: 'Mew VMAX',             count: 4, status: 'real'    },
      { name: 'Mew V',                count: 4, status: 'real'    },
      { name: 'Genesect V',           count: 4, status: 'proxy'   },
      { name: 'Meloetta',             count: 2, status: 'missing' },
      { name: 'Cram-o-matic',         count: 2, status: 'real'    },
      { name: "Boss's Orders",        count: 2, status: 'proxy'   },
      { name: "Elesa's Sparkle",      count: 4, status: 'missing' },
      { name: 'Quick Ball',           count: 4, status: 'real'    },
      { name: 'Level Ball',           count: 4, status: 'real'    },
      { name: 'Fusion Strike Energy', count: 8, status: 'proxy'   },
      { name: 'Twin Energy',          count: 4, status: 'real'    },
      { name: 'Power Tablet',         count: 4, status: 'missing' },
      { name: 'Battle VIP Pass',      count: 4, status: 'proxy'   },
      { name: 'Psychic Energy',       count: 4, status: 'missing' },
      { name: 'Choice Belt',          count: 2, status: 'missing' },
      { name: 'Path to the Peak',     count: 2, status: 'missing' },
      { name: 'Marnie',               count: 2, status: 'real'    },
      { name: 'Collapsed Stadium',    count: 2, status: 'real'    },
      { name: 'Air Balloon',          count: 2, status: 'proxy'   },
    ],
  },
]
