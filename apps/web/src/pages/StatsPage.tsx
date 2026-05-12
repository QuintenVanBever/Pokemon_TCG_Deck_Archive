import React, { useState } from 'react'
import { DECKS, ERA_META, STATUS_COLORS, deriveDeckStatus, type EraKey } from '../data/decks'

type TabId = 'per-deck' | 'buy-list' | 'per-card'

/* ── Mock buy-list data ────────────────────────────── */

interface BuyRow {
  id: number
  name: string
  era: EraKey
  setName: string
  supertype: string
  missing: number
  ordered: number
  proxied: number
  deckCount: number
}

const BUY_LIST: BuyRow[] = [
  { id:1, name:'Ultra Ball',        era:'BW',   setName:'Dark Explorers',  supertype:'Item',      missing:15, ordered:4, proxied:8,  deckCount:6 },
  { id:2, name:'Professor Juniper', era:'BW',   setName:'BW Base',         supertype:'Supporter', missing:12, ordered:0, proxied:4,  deckCount:5 },
  { id:3, name:'N',                 era:'BW',   setName:'Noble Victories', supertype:'Supporter', missing:8,  ordered:8, proxied:0,  deckCount:4 },
  { id:4, name:'Rare Candy',        era:'HGSS', setName:'Unleashed',       supertype:'Item',      missing:6,  ordered:0, proxied:6,  deckCount:3 },
  { id:5, name:'Colress',           era:'BW',   setName:'Plasma Storm',    supertype:'Supporter', missing:5,  ordered:4, proxied:0,  deckCount:3 },
  { id:6, name:'Junk Arm',          era:'HGSS', setName:'Triumphant',      supertype:'Item',      missing:4,  ordered:0, proxied:4,  deckCount:2 },
  { id:7, name:'VS Seeker',         era:'XY',   setName:'Phantom Forces',  supertype:'Item',      missing:3,  ordered:0, proxied:3,  deckCount:2 },
  { id:8, name:'Darkrai-EX',        era:'BW',   setName:'Dark Explorers',  supertype:'Pokémon',   missing:2,  ordered:2, proxied:0,  deckCount:1 },
]

/* ── Panel wrapper ─────────────────────────────────── */

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid rgba(26,58,92,0.1)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Headline counters ─────────────────────────────── */

function HeadlineGrid() {
  const totals = DECKS.reduce(
    (acc, d) => {
      acc.real    += d.counts.real
      acc.proxy   += d.counts.proxy
      acc.missing += d.counts.missing
      acc.ordered += d.counts.ordered
      return acc
    },
    { real: 0, proxy: 0, missing: 0, ordered: 0 },
  )
  const playable = DECKS.filter(d => {
    const s = deriveDeckStatus(d.counts)
    return s === 'all-real' || s === 'playable'
  }).length
  const wip = DECKS.filter(d => deriveDeckStatus(d.counts) === 'wip').length

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
      gap: 2, background: 'rgba(26,58,92,0.08)',
      marginBottom: '1.75rem',
    }}>
      {[
        { val: DECKS.length, label: 'Total Decks',   sub: `${playable} playable · ${wip} WIP`,  color: 'var(--navy)' },
        { val: totals.real,  label: 'Cards Real',    sub: 'across all decks',                     color: 'var(--real)' },
        { val: totals.missing, label: 'Cards Missing', sub: `${BUY_LIST.length} unique cards`,   color: 'var(--missing)' },
        { val: totals.ordered, label: 'On Order',    sub: 'cards in transit',                     color: 'var(--ordered)' },
      ].map(({ val, label, sub, color }) => (
        <div key={label} style={{
          background: '#FFFFFF', padding: '1.4rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', lineHeight: 1, color }}>{val}</span>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)' }}>{label}</span>
          <span style={{ fontSize: '0.76rem', color: 'rgba(26,58,92,0.55)', marginTop: '0.15rem' }}>{sub}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Per deck tab ──────────────────────────────────── */

function PerDeckTab() {
  return (
    <Panel>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {['Deck', 'Total', 'Real', 'Proxy', 'Missing', 'Ordered', 'Status'].map(h => (
              <th key={h} style={{
                textAlign: 'left', fontFamily: 'var(--font-b)', fontSize: '0.62rem',
                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'rgba(26,58,92,0.4)', padding: '0.55rem 0.8rem',
                borderBottom: '2px solid rgba(26,58,92,0.08)',
                background: 'rgba(26,58,92,0.03)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DECKS.map((deck, i) => {
            const status = deriveDeckStatus(deck.counts)
            const statusLabel: Record<string, string> = { 'all-real': 'All Real', playable: 'Playable', wip: 'WIP', awaiting: 'Awaiting' }
            const statusColor: Record<string, string> = { 'all-real': 'var(--real)', playable: 'var(--real)', wip: 'var(--missing)', awaiting: 'var(--ordered)' }
            return (
              <tr key={deck.slug} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,92,0.02)' }}>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{deck.name}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', color: 'rgba(26,58,92,0.55)' }}>{deck.counts.real + deck.counts.proxy + deck.counts.missing + deck.counts.ordered}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: 'var(--real)' }}>{deck.counts.real}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: deck.counts.proxy > 0 ? 'var(--proxy)' : 'rgba(26,58,92,0.25)' }}>{deck.counts.proxy}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: deck.counts.missing > 0 ? 'var(--missing)' : 'rgba(26,58,92,0.25)' }}>{deck.counts.missing}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: deck.counts.ordered > 0 ? 'var(--ordered)' : 'rgba(26,58,92,0.25)' }}>{deck.counts.ordered}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', color: statusColor[status], fontWeight: 700, fontSize: '0.72rem' }}>{statusLabel[status]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}

/* ── Buy list tab ──────────────────────────────────── */

function BuyListTab() {
  const [eraFilter, setEraFilter] = useState<EraKey | 'all'>('all')
  const eras: Array<EraKey | 'all'> = ['all', 'HGSS', 'BW', 'XY', 'SM', 'SwSh', 'SV']
  const eraLabels: Record<string, string> = { all: 'All Eras', HGSS: 'HGSS', BW: 'BW', XY: 'XY', SM: 'SM', SwSh: 'SwSh', SV: 'SV' }

  const rows = eraFilter === 'all' ? BUY_LIST : BUY_LIST.filter(r => r.era === eraFilter)
  const totalMissing = rows.reduce((s, r) => s + r.missing, 0)

  return (
    <Panel>
      {/* Toolbar */}
      <div style={{
        padding: '0.85rem 1.2rem', borderBottom: '2px solid rgba(26,58,92,0.08)',
        display: 'flex', gap: '0.4rem', alignItems: 'center',
        background: 'rgba(26,58,92,0.03)',
      }}>
        {eras.map(e => (
          <FilterChip key={e} active={eraFilter === e} color={e !== 'all' ? ERA_META[e as EraKey].color : undefined} onClick={() => setEraFilter(e)}>
            {eraLabels[e]}
          </FilterChip>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: 'var(--missing)' }}>
          {totalMissing} missing
        </span>
        <button style={chipStyle(false)}>Export CSV</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {['Card', 'Era / Set', 'Type', 'Missing ↓', 'Ordered', 'Proxied', 'In Decks'].map(h => (
              <th key={h} style={{
                textAlign: 'left', fontFamily: 'var(--font-b)', fontSize: '0.62rem',
                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'rgba(26,58,92,0.4)', padding: '0.55rem 0.8rem',
                borderBottom: '1px solid rgba(26,58,92,0.08)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,92,0.02)' }}>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontFamily: 'var(--font-d)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)' }}>
                {row.name}
              </td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)' }}>
                <span style={{
                  background: ERA_META[row.era].color + '22',
                  color: ERA_META[row.era].color,
                  fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.08em',
                  padding: '0.18rem 0.45rem', marginRight: '0.4rem',
                }}>
                  {row.era}
                </span>
                <span style={{ color: 'rgba(26,58,92,0.5)', fontSize: '0.78rem' }}>{row.setName}</span>
              </td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', color: 'rgba(26,58,92,0.5)', fontSize: '0.78rem' }}>{row.supertype}</td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 900, color: 'var(--missing)', fontSize: '1rem', fontFamily: 'var(--font-d)' }}>{row.missing}</td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: row.ordered > 0 ? 'var(--ordered)' : 'rgba(26,58,92,0.25)' }}>{row.ordered}</td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: row.proxied > 0 ? 'var(--proxy)' : 'rgba(26,58,92,0.25)' }}>{row.proxied}</td>
              <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontSize: '0.72rem', color: 'rgba(26,58,92,0.4)' }}>{row.deckCount} decks</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}

/* ── Helpers ───────────────────────────────────────── */

function FilterChip({ children, active, color, onClick }: {
  children: React.ReactNode; active: boolean; color?: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={chipStyle(active, color)}>{children}</button>
  )
}

function chipStyle(active: boolean, color?: string): React.CSSProperties {
  return {
    padding: '0.28rem 0.75rem', fontSize: '0.72rem', fontWeight: 700,
    cursor: 'pointer', border: 'none', fontFamily: 'var(--font-b)',
    transition: 'all 0.14s',
    background: active ? (color ?? 'var(--navy)') : 'rgba(26,58,92,0.06)',
    color: active ? '#fff' : 'rgba(26,58,92,0.55)',
  }
}

/* ── Page ──────────────────────────────────────────── */

export function StatsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('buy-list')

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'per-deck',  label: 'Per Deck'              },
    { id: 'buy-list',  label: 'Aggregated Buy List'   },
    { id: 'per-card',  label: 'Per Card'              },
  ]

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', width: 28, height: 3, background: 'var(--yellow)' }} />
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--yellow-d)' }}>
            Collection Overview
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem,4vw,3rem)',
          fontWeight: 400, color: 'var(--navy)', letterSpacing: '-0.01em',
        }}>
          Statistics &amp; Buy List
        </h1>
      </div>

      <HeadlineGrid />

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '3px solid rgba(26,58,92,0.12)',
        marginBottom: '1.6rem',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.55rem 1.2rem', fontSize: '0.82rem', fontWeight: 700,
              color: activeTab === tab.id ? 'var(--navy)' : 'rgba(26,58,92,0.45)',
              cursor: 'pointer', background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === tab.id ? 'var(--yellow)' : 'transparent'}`,
              marginBottom: -3, transition: 'all 0.14s',
              fontFamily: 'var(--font-d)', letterSpacing: '0.03em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'per-deck'  && <PerDeckTab />}
      {activeTab === 'buy-list'  && <BuyListTab />}
      {activeTab === 'per-card'  && (
        <Panel style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-d)', fontSize: '1.3rem', color: 'rgba(26,58,92,0.5)' }}>
            Card search coming soon — find any card and see which decks use it.
          </p>
        </Panel>
      )}
    </div>
  )
}
