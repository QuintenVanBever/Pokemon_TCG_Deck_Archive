import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { fetchEras, fetchFormats, fetchDecks } from '../lib/api'
import type { EraBlock, Format, DeckSummary } from '../lib/api'

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

export function FormatsPage() {
  const [eras,    setEras]    = useState<EraBlock[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [decks,   setDecks]   = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchEras(), fetchFormats(), fetchDecks()]).then(([e, f, d]) => {
      setEras(e)
      setFormats(f)
      setDecks(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-h))', fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'rgba(26,58,92,0.4)' }}>
      Loading…
    </div>
  )

  const blocks            = formats.filter(f => f.is_block === 1)
  const standaloneFormats = formats.filter(f => f.is_block === 0)

  const decksByEra    = (eraSlug: string) => decks.filter(d => d.era_slug === eraSlug).length
  const decksByFormat = (fmtSlug: string) => decks.filter(d => d.format   === fmtSlug).length
  const blocksForEra  = (eraId: number)   => blocks.filter(b => b.era_id  === eraId)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', width: 28, height: 3, background: 'var(--yellow)' }} />
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--yellow-d)' }}>
            Pokémon TCG
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--navy)' }}>
          Eras &amp; Formats
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(26,58,92,0.6)', lineHeight: 1.75, maxWidth: 540 }}>
          Each era has its own rules snapshot and card pool. Click an era to see its rules, primer, and associated decks.
        </p>
      </div>

      {/* Era cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem',
        marginBottom: standaloneFormats.length > 0 ? '2.5rem' : 0,
      }}>
        {eras.map(era => {
          const count     = decksByEra(era.slug)
          const eraBlocks = blocksForEra(era.id)
          return (
            <div key={era.id} style={{
              background: '#FFFFFF',
              border: '1px solid rgba(26,58,92,0.1)',
              borderLeft: `4px solid ${era.color}`,
            }}>
              {/* Era header — links to /eras/:slug */}
              <Link
                to="/eras/$slug"
                params={{ slug: era.slug }}
                style={{
                  display: 'block', padding: '1.25rem 1.5rem 1rem',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,58,92,0.025)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', color: 'var(--navy)' }}>
                    {era.name}
                  </span>
                  <span style={{
                    background: era.color + '22', color: era.color,
                    border: `1px solid ${era.color}44`,
                    fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em',
                    padding: '0.2rem 0.5rem',
                  }}>
                    {count} deck{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <span style={{
                  display: 'inline-block',
                  background: era.color + '18', color: era.color,
                  border: `1px solid ${era.color}55`,
                  fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '0.13rem 0.42rem',
                }}>
                  {era.key}
                </span>
              </Link>

              {/* Block formats within the era */}
              {eraBlocks.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(26,58,92,0.07)', padding: '0.6rem 1.5rem 0.9rem' }}>
                  <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.35)', fontWeight: 900, marginBottom: '0.45rem' }}>
                    Block Formats
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                    {eraBlocks.map(block => {
                      const marks = parseJsonArray(block.regulation_marks)
                      return (
                        <Link
                          key={block.id}
                          to="/formats/$slug"
                          params={{ slug: block.slug }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.35rem 0.6rem',
                            background: 'rgba(26,58,92,0.03)',
                            borderLeft: `2px solid ${era.color}`,
                            fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 600,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,58,92,0.06)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,58,92,0.03)' }}
                        >
                          <span>{block.name}</span>
                          {marks.length > 0 && (
                            <span style={{ display: 'flex', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                              {marks.map(m => (
                                <span key={m} style={{
                                  background: 'var(--navy)', color: 'var(--yellow)',
                                  padding: '1px 5px', fontSize: 9, fontFamily: 'var(--font-d)', fontWeight: 900,
                                }}>{m}</span>
                              ))}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Standalone (non-block) formats */}
      {standaloneFormats.length > 0 && (
        <>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '2px solid rgba(26,58,92,0.08)' }}>
            Other Formats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {standaloneFormats.map(fmt => {
              const count = decksByFormat(fmt.slug)
              const marks = parseJsonArray(fmt.regulation_marks)
              return (
                <Link
                  key={fmt.id}
                  to="/formats/$slug"
                  params={{ slug: fmt.slug }}
                  style={{
                    display: 'block', background: '#FFFFFF',
                    border: '1px solid rgba(26,58,92,0.1)',
                    borderLeft: `4px solid ${fmt.era_color ?? 'var(--sky)'}`,
                    padding: '1rem 1.25rem',
                    textDecoration: 'none', color: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,58,92,0.025)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: marks.length > 0 ? '0.4rem' : 0 }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--navy)' }}>{fmt.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(26,58,92,0.4)' }}>{count} deck{count !== 1 ? 's' : ''}</span>
                  </div>
                  {marks.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {marks.map(m => (
                        <span key={m} style={{
                          background: 'var(--navy)', color: 'var(--yellow)',
                          padding: '1px 5px', fontSize: 9, fontFamily: 'var(--font-d)', fontWeight: 900,
                        }}>{m}</span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
