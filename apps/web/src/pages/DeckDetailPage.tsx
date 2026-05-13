import React, { useState, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ENERGY_META, STATUS_COLORS, BAR_COLORS, deriveDeckStatus } from '../data/decks'
import { fetchDeck, fetchDecks, type DeckDetail, type DeckSummary, type DeckCard } from '../lib/api'
import type { EnergyType } from '../data/decks'

const ERA_STRIPES: Record<string, string> = {
  hgss: '#F5C518', bw: '#888888', xy: '#3DAA6A',
  sm: '#D93825', swsh: '#5BC0DE', sv: '#C03060',
}

const ERA_TEXT_COLORS: Record<string, string> = {
  hgss: '#C49A00', bw: '#666666', xy: '#2E8B57',
  sm: '#9A2018', swsh: '#3A8FAA', sv: '#8A2040',
}

const CARD_BACK = 'https://images.pokemontcg.io/cardback.png'

/* ── Left panel — deck list ──────────────────────────*/

function DeckListItem({ deck, isActive }: { deck: DeckSummary; isActive: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { counts } = deck
  const tot = counts.real + counts.proxy + counts.missing + counts.ordered
  const status = deriveDeckStatus(counts)

  let markColor = '#3EE080'; let mark = '✔'
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
        padding: '9px 14px 9px 0', margin: '1px 0',
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.11)' : hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        borderLeft: `4px solid ${ERA_STRIPES[deck.era_slug] ?? '#888'}`,
        textDecoration: 'none', transition: 'background 0.15s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
          {deck.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 600 }}>
          {tot} cards · {deck.era}
        </div>
      </div>
      <div style={{ fontSize: 14, flexShrink: 0, marginRight: 6, color: markColor }}>{mark}</div>
    </Link>
  )
}

/* ── Stat counter block ──────────────────────────────*/

function StatCounter({ value, label, type }: { value: number; label: string; type: SlotStatus }) {
  const topColors = { real: '#3EE080', proxy: '#C090FF', missing: '#FF4444', ordered: '#44BBFF' }
  const valColors = { real: '#2E8B57', proxy: '#7B52C4', missing: '#CC3333', ordered: '#1E78C4' }
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#FFFFFF', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: topColors[type] }} />
      <span style={{ fontFamily: 'var(--font-d)', fontSize: 28, lineHeight: 1, display: 'block', marginBottom: 2, color: valColors[type] }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAAAAA' }}>{label}</span>
    </div>
  )
}

/* ── Sleeve ──────────────────────────────────────────*/

type SlotStatus = 'real' | 'proxy' | 'missing' | 'ordered'

function Sleeve({ name, status, imageUrl, onClick }: { name: string; status: SlotStatus; imageUrl: string | null; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const src = imageUrl ?? CARD_BACK

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '63/88', position: 'relative', cursor: 'pointer',
        transform: hovered ? 'translateY(-3px) scale(1.08)' : 'none',
        zIndex: hovered ? 2 : 'auto', transition: 'transform 0.14s',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={name}
        style={{
          width: '100%', height: '100%', display: 'block', objectFit: 'cover',
          filter: status === 'missing' ? 'grayscale(100%) brightness(0.45)' : 'none',
        }}
      />

      {/* Proxy: construction tape diagonal stripes + label */}
      {status === 'proxy' && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(-45deg, rgba(255,204,0,0.55) 0px, rgba(255,204,0,0.55) 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 10px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.78)', color: '#FFD700',
            fontSize: 6, fontWeight: 900, textAlign: 'center', padding: '2px 0', letterSpacing: '0.14em',
          }}>PROXY</div>
        </>
      )}

      {/* Missing: grayscale filter on img + banner */}
      {status === 'missing' && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.85)', color: '#FF6666',
          fontSize: 6, fontWeight: 900, textAlign: 'center', padding: '2px 0', letterSpacing: '0.14em',
        }}>MISSING</div>
      )}

      {/* Ordered: strong blue tint + ◎ + label */}
      {status === 'ordered' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,120,196,0.45)' }} />
          <span style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 14, color: 'rgba(160,220,255,0.95)',
            textShadow: '0 0 4px rgba(0,0,0,0.6)',
          }}>◎</span>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(20,90,170,0.85)', color: '#CCE8FF',
            fontSize: 6, fontWeight: 900, textAlign: 'center', padding: '2px 0', letterSpacing: '0.14em',
          }}>ORDERED</div>
        </>
      )}

      {hovered && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--navy)', color: '#fff', fontSize: 10, fontWeight: 700,
          whiteSpace: 'nowrap', padding: '4px 8px', zIndex: 10, pointerEvents: 'none',
        }}>
          {name}
        </div>
      )}
    </div>
  )
}

/* ── Sleeve grid ─────────────────────────────────────*/

function SleeveGrid({ cards, onCardClick }: { cards: DeckCard[]; onCardClick: (slot: { name: string; imageUrl: string | null; status: SlotStatus }) => void }) {
  const slots: Array<{ name: string; status: SlotStatus; imageUrl: string | null }> = []
  for (const card of cards) {
    for (let i = 0; i < card.qty_real;    i++) slots.push({ name: card.name, status: 'real',    imageUrl: card.image_url })
    for (let i = 0; i < card.qty_proxy;   i++) slots.push({ name: card.name, status: 'proxy',   imageUrl: card.image_url })
    for (let i = 0; i < card.qty_ordered; i++) slots.push({ name: card.name, status: 'ordered', imageUrl: card.image_url })
    for (let i = 0; i < card.qty_missing; i++) slots.push({ name: card.name, status: 'missing', imageUrl: card.image_url })
  }
  while (slots.length < 60) slots.push({ name: '?', status: 'real', imageUrl: null })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
      {slots.slice(0, 60).map((slot, i) => (
        <Sleeve
          key={i}
          name={slot.name}
          status={slot.status}
          imageUrl={slot.imageUrl}
          onClick={() => onCardClick(slot)}
        />
      ))}
    </div>
  )
}

/* ── Card expand modal ───────────────────────────────*/

function CardModal({ name, imageUrl, status, onClose }: { name: string; imageUrl: string | null; status: SlotStatus; onClose: () => void }) {
  const src = imageUrl ?? CARD_BACK
  const statusLabel: Record<SlotStatus, string> = { real: 'Real', proxy: 'Proxy', missing: 'Missing', ordered: 'Ordered' }
  const statusColor: Record<SlotStatus, string> = { real: '#2E8B57', proxy: '#7B52C4', missing: '#CC3333', ordered: '#1E78C4' }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 280,
          background: 'var(--navy)', padding: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            width: '100%', display: 'block',
            aspectRatio: '63/88', objectFit: 'cover',
            filter: status === 'missing' ? 'grayscale(100%) brightness(0.45)' : 'none',
          }}
        />
        <div style={{ padding: '8px 6px 6px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 14, color: '#fff', marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: statusColor[status] }}>{statusLabel[status]}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -10, right: -10,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--yellow)', color: 'var(--navy)',
            border: 'none', fontSize: 13, cursor: 'pointer',
            fontWeight: 900, lineHeight: '24px', textAlign: 'center', padding: 0,
          }}
        >✕</button>
      </div>
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

  const [deck, setDeck]       = useState<DeckDetail | null>(null)
  const [allDecks, setAll]    = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEras, setExpandedEras] = useState<Record<string, boolean>>({})
  const [expandedCard, setExpandedCard] = useState<{ name: string; imageUrl: string | null; status: SlotStatus } | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDeck(slug), fetchDecks()]).then(([d, all]) => {
      setDeck(d)
      setAll(all)
      if (d) setExpandedEras({ [d.era_slug]: true })
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
        Loading…
      </div>
    )
  }

  if (!deck) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
        Deck not found.
      </div>
    )
  }

  const eraOrder = ['hgss', 'bw', 'xy', 'sm', 'swsh', 'sv']
  const byEra = eraOrder.reduce<Record<string, DeckSummary[]>>((acc, eSlug) => {
    const group = allDecks.filter(d => d.era_slug === eSlug)
    if (group.length > 0) acc[eSlug] = group
    return acc
  }, {})

  const eraTextColor = ERA_TEXT_COLORS[deck.era_slug] ?? '#888'
  const energyMeta   = ENERGY_META[deck.energy_type as EnergyType]
  const eraLabel     = `${deck.era_name} · ${energyMeta?.label ?? deck.energy_type}`
  const { counts }   = deck
  const totalCards   = counts.real + counts.proxy + counts.missing + counts.ordered

  const barSegs = (['real', 'proxy', 'ordered', 'missing'] as const)
    .filter(s => counts[s] > 0)
    .map(s => ({ key: s, flex: counts[s], color: BAR_COLORS[s] }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', height: 'calc(100vh - var(--topbar-h))', overflow: 'hidden' }}>

      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div style={{ background: 'var(--navy)', overflowY: 'auto', padding: '16px 0', borderRight: '3px solid var(--yellow)' }}>
        {Object.entries(byEra).map(([eraSlug, decks]) => {
          const isExpanded = expandedEras[eraSlug] ?? false
          return (
            <div key={eraSlug}>
              <button
                onClick={() => setExpandedEras(x => ({ ...x, [eraSlug]: !x[eraSlug] }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '6px 16px 4px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-b)',
                }}
              >
                <span>{decks[0].era} Block</span>
                <span style={{ fontSize: 8 }}>{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && decks.map(d => (
                <DeckListItem key={d.slug} deck={d} isActive={d.slug === slug} />
              ))}
            </div>
          )
        })}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div style={{ overflowY: 'auto', padding: '24px 28px 32px', background: 'var(--sky-l)' }}>
        {/* Deck header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <Link to="/decks" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(26,58,92,0.45)', textDecoration: 'none' }}>
              ← All Decks
            </Link>
          </div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: eraTextColor, marginBottom: 4 }}>
            {eraLabel}
          </div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 30, color: 'var(--navy)', lineHeight: 1.05, textShadow: '1px 1px 0 rgba(0,0,0,0.07)', marginBottom: 6 }}>
            {deck.name}
          </div>
          {deck.format_name && (
            <div style={{ fontSize: 11, color: 'rgba(26,58,92,0.45)', fontWeight: 700, marginBottom: 18, letterSpacing: '0.04em' }}>
              {deck.format_name}
            </div>
          )}

          {/* Stat counters */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 22, boxShadow: '0 2px 8px rgba(26,58,92,0.08)' }}>
            {(['real', 'proxy', 'missing', 'ordered'] as const).map((type, i) => (
              <React.Fragment key={type}>
                {i > 0 && <div style={{ width: 2, background: 'var(--sky-l)' }} />}
                <StatCounter value={counts[type]} label={type.charAt(0).toUpperCase() + type.slice(1)} type={type} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Sleeve grid */}
        <div style={{ background: '#FFFFFF', padding: 18, boxShadow: '0 4px 20px rgba(26,58,92,0.1)', marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 14 }}>
            All {totalCards} cards · click to enlarge · hover for name
          </div>
          <SleeveGrid cards={deck.cards} onCardClick={setExpandedCard} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 16 }}>
          {([
            { key: 'real',    label: 'Real',    bg: '#FAFAFA', border: '#CCDDDD' },
            { key: 'proxy',   label: 'Proxy',   bg: '#FFD700', border: '#C49A00' },
            { key: 'ordered', label: 'Ordered', bg: '#1E78C4', border: '#1055A0' },
            { key: 'missing', label: 'Missing', bg: '#1A2030', border: 'rgba(200,200,200,0.3)' },
          ] as const).map(({ key, label, bg, border }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--dark)' }}>
              <div style={{ width: 14, height: 20, background: bg, border: `1.5px solid ${border}` }} />
              {label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, display: 'flex', background: 'rgba(26,58,92,0.08)', marginBottom: 20 }}>
          {barSegs.map(({ key, flex, color }) => (
            <div key={key} style={{ flex, background: color }} />
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionBtn primary>Generate Proxy PDF</ActionBtn>
          <ActionBtn>Export Decklist</ActionBtn>
          <Link to="/eras/$slug" params={{ slug: deck.era_slug }} style={{ textDecoration: 'none' }}>
            <ActionBtn>Era Rules</ActionBtn>
          </Link>
        </div>
      </div>

      {/* Card expand modal */}
      {expandedCard && (
        <CardModal
          name={expandedCard.name}
          imageUrl={expandedCard.imageUrl}
          status={expandedCard.status}
          onClose={() => setExpandedCard(null)}
        />
      )}
    </div>
  )
}
