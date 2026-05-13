import React, { useState, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { deriveDeckStatus } from '../data/decks'
import { fetchFormat, fetchDecks, fetchPtcgSets } from '../lib/api'
import type { FormatDetail, DeckSummary, PtcgSet } from '../lib/api'

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

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

export function FormatDetailPage() {
  const { slug } = useParams({ from: '/formats/$slug' })

  const [format,   setFormat]   = useState<FormatDetail | null>(null)
  const [decks,    setDecks]    = useState<DeckSummary[]>([])
  const [sets,     setSets]     = useState<PtcgSet[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([fetchFormat(slug), fetchDecks({ format: slug }), fetchPtcgSets()]).then(([f, d, s]) => {
      if (!f) { setNotFound(true); setLoading(false); return }
      setFormat(f)
      setDecks(d)

      if (f.is_block && f.era_ptcg_series) {
        setSets(s.filter(set => set.series === f.era_ptcg_series).reverse())
      } else {
        const ids = parseJsonArray(f.legal_set_ids)
        setSets(ids.length > 0 ? s.filter(set => ids.includes(set.id)) : [])
      }

      setLoading(false)
    })
  }, [slug])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
      Loading…
    </div>
  )

  if (notFound || !format) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
      Format not found. <Link to="/formats" style={{ marginLeft: 8, color: 'var(--sky)' }}>Back to Formats</Link>
    </div>
  )

  const marks      = parseJsonArray(format.regulation_marks)
  const legalIds   = parseJsonArray(format.legal_set_ids)
  const accentColor = format.era_color ?? 'var(--sky)'

  return (
    <>
      {/* Header */}
      <div style={{
        borderBottom: '3px solid rgba(26,58,92,0.08)',
        padding: '2.5rem 2rem 1.75rem',
        background: 'rgba(255,255,255,0.6)',
        borderLeft: `6px solid ${accentColor}`,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'rgba(26,58,92,0.45)', marginBottom: '0.9rem' }}>
            <Link to="/formats" style={{ color: 'rgba(26,58,92,0.45)' }}>Formats</Link>
            {format.era_slug && (
              <>
                <span>/</span>
                <Link to="/eras/$slug" params={{ slug: format.era_slug }} style={{ color: 'rgba(26,58,92,0.45)' }}>
                  {format.era_name}
                </Link>
              </>
            )}
            <span>/</span>
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{format.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.9rem,3.5vw,3rem)', fontWeight: 400, color: 'var(--navy)', lineHeight: 1.08 }}>
              {format.name}
            </h1>
            {format.is_block === 1 && (
              <span style={{
                background: accentColor + '22', color: accentColor,
                border: `1px solid ${accentColor}55`,
                fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '0.28rem 0.65rem',
              }}>
                Block Format
              </span>
            )}
          </div>

          {marks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'rgba(26,58,92,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Regulation marks</span>
              {marks.map(m => (
                <span key={m} style={{
                  background: 'var(--navy)', color: 'var(--yellow)',
                  padding: '2px 7px', fontSize: 10, fontFamily: 'var(--font-d)', fontWeight: 900,
                }}>{m}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 270px',
        gap: '1.75rem', maxWidth: 1400, margin: '0 auto',
        padding: '1.75rem 2rem 4rem',
      }}>

        {/* Main column */}
        <div style={{ minWidth: 0 }}>

          {/* Sets panel */}
          <Panel title="Card Pool" style={{ marginBottom: '1.2rem' }}>
            {sets.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'rgba(26,58,92,0.4)', fontStyle: 'italic' }}>
                {legalIds.length === 0 && !format.era_ptcg_series
                  ? 'No card pool configured — edit this format in admin to add regulation marks or legal sets.'
                  : 'No matching sets found.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sets.map(set => (
                  <div
                    key={set.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.42rem 0.7rem', background: 'rgba(26,58,92,0.03)',
                      borderLeft: `3px solid ${accentColor}`,
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600 }}>{set.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {set.regulationMark && (
                        <span style={{
                          background: 'var(--navy)', color: 'var(--yellow)',
                          padding: '1px 5px', fontSize: 9, fontFamily: 'var(--font-d)', fontWeight: 900,
                        }}>{set.regulationMark}</span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: 'rgba(26,58,92,0.35)', fontFamily: 'monospace' }}>{set.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Era link (if block format) */}
          {format.era_slug && (
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', padding: '1.1rem' }}>
              <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.6rem' }}>
                Parent Era
              </div>
              <Link
                to="/eras/$slug"
                params={{ slug: format.era_slug }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.55rem',
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  display: 'inline-block', width: 8, height: 8,
                  background: accentColor, flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 700 }}>
                  {format.era_name}
                </span>
              </Link>
            </div>
          )}

          {/* Decks */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.7rem' }}>
              Decks in this format ({decks.length})
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
                        borderLeft: `3px solid ${accentColor}`,
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

        </aside>
      </div>
    </>
  )
}
