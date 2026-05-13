import React, { useState, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { deriveDeckStatus } from '../data/decks'
import { fetchEra, fetchDecks, fetchPtcgSets } from '../lib/api'
import type { EraBlock, DeckSummary, PtcgSet } from '../lib/api'

/* ── Helpers ─────────────────────────────────────────*/

function humanizeKey(k: string) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function parseRulesJson(raw: string | null): Record<string, string> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v)])
    )
  } catch { return null }
}

/* ── Rule tile ───────────────────────────────────────*/

function Rule({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div style={{
      background: 'rgba(26,58,92,0.04)',
      border: '1px solid rgba(26,58,92,0.08)',
      padding: '0.6rem 0.7rem',
      display: 'flex', flexDirection: 'column', gap: '0.12rem',
      ...(wide ? { gridColumn: '1 / -1' } : {}),
    }}>
      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>
        {value}
      </span>
    </div>
  )
}

/* ── Panel wrapper ───────────────────────────────────*/

function Panel({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', padding: '1.5rem', ...style }}>
      {title && (
        <div style={{
          fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--navy)',
          marginBottom: '1.1rem', paddingBottom: '0.7rem',
          borderBottom: '2px solid rgba(26,58,92,0.08)',
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────*/

export function EraPage() {
  const { slug } = useParams({ from: '/eras/$slug' })

  const [era,     setEra]     = useState<EraBlock | null>(null)
  const [decks,   setDecks]   = useState<DeckSummary[]>([])
  const [sets,    setSets]    = useState<PtcgSet[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([fetchEra(slug), fetchDecks({ era: slug }), fetchPtcgSets()]).then(([e, d, s]) => {
      if (!e) { setNotFound(true); setLoading(false); return }
      setEra(e)
      setDecks(d)
      setSets(e.ptcg_series ? s.filter(set => set.series === e.ptcg_series).reverse() : [])
      setLoading(false)
    })
  }, [slug])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
      Loading…
    </div>
  )

  if (notFound || !era) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
      Era not found. <Link to="/formats" style={{ marginLeft: 8, color: 'var(--sky)' }}>Back to Formats</Link>
    </div>
  )

  const rules  = parseRulesJson(era.rules_json)
  const primer = era.rules_primer
    ? era.rules_primer.split(/\n\n+/).filter(Boolean)
    : null

  const primerExcerpt = era.rules_primer
    ? era.rules_primer.slice(0, 200).trimEnd() + (era.rules_primer.length > 200 ? '…' : '')
    : null

  return (
    <>
      {/* ── Header ───────────────────────────────── */}
      <div style={{
        borderBottom: '3px solid rgba(26,58,92,0.08)',
        padding: '2.5rem 2rem 1.75rem',
        background: 'rgba(255,255,255,0.6)',
        borderLeft: `6px solid ${era.color}`,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'rgba(26,58,92,0.45)', marginBottom: '0.9rem' }}>
            <Link to="/formats" style={{ color: 'rgba(26,58,92,0.45)' }}>Formats</Link>
            <span>/</span>
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{era.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.9rem,3.5vw,3rem)', fontWeight: 400, color: 'var(--navy)', lineHeight: 1.08 }}>
              {era.name}
            </h1>
            <span style={{
              background: era.color + '22', color: era.color,
              border: `1px solid ${era.color}55`,
              fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '0.28rem 0.65rem',
            }}>
              {era.key}
            </span>
            {era.ptcg_series && (
              <span style={{ fontSize: '0.72rem', color: 'rgba(26,58,92,0.45)' }}>
                {era.ptcg_series}
              </span>
            )}
          </div>

          {primerExcerpt && (
            <p style={{ fontSize: '0.9rem', color: 'rgba(26,58,92,0.6)', lineHeight: 1.75, maxWidth: 620 }}>
              {primerExcerpt}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 270px',
        gap: '1.75rem', maxWidth: 1400, margin: '0 auto',
        padding: '1.75rem 2rem 4rem',
      }}>

        {/* Main column */}
        <div style={{ minWidth: 0 }}>

          {/* Game Rules */}
          <Panel title="Game Rules" style={{ marginBottom: '1.2rem' }}>
            {rules ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                {Object.entries(rules).map(([k, v], i, arr) => (
                  <Rule
                    key={k}
                    label={humanizeKey(k)}
                    value={v}
                    wide={i === arr.length - 1 && arr.length % 2 !== 0}
                  />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'rgba(26,58,92,0.4)', fontStyle: 'italic' }}>
                No structured rules data yet — edit this era in admin to add them.
              </p>
            )}
          </Panel>

          {/* Era Primer */}
          <Panel title="Era Primer">
            {primer ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {primer.map((p, i) => (
                    <p key={i} style={{ fontSize: '0.86rem', color: 'rgba(26,58,92,0.65)', lineHeight: 1.78, margin: 0 }}>
                      {p}
                    </p>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '2px solid rgba(26,58,92,0.08)' }}>
                  <button style={{
                    padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
                    background: 'var(--navy)', color: 'var(--yellow)', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-d)', letterSpacing: '0.04em',
                  }}>
                    Print Rules Sheet
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'rgba(26,58,92,0.4)', fontStyle: 'italic' }}>
                No primer written yet — edit this era in admin to add one.
              </p>
            )}
          </Panel>
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Decks */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.7rem' }}>
              Decks in this era ({decks.length})
            </div>
            {decks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'rgba(26,58,92,0.35)', fontStyle: 'italic' }}>No decks yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {decks.map(deck => {
                  const status = deriveDeckStatus(deck.counts)
                  const statusColor: Record<string, string> = { 'all-real': 'var(--real)', playable: 'var(--real)', wip: 'var(--missing)', awaiting: 'var(--ordered)' }
                  const statusLabel: Record<string, string> = { 'all-real': 'All Real', playable: 'Playable', wip: 'WIP', awaiting: 'Awaiting' }
                  return (
                    <Link
                      key={deck.slug}
                      to="/decks/$slug"
                      params={{ slug: deck.slug }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.42rem 0.55rem', background: 'rgba(26,58,92,0.04)',
                        borderLeft: `3px solid ${era.color}`,
                        fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{deck.name}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: statusColor[status], flexShrink: 0, marginLeft: 6 }}>
                        {statusLabel[status]}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sets */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.7rem' }}>
              {era.name} Sets ({sets.length})
            </div>
            {sets.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'rgba(26,58,92,0.35)', fontStyle: 'italic' }}>
                {era.ptcg_series ? 'No sets found' : 'No pokemontcg.io series configured'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sets.map(set => (
                  <div
                    key={set.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.42rem 0.55rem', background: 'rgba(26,58,92,0.04)',
                      borderLeft: '3px solid transparent',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{set.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {set.regulationMark && (
                        <span style={{ background: 'var(--navy)', color: 'var(--yellow)', padding: '1px 5px', fontSize: 10, fontFamily: 'var(--font-d)', fontWeight: 900 }}>
                          {set.regulationMark}
                        </span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: 'rgba(26,58,92,0.35)', fontFamily: 'monospace' }}>{set.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>
      </div>
    </>
  )
}
