import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  DECKS, ENERGY_META, ERA_META, BAR_COLORS, STATUS_COLORS,
  deriveDeckStatus,
  type Deck, type EnergyType, type EraKey,
} from '../data/decks'

/* ── Mini card component (for the fan display) ─────── */

function MiniCard({ name, type, hp, pos }: {
  name: string; type: EnergyType; hp: number; pos: string
}) {
  const e = ENERGY_META[type]
  const isTrainer = hp === 0

  const rotations: Record<string, React.CSSProperties> = {
    left:   { transform: 'rotate(-11deg)', zIndex: 1 },
    center: { transform: 'rotate(0deg)',   zIndex: 3 },
    right:  { transform: 'rotate(11deg)',  zIndex: 2 },
    left2:  { transform: 'rotate(-8deg)',  zIndex: 1 },
    right2: { transform: 'rotate(8deg)',   zIndex: 2 },
  }

  return (
    <div
      className={`card-preview card-preview--${pos}`}
      style={{
        position: 'absolute',
        bottom: 0,
        width: 80, height: 112,
        border: '1.5px solid rgba(0,0,0,0.5)',
        background: '#F8F8F8',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transformOrigin: 'bottom center',
        boxShadow: '2px 4px 10px rgba(0,0,0,0.26), 0 0 0 0.5px rgba(0,0,0,0.18)',
        transition: 'transform 0.36s cubic-bezier(0.34,1.4,0.64,1)',
        ...rotations[pos],
      }}
    >
      {/* Header */}
      <div style={{
        height: 15, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 4px',
        background: e.color, flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-d)', fontSize: 4.6,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap',
          overflow: 'hidden', maxWidth: 54, textOverflow: 'ellipsis',
        }}>
          {isTrainer ? 'TRAINER' : e.abbr}
        </span>
        {hp > 0 && (
          <span style={{ fontSize: 4.8, fontWeight: 900, color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            HP{hp}
          </span>
        )}
      </div>

      {/* Art */}
      <div style={{ flex: 1, background: e.art, margin: '2px 2px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,rgba(255,255,255,0.13) 0%,transparent 55%),linear-gradient(315deg,rgba(0,0,0,0.07) 0%,transparent 55%)',
        }} />
      </div>

      {/* Name */}
      <div style={{ height: 15, display: 'flex', alignItems: 'center', padding: '0 4px', flexShrink: 0, background: 'rgba(255,255,255,0.88)' }}>
        <span style={{ fontFamily: 'var(--font-d)', fontSize: 5.2, color: '#181818', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {name}
        </span>
      </div>

      {/* Footer strip */}
      <div style={{ height: 8, background: e.color, flexShrink: 0, opacity: 0.55 }} />
    </div>
  )
}

/* ── Deck entry ────────────────────────────────────── */

function DeckEntry({ deck, index }: { deck: Deck; index: number }) {
  const [hovered, setHovered] = useState(false)
  const e = ENERGY_META[deck.energy]
  const tot = deck.counts.real + deck.counts.proxy + deck.counts.missing + deck.counts.ordered
  const realPct = Math.round((deck.counts.real / tot) * 100)

  const cards = deck.featuredCards.slice(0, 3)
  const positions = cards.length === 1
    ? ['center']
    : cards.length === 2
      ? ['left2', 'right2']
      : ['left', 'center', 'right']

  const barSegs = (['real', 'proxy', 'ordered', 'missing'] as const)
    .filter(s => deck.counts[s] > 0)
    .map(s => ({ key: s, flex: deck.counts[s], color: BAR_COLORS[s] }))

  return (
    <Link
      to="/decks/$slug"
      params={{ slug: deck.slug }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer', textDecoration: 'none', color: 'inherit',
        animation: 'fadeUp 0.4s ease both',
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* Card fan */}
      <div style={{ position: 'relative', height: 106, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        {cards.map((card, i) => (
          <MiniCard
            key={card.name}
            name={card.name}
            type={card.type}
            hp={card.hp}
            pos={positions[i]}
          />
        ))}
        <style>{`
          .card-preview--left   { transform: rotate(-11deg) !important; }
          .card-preview--center { transform: rotate(0deg)   !important; }
          .card-preview--right  { transform: rotate(11deg)  !important; }
          .card-preview--left2  { transform: rotate(-8deg)  !important; }
          .card-preview--right2 { transform: rotate(8deg)   !important; }
          a:hover .card-preview--left   { transform: rotate(-23deg) translateY(-4px)  !important; }
          a:hover .card-preview--center { transform: rotate(0deg)   translateY(-10px) !important; }
          a:hover .card-preview--right  { transform: rotate(23deg)  translateY(-4px)  !important; }
          a:hover .card-preview--left2  { transform: rotate(-18deg) translateY(-7px)  !important; }
          a:hover .card-preview--right2 { transform: rotate(18deg)  translateY(-7px)  !important; }
        `}</style>
      </div>

      {/* Deckbox */}
      <div style={{
        height: 88,
        background: e.color,
        boxShadow: hovered
          ? `3px 3px 0 0 ${e.dark}`
          : `5px 5px 0 0 ${e.dark}`,
        transform: hovered ? 'translate(-2px,-2px)' : 'translate(0,0)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Rim */}
        <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-d)', fontSize: '0.92rem', lineHeight: 1.1,
              color: 'rgba(255,255,255,0.96)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}>
              {deck.name}
            </div>
            <div style={{
              fontSize: '0.6rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.48)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2,
            }}>
              {deck.era} · {deck.format}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontFamily: 'var(--font-d)', fontSize: '1.3rem', lineHeight: 1,
              color: 'rgba(255,255,255,0.94)',
              textShadow: '0 1px 4px rgba(0,0,0,0.35)',
            }}>
              {realPct}%
            </div>
            <div style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>
              Real
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, display: 'flex', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
          {barSegs.map(({ key, flex, color }) => (
            <div key={key} style={{ flex, background: color, height: '100%' }} />
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ── Filter strips ─────────────────────────────────── */

function FilterStrip({
  label, chips, active, onSelect,
}: {
  label: string
  chips: Array<{ key: string; label: string; color?: string }>
  active: string
  onSelect: (key: string) => void
}) {
  return (
    <div style={{
      background: 'var(--navy-deep)',
      height: 38, display: 'flex', alignItems: 'stretch',
      padding: '0 1.5rem', gap: 2,
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 10,
    }}>
      <span style={{
        display: 'flex', alignItems: 'center',
        fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.22)', marginRight: '0.6rem',
        whiteSpace: 'nowrap', flexShrink: 0, minWidth: 88,
      }}>
        {label}
      </span>
      {chips.map(chip => {
        const isActive = chip.key === active
        return (
          <button
            key={chip.key}
            onClick={() => onSelect(chip.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 0.65rem',
              fontFamily: 'var(--font-d)', fontSize: '0.68rem', letterSpacing: '0.04em',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: isActive
                ? (chip.color ?? 'rgba(91,192,222,0.25)')
                : 'transparent',
              color: isActive
                ? (chip.color ? '#fff' : 'var(--sky)')
                : 'rgba(255,255,255,0.32)',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.32)' } }}
          >
            {chip.color && (
              <span style={{ width: 7, height: 7, background: chip.color, flexShrink: 0 }} />
            )}
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Status footer ─────────────────────────────────── */

function StatusFooter({ decks }: { decks: Deck[] }) {
  const tot = { real: 0, proxy: 0, missing: 0, ordered: 0 }
  let totalCards = 0
  for (const d of decks) {
    tot.real    += d.counts.real
    tot.proxy   += d.counts.proxy
    tot.missing += d.counts.missing
    tot.ordered += d.counts.ordered
    totalCards  += d.counts.real + d.counts.proxy + d.counts.missing + d.counts.ordered
  }

  const stats: Array<{ key: keyof typeof tot; label: string }> = [
    { key: 'real',    label: 'Real'     },
    { key: 'proxy',   label: 'Proxy'    },
    { key: 'missing', label: 'Missing'  },
    { key: 'ordered', label: 'On Order' },
  ]

  return (
    <footer style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 100, height: 44,
      background: 'var(--navy)',
      borderTop: '3px solid var(--yellow)',
      display: 'flex', alignItems: 'center',
      padding: '0 2rem', gap: '1.25rem',
    }}>
      {/* Brand mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
        <span style={{ width: 11, height: 11, background: 'var(--yellow)', display: 'block' }} />
        <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.7rem', color: 'var(--yellow)' }}>
          Deck Archive
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {stats.map(({ key, label }, i) => (
        <React.Fragment key={key}>
          {i > 0 && <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, background: STATUS_COLORS[key], flexShrink: 0 }} />
            <span style={{ fontWeight: 900, color: '#fff' }}>{tot[key]}</span>
            <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.64rem' }}>{label}</span>
          </div>
        </React.Fragment>
      ))}

      <div style={{ marginLeft: 'auto', fontSize: '0.64rem', color: 'rgba(255,255,255,0.22)' }}>
        <strong style={{ color: 'rgba(255,255,255,0.48)' }}>{totalCards}</strong> cards ·{' '}
        <strong style={{ color: 'rgba(255,255,255,0.48)' }}>{decks.length}</strong> decks
      </div>
    </footer>
  )
}

/* ── Page ──────────────────────────────────────────── */

export function HomePage() {
  const [energyFilter, setEnergyFilter] = useState<EnergyType | 'all'>('all')
  const [eraFilter, setEraFilter]       = useState<EraKey | 'all'>('all')

  const usedEnergies = [...new Set(DECKS.map(d => d.energy))]
  const usedEras     = [...new Set(DECKS.map(d => d.era))]

  const energyChips = [
    { key: 'all', label: 'All Types' },
    ...usedEnergies.map(ek => ({
      key: ek, label: ENERGY_META[ek].label, color: ENERGY_META[ek].color,
    })),
  ]

  const eraChips = [
    { key: 'all', label: 'All Eras' },
    ...usedEras.map(ek => ({
      key: ek, label: ek, color: ERA_META[ek].color,
    })),
  ]

  const filtered = DECKS.filter(d => {
    if (energyFilter !== 'all' && d.energy !== energyFilter) return false
    if (eraFilter    !== 'all' && d.era    !== eraFilter)    return false
    return true
  })

  return (
    <>
      {/* Filter strips */}
      <FilterStrip
        label="Energy Type"
        chips={energyChips}
        active={energyFilter}
        onSelect={k => setEnergyFilter(k as EnergyType | 'all')}
      />
      <FilterStrip
        label="Era"
        chips={eraChips}
        active={eraFilter}
        onSelect={k => setEraFilter(k as EraKey | 'all')}
      />

      {/* Deck grid */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '2rem 2rem 6rem' }}>
        {/* Section bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          marginBottom: '1.75rem', paddingBottom: '0.55rem',
          borderBottom: '2px solid rgba(26,58,92,0.14)',
        }}>
          <span style={{
            fontFamily: 'var(--font-d)', fontSize: '0.68rem',
            textTransform: 'uppercase', letterSpacing: '0.2em',
            color: 'rgba(26,58,92,0.32)',
          }}>
            Competitive Decks
          </span>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(26,58,92,0.22)' }}>
            {filtered.length} deck{filtered.length !== 1 ? 's' : ''}
          </span>
          <Link
            to="/stats"
            style={{ marginLeft: 'auto', fontFamily: 'var(--font-d)', fontSize: '0.76rem', color: 'var(--navy)', opacity: 0.55 }}
          >
            Buy list →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '2.25rem 1.75rem',
        }}>
          {filtered.map((deck, i) => (
            <DeckEntry key={deck.slug} deck={deck} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(26,58,92,0.35)', fontFamily: 'var(--font-d)', fontSize: '1.1rem' }}>
            No decks match the selected filters.
          </div>
        )}
      </div>

      <StatusFooter decks={DECKS} />
    </>
  )
}
