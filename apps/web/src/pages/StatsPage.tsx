import React, { useState, useEffect, useMemo } from 'react'
import { deriveDeckStatus } from '../data/decks'
import { fetchDecks, fetchStatsOverview, fetchBuylist, type DeckSummary, type StatsOverview, type BuylistRow } from '../lib/api'

type TabId = 'per-deck' | 'buy-list' | 'per-card'
type SortDir = 'asc' | 'desc'

/* ── Panel wrapper ─────────────────────────────────── */

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

/* ── Headline counters ─────────────────────────────── */

function HeadlineGrid({ stats, decks }: { stats: StatsOverview; decks: DeckSummary[] }) {
  const playable = decks.filter(d => deriveDeckStatus(d.counts, d.intended_size) === 'playable').length
  const wip = decks.filter(d => deriveDeckStatus(d.counts, d.intended_size) === 'wip').length

  return (
    <div className="grid-4-to-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, background: 'rgba(26,58,92,0.08)', marginBottom: '1.75rem' }}>
      {[
        { val: stats.totalDecks,   label: 'Total Decks',   sub: `${playable} playable · ${wip} WIP`,  color: 'var(--navy)'    },
        { val: stats.totalReal,    label: 'Cards Real',    sub: 'across all decks',                    color: 'var(--real)'    },
        { val: stats.totalMissing, label: 'Cards Missing', sub: 'need to acquire',                     color: 'var(--missing)' },
        { val: stats.totalOrdered, label: 'On Order',      sub: 'cards in transit',                    color: 'var(--ordered)' },
      ].map(({ val, label, sub, color }) => (
        <div key={label} style={{ background: '#FFFFFF', padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', lineHeight: 1, color }}>{val}</span>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)' }}>{label}</span>
          <span style={{ fontSize: '0.76rem', color: 'rgba(26,58,92,0.55)', marginTop: '0.15rem' }}>{sub}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Per deck tab ──────────────────────────────────── */

function PerDeckTab({ decks }: { decks: DeckSummary[] }) {
  return (
    <Panel>
      <div className="scroll-x">
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
          {decks.map((deck, i) => {
            const { counts } = deck
            const status = deriveDeckStatus(counts, deck.intended_size)
            const statusLabel: Record<string, string>  = { playable: 'Playable', wip: 'WIP', awaiting: 'Awaiting' }
            const statusColor: Record<string, string>  = { playable: 'var(--real)', wip: 'var(--missing)', awaiting: 'var(--ordered)' }
            const tot = counts.real + counts.proxy + counts.missing + counts.ordered
            return (
              <tr key={deck.slug} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,92,0.02)' }}>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{deck.name}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', color: 'rgba(26,58,92,0.55)' }}>{tot}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: 'var(--real)' }}>{counts.real}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: counts.proxy   > 0 ? 'var(--proxy)'   : 'rgba(26,58,92,0.25)' }}>{counts.proxy}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: counts.missing > 0 ? 'var(--missing)' : 'rgba(26,58,92,0.25)' }}>{counts.missing}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', fontWeight: 700, color: counts.ordered > 0 ? 'var(--ordered)' : 'rgba(26,58,92,0.25)' }}>{counts.ordered}</td>
                <td style={{ padding: '0.55rem 0.8rem', borderBottom: '1px solid rgba(26,58,92,0.05)', color: statusColor[status], fontWeight: 700, fontSize: '0.72rem' }}>{statusLabel[status]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </Panel>
  )
}

/* ── Buy list tab ──────────────────────────────────── */

type EraOption = { slug: string; label: string; color: string }

function BuyListTab({ eras }: { eras: EraOption[] }) {
  const [eraFilter,     setEraFilter]     = useState('all')
  const [typeFilter,    setTypeFilter]    = useState('all')
  const [setFilter,     setSetFilter]     = useState('all')
  const [includeCustom, setIncludeCustom] = useState(false)
  const [rows,    setRows]    = useState<BuylistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortCol, setSortCol] = useState<'name' | 'supertype' | 'set_name' | 'missing' | 'ordered' | 'proxied' | 'deck_count'>('missing')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    setLoading(true)
    fetchBuylist({
      era:            eraFilter  !== 'all' ? eraFilter  : undefined,
      supertype:      typeFilter !== 'all' ? typeFilter : undefined,
      include_custom: includeCustom || undefined,
    }).then(data => { setRows(data); setLoading(false) })
  }, [eraFilter, typeFilter, includeCustom])

  const sortedRows = useMemo(() => {
    const filtered = setFilter === 'all' ? rows : rows.filter(r => r.set_name === setFilter)
    return [...filtered].sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortCol === 'name')       { va = a.name;       vb = b.name }
      else if (sortCol === 'supertype') { va = a.supertype;  vb = b.supertype }
      else if (sortCol === 'set_name')  { va = a.set_name ?? ''; vb = b.set_name ?? '' }
      else                          { va = a[sortCol];   vb = b[sortCol] }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, setFilter, sortCol, sortDir])

  const setOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: string[] = []
    for (const r of rows) {
      if (r.set_name && !seen.has(r.set_name)) { seen.add(r.set_name); opts.push(r.set_name) }
    }
    return opts.sort()
  }, [rows])

  const totalMissing = sortedRows.reduce((s, r) => s + r.missing, 0)
  const totalProxied = sortedRows.reduce((s, r) => s + r.proxied, 0)
  const totalOrdered = sortedRows.reduce((s, r) => s + r.ordered, 0)

  function exportCsv() {
    const header = 'Card,Set,Number,Type,Missing,Ordered,Proxied,In Decks\n'
    const body   = sortedRows
      .map(r => `"${r.name}","${r.set_name ?? ''}","${r.number ?? ''}","${r.supertype}",${r.missing},${r.ordered},${r.proxied},${r.deck_count}`)
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `buylist${eraFilter !== 'all' ? `-${eraFilter}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const typeChips = [
    { key: 'all',      label: 'All Types' },
    { key: 'Pokémon',  label: 'Pokémon'   },
    { key: 'Trainer',  label: 'Trainer'   },
    { key: 'Energy',   label: 'Energy'    },
  ]

  const tdBase: React.CSSProperties = {
    padding: '0.5rem 0.8rem',
    borderBottom: '1px solid rgba(26,58,92,0.05)',
  }

  const thBase: React.CSSProperties = {
    textAlign: 'left', fontFamily: 'var(--font-b)', fontSize: '0.6rem',
    fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'rgba(26,58,92,0.4)', padding: '0.5rem 0.8rem',
    borderBottom: '1px solid rgba(26,58,92,0.08)',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  }

  const SortTh = ({ col, children }: { col: typeof sortCol; children: React.ReactNode }) => {
    const active = sortCol === col
    const toggle = () => {
      if (active) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
      else { setSortCol(col); setSortDir('desc') }
    }
    return (
      <th onClick={toggle} style={{ ...thBase, color: active ? 'var(--navy)' : 'rgba(26,58,92,0.4)' }}>
        {children}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
      </th>
    )
  }

  return (
    <Panel>
      {/* Toolbar */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '2px solid rgba(26,58,92,0.08)',
        background: 'rgba(26,58,92,0.02)',
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center',
      }}>
        {/* Block dropdown */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(26,58,92,0.35)' }}>Block</span>
          <select
            value={eraFilter}
            onChange={e => setEraFilter(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: '1.5px solid rgba(26,58,92,0.15)', background: '#fff', fontFamily: 'var(--font-b)', fontWeight: 700, color: 'rgba(26,58,92,0.7)', cursor: 'pointer' }}
          >
            <option value="all">All Eras</option>
            {eras.map(e => <option key={e.slug} value={e.slug}>{e.label}</option>)}
          </select>
        </div>

        <div style={{ width: 1, height: 18, background: 'rgba(26,58,92,0.12)' }} />

        {/* Type chips */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(26,58,92,0.35)', marginRight: 4 }}>Type</span>
          {typeChips.map(t => (
            <FilterChip key={t.key} active={typeFilter === t.key} onClick={() => setTypeFilter(t.key)}>{t.label}</FilterChip>
          ))}
        </div>

        {/* Set dropdown */}
        {setOptions.length > 0 && (
          <>
            <div style={{ width: 1, height: 18, background: 'rgba(26,58,92,0.12)' }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(26,58,92,0.35)' }}>Set</span>
              <select
                value={setFilter}
                onChange={e => setSetFilter(e.target.value)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', border: '1.5px solid rgba(26,58,92,0.15)', background: '#fff', fontFamily: 'var(--font-b)', fontWeight: 700, color: 'rgba(26,58,92,0.7)', cursor: 'pointer', maxWidth: 160 }}
              >
                <option value="all">All Sets</option>
                {setOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Custom toggle */}
        <FilterChip active={includeCustom} onClick={() => setIncludeCustom(v => !v)}>
          Include custom
        </FilterChip>

        {/* Summary + export */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {totalMissing > 0 && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--missing)' }}>
              {totalMissing} missing
            </span>
          )}
          {totalProxied > 0 && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--proxy)' }}>
              {totalProxied} proxied
            </span>
          )}
          {totalOrdered > 0 && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ordered)' }}>
              {totalOrdered} ordered
            </span>
          )}
          <button
            onClick={exportCsv}
            style={chipStyle(false)}
            disabled={sortedRows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-d)', fontSize: '1rem', color: 'rgba(26,58,92,0.35)' }}>
          Loading…
        </div>
      ) : sortedRows.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-d)', fontSize: '1rem', color: 'rgba(26,58,92,0.35)' }}>
          No cards to acquire for this filter — looking good!
        </div>
      ) : (
        <div className="scroll-x">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <SortTh col="name">Card</SortTh>
              <SortTh col="set_name">Set</SortTh>
              <SortTh col="supertype">Type</SortTh>
              <SortTh col="missing">Missing ↓</SortTh>
              <SortTh col="ordered">Ordered</SortTh>
              <SortTh col="proxied">Proxied</SortTh>
              <SortTh col="deck_count">In Decks</SortTh>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={`${row.name}-${i}`} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,92,0.015)' }}>
                <td style={{ ...tdBase, fontFamily: 'var(--font-d)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)' }}>
                  {row.name}
                </td>
                <td style={{ ...tdBase, fontSize: '0.75rem', color: 'rgba(26,58,92,0.5)' }}>
                  {row.set_name
                    ? <>{row.set_name}{row.number && <span style={{ marginLeft: 4, fontSize: '0.68rem', color: 'rgba(26,58,92,0.35)', fontFamily: 'monospace' }}>#{row.number}</span>}</>
                    : <span style={{ color: 'rgba(26,58,92,0.25)' }}>—</span>}
                </td>
                <td style={{ ...tdBase, color: 'rgba(26,58,92,0.5)', fontSize: '0.78rem' }}>{row.supertype}</td>
                <td style={{ ...tdBase, fontWeight: 900, color: row.missing > 0 ? 'var(--missing)' : 'rgba(26,58,92,0.2)', fontSize: '1rem', fontFamily: 'var(--font-d)' }}>
                  {row.missing > 0 ? row.missing : '—'}
                </td>
                <td style={{ ...tdBase, fontWeight: 700, color: row.ordered > 0 ? 'var(--ordered)' : 'rgba(26,58,92,0.2)' }}>
                  {row.ordered > 0 ? row.ordered : '—'}
                </td>
                <td style={{ ...tdBase, fontWeight: 700, color: row.proxied > 0 ? 'var(--proxy)' : 'rgba(26,58,92,0.2)' }}>
                  {row.proxied > 0 ? row.proxied : '—'}
                </td>
                <td style={{ ...tdBase, fontSize: '0.72rem', color: 'rgba(26,58,92,0.4)' }}>
                  {row.deck_count} {row.deck_count === 1 ? 'deck' : 'decks'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </Panel>
  )
}

/* ── Helpers ───────────────────────────────────────── */

function FilterChip({ children, active, color, onClick }: {
  children: React.ReactNode; active: boolean; color?: string; onClick: () => void
}) {
  return <button onClick={onClick} style={chipStyle(active, color)}>{children}</button>
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
  const [activeTab, setActiveTab] = useState<TabId>('per-deck')
  const [decks, setDecks]         = useState<DeckSummary[]>([])
  const [stats, setStats]         = useState<StatsOverview | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([fetchDecks(), fetchStatsOverview()]).then(([d, s]) => {
      setDecks(d); setStats(s); setLoading(false)
    })
  }, [])

  const eras: EraOption[] = decks
    .reduce<EraOption[]>((acc, d) => {
      if (!acc.find(e => e.slug === d.era_slug))
        acc.push({ slug: d.era_slug, label: d.era, color: d.era_color })
      return acc
    }, [])

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'per-deck',  label: 'Per Deck'            },
    { id: 'buy-list',  label: 'Aggregated Buy List'  },
    { id: 'per-card',  label: 'Per Card'             },
  ]

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', width: 28, height: 3, background: 'var(--yellow)' }} />
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--yellow-d)' }}>
            Collection Overview
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, color: 'var(--navy)', letterSpacing: '-0.01em' }}>
          Statistics &amp; Buy List
        </h1>
      </div>

      {loading || !stats ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'rgba(26,58,92,0.35)' }}>Loading…</div>
      ) : (
        <>
          <HeadlineGrid stats={stats} decks={decks} />

          <div style={{ display: 'flex', borderBottom: '3px solid rgba(26,58,92,0.12)', marginBottom: '1.6rem' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.55rem 1.2rem', fontSize: '0.82rem', fontWeight: 700,
                  color: activeTab === tab.id ? 'var(--navy)' : 'rgba(26,58,92,0.45)',
                  cursor: 'pointer', background: 'transparent', border: 'none',
                  borderBottom: `3px solid ${activeTab === tab.id ? 'var(--yellow)' : 'transparent'}`,
                  marginBottom: -3, transition: 'all 0.14s',
                  fontFamily: 'var(--font-d)', letterSpacing: '0.03em',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'per-deck' && <PerDeckTab decks={decks} />}
          {activeTab === 'buy-list' && <BuyListTab eras={eras} />}
          {activeTab === 'per-card' && (
            <Panel style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-d)', fontSize: '1.3rem', color: 'rgba(26,58,92,0.5)' }}>
                Card search coming soon — find any card and see which decks use it.
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
