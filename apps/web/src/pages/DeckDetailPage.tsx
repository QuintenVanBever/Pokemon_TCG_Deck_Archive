import React, { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { DECKS, ERA_META, STATUS_COLORS, BAR_COLORS, deriveDeckStatus, type Deck, type CardStatus } from '../data/decks'

/* ── Era stripe colors for the left-panel deck list ─ */
const ERA_STRIPES: Record<string, string> = {
  hgss: '#F5C518',
  bw:   '#888888',
  xy:   '#3DAA6A',
  sm:   '#D93825',
  swsh: '#5BC0DE',
  sv:   '#C03060',
}

const ERA_TEXT_COLORS: Record<string, string> = {
  hgss: '#C49A00',
  bw:   '#666666',
  xy:   '#2E8B57',
  sm:   '#9A2018',
  swsh: '#3A8FAA',
  sv:   '#8A2040',
}

/* ── Left panel — deck list ──────────────────────────*/

function DeckListItem({ deck, isActive }: { deck: Deck; isActive: boolean }) {
  const [hovered, setHovered] = useState(false)
  const tot = deck.counts.real + deck.counts.proxy + deck.counts.missing + deck.counts.ordered
  const status = deriveDeckStatus(deck.counts)

  let markColor = '#3EE080'
  let mark = '✔'
  if (status === 'wip')      { markColor = '#FF6655'; mark = '!' }
  if (status === 'awaiting') { markColor = '#44BBFF'; mark = '◎' }

  return (
    <Link
      to="/decks/$slug"
      params={{ slug: deck.slug }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px 9px 0',
        margin: '1px 0',
        cursor: 'pointer',
        background: isActive
          ? 'rgba(255,255,255,0.11)'
          : hovered
            ? 'rgba(255,255,255,0.07)'
            : 'transparent',
        borderLeft: `4px solid ${ERA_STRIPES[deck.eraClass] ?? '#888'}`,
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 10 }}>
        <div style={{
          fontSize: 12, fontWeight: 800, color: '#FFFFFF',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}>
          {deck.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 600 }}>
          {tot} cards · {deck.era}
        </div>
      </div>
      <div style={{ fontSize: 14, flexShrink: 0, marginRight: 6, color: markColor }}>
        {mark}
      </div>
    </Link>
  )
}

/* ── Stat counter block ──────────────────────────────*/

function StatCounter({ value, label, type }: { value: number; label: string; type: CardStatus }) {
  const topColors: Record<CardStatus, string> = {
    real:    '#3EE080',
    proxy:   '#C090FF',
    missing: '#FF4444',
    ordered: '#44BBFF',
  }
  const valColors: Record<CardStatus, string> = {
    real:    '#2E8B57',
    proxy:   '#7B52C4',
    missing: '#CC3333',
    ordered: '#1E78C4',
  }
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 0',
      background: '#FFFFFF', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4, background: topColors[type],
      }} />
      <span style={{
        fontFamily: 'var(--font-d)', fontSize: 28, lineHeight: 1,
        display: 'block', marginBottom: 2,
        color: valColors[type],
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#AAAAAA',
      }}>
        {label}
      </span>
    </div>
  )
}

/* ── Sleeve ──────────────────────────────────────────*/

function Sleeve({ name, status }: { name: string; status: CardStatus }) {
  const [hovered, setHovered] = useState(false)

  const sleeveStyles: Record<CardStatus, React.CSSProperties> = {
    real: {
      background: '#FAFAFA',
      border: '1.5px solid #CCDDDD',
      boxShadow: 'inset 0 0 0 2px #F0F8FF',
    },
    proxy: {
      background: '#FFFAE5',
      border: '1.5px solid #D4B840',
    },
    missing: {
      background: '#1A2030',
      border: '1.5px dashed rgba(200,200,200,0.2)',
    },
    ordered: {
      background: '#E8F6FF',
      border: '1.5px solid #7ABCDC',
    },
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '63/88',
        position: 'relative',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-3px) scale(1.08)' : 'none',
        zIndex: hovered ? 2 : 'auto',
        transition: 'transform 0.14s',
        ...sleeveStyles[status],
      }}
    >
      {/* Status indicator */}
      {status === 'proxy' && (
        <span style={{
          position: 'absolute', bottom: 2, right: 3,
          fontSize: 6, fontWeight: 900, color: 'rgba(196,152,0,0.5)',
        }}>P</span>
      )}
      {status === 'missing' && (
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 10, color: 'rgba(255,100,100,0.35)', fontWeight: 900,
        }}>×</span>
      )}
      {status === 'ordered' && (
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 8, color: 'rgba(30,120,196,0.45)',
        }}>◎</span>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--navy)', color: '#fff',
          fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
          padding: '4px 8px', zIndex: 10, pointerEvents: 'none',
        }}>
          {name}
        </div>
      )}
    </div>
  )
}

/* ── Sleeve grid ─────────────────────────────────────*/

function SleeveGrid({ deck }: { deck: Deck }) {
  const slots: Array<{ name: string; status: CardStatus }> = []
  for (const card of deck.cards) {
    for (let i = 0; i < card.count; i++) {
      slots.push({ name: card.name, status: card.status })
    }
  }
  while (slots.length < 60) slots.push({ name: '?', status: 'real' })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gap: 4,
    }}>
      {slots.slice(0, 60).map((slot, i) => (
        <Sleeve key={i} name={slot.name} status={slot.status} />
      ))}
    </div>
  )
}

/* ── Action button ───────────────────────────────────*/

function ActionBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-d)', fontSize: '0.75rem', letterSpacing: '0.05em',
        padding: '0.4rem 1.1rem', cursor: 'pointer',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 3px 10px rgba(0,0,0,0.14)' : 'none',
        transition: 'transform 0.14s, box-shadow 0.14s',
        background: primary ? 'var(--navy)' : 'rgba(26,58,92,0.09)',
        color: primary ? 'var(--yellow)' : 'var(--navy)',
        border: primary ? 'none' : '2px solid rgba(26,58,92,0.2)',
      }}
    >
      {children}
    </button>
  )
}

/* ── Page ────────────────────────────────────────────*/

export function DeckDetailPage() {
  const { slug } = useParams({ from: '/decks/$slug' })
  const deck = DECKS.find(d => d.slug === slug) ?? DECKS[0]

  // Group decks by era for the left panel
  const eraOrder: string[] = ['HGSS', 'BW', 'XY', 'SM', 'SwSh', 'SV']
  const byEra = eraOrder.reduce<Record<string, Deck[]>>((acc, era) => {
    const group = DECKS.filter(d => d.era === era)
    if (group.length > 0) acc[era] = group
    return acc
  }, {})

  const eraTextColor = ERA_TEXT_COLORS[deck.eraClass] ?? '#888'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '256px 1fr',
      height: 'calc(100vh - var(--topbar-h))',
      overflow: 'hidden',
    }}>
      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div style={{
        background: 'var(--navy)',
        overflowY: 'auto',
        padding: '16px 0',
        borderRight: '3px solid var(--yellow)',
      }}>
        {Object.entries(byEra).map(([era, decks]) => (
          <div key={era}>
            <div style={{
              padding: '6px 16px 4px',
              fontSize: 9, fontWeight: 900, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
            }}>
              {era} Block
            </div>
            {decks.map(d => (
              <DeckListItem key={d.slug} deck={d} isActive={d.slug === deck.slug} />
            ))}
          </div>
        ))}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div style={{
        overflowY: 'auto',
        padding: '24px 28px 32px',
        background: 'var(--sky-l)',
      }}>
        {/* Deck header */}
        <div style={{ marginBottom: 20 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 8 }}>
            <Link
              to="/decks"
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                color: 'rgba(26,58,92,0.45)', textDecoration: 'none',
              }}
            >
              ← All Decks
            </Link>
          </div>

          {/* Era label */}
          <div style={{
            fontSize: 10, fontWeight: 900, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: eraTextColor, marginBottom: 4,
          }}>
            {deck.eraLabel}
          </div>

          {/* Deck name */}
          <div style={{
            fontFamily: 'var(--font-d)', fontSize: 30,
            color: 'var(--navy)', lineHeight: 1.05,
            textShadow: '1px 1px 0 rgba(0,0,0,0.07)',
            marginBottom: 18,
          }}>
            {deck.name}
          </div>

          {/* Stat counters */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 22, boxShadow: '0 2px 8px rgba(26,58,92,0.08)' }}>
            {(['real', 'proxy', 'missing', 'ordered'] as CardStatus[]).map((type, i) => (
              <React.Fragment key={type}>
                {i > 0 && <div style={{ width: 2, background: 'var(--sky-l)' }} />}
                <StatCounter value={deck.counts[type]} label={type.charAt(0).toUpperCase() + type.slice(1)} type={type} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Sleeve grid */}
        <div style={{
          background: '#FFFFFF',
          padding: 18,
          boxShadow: '0 4px 20px rgba(26,58,92,0.1)',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 14,
          }}>
            All {deck.counts.real + deck.counts.proxy + deck.counts.missing + deck.counts.ordered} cards · hover for card name
          </div>
          <SleeveGrid deck={deck} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 16 }}>
          {([
            { key: 'real',    label: 'Real',    bg: '#FAFAFA', border: '#CCDDDD' },
            { key: 'proxy',   label: 'Proxy',   bg: '#FFFAE5', border: '#D4B840' },
            { key: 'ordered', label: 'Ordered', bg: '#E8F6FF', border: '#7ABCDC' },
            { key: 'missing', label: 'Missing', bg: '#1A2030', border: 'rgba(200,200,200,0.3)' },
          ] as const).map(({ key, label, bg, border }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--dark)' }}>
              <div style={{ width: 14, height: 20, background: bg, border: `1.5px solid ${border}` }} />
              {label}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <ActionBtn primary>Generate Proxy PDF</ActionBtn>
          <ActionBtn>Export Decklist</ActionBtn>
          <Link
            to="/eras/$slug"
            params={{ slug: deck.eraClass }}
            style={{ textDecoration: 'none' }}
          >
            <ActionBtn>Era Rules</ActionBtn>
          </Link>
        </div>
      </div>
    </div>
  )
}
