export type EnergyType = 'fire' | 'water' | 'grass' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'dragon' | 'colorless' | 'fairy'
export type DeckStatus = 'playable' | 'wip' | 'awaiting'

export const ENERGY_META: Record<EnergyType, { color: string; dark: string; art: string; abbr: string; label: string }> = {
  fire:      { color: '#C8391A', dark: '#6A1508', art: 'radial-gradient(ellipse 70% 80% at 45% 65%, #FF9966 0%, #D94020 45%, #7A1A08 100%)', abbr: 'FIRE',    label: 'Fire'      },
  water:     { color: '#1560B8', dark: '#082860', art: 'radial-gradient(ellipse 60% 70% at 50% 60%, #99CCFF 0%, #1560B8 50%, #082860 100%)', abbr: 'WATER',   label: 'Water'     },
  grass:     { color: '#257A35', dark: '#0C3818', art: 'radial-gradient(ellipse 65% 75% at 50% 65%, #88DD88 0%, #257A35 50%, #0C3818 100%)', abbr: 'GRASS',   label: 'Grass'     },
  lightning: { color: '#B88A00', dark: '#5A4200', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #FFE066 0%, #C09010 55%, #6A5000 100%)', abbr: 'LIGHTN',  label: 'Lightning' },
  psychic:   { color: '#8828A0', dark: '#401058', art: 'radial-gradient(ellipse 60% 70% at 50% 50%, #DDA8EE 0%, #9030A0 50%, #481858 100%)', abbr: 'PSYCHIC', label: 'Psychic'   },
  fighting:  { color: '#A02818', dark: '#501008', art: 'radial-gradient(ellipse 65% 75% at 40% 60%, #D07060 0%, #A82818 50%, #581008 100%)', abbr: 'FIGHT',   label: 'Fighting'  },
  darkness:  { color: '#1A0A3A', dark: '#080210', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #6040A0 0%, #200850 50%, #080210 100%)', abbr: 'DARK',    label: 'Darkness'  },
  metal:     { color: '#556080', dark: '#243040', art: 'radial-gradient(ellipse 60% 70% at 50% 40%, #C8D8E8 0%, #607090 55%, #283040 100%)', abbr: 'METAL',   label: 'Metal'     },
  dragon:    { color: '#2A4090', dark: '#0C1848', art: 'linear-gradient(150deg, #2A4090 0%, #5830A8 50%, #2A4090 100%)',                     abbr: 'DRAGON',  label: 'Dragon'    },
  colorless: { color: '#6A6050', dark: '#302C28', art: 'radial-gradient(ellipse 60% 70% at 50% 50%, #C8C0B0 0%, #706858 55%, #342E28 100%)', abbr: 'CLR',     label: 'Colorless' },
  fairy:     { color: '#C4578C', dark: '#6A1E48', art: 'radial-gradient(ellipse 60% 70% at 50% 50%, #F8B8D8 0%, #C45888 50%, #6A1E48 100%)', abbr: 'FAIRY',   label: 'Fairy'     },
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
