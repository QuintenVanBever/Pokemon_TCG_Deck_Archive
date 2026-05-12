import React from 'react'
import { Link } from '@tanstack/react-router'
import { DECKS, deriveDeckStatus } from '../data/decks'

/* ── Mock era data ─────────────────────────────────── */

const ERA = {
  name:     'HS Triumphant',
  code:     'HS4',
  eraClass: 'hgss',
  block:    'HGSS Block',
  released: 'November 2010',
  rules: {
    startingHand:    '7 cards',
    prizeCards:      '6',
    firstTurnAttack: false,
    mulligan:        'Opponent draws 1 card',
    legalPool:       'HeartGold & SoulSilver through Call of Legends. Certain BW-era cards legal in extended formats.',
    bannedCards:     'None',
  },
  primer: [
    'The HGSS format is defined by Pokémon-Prime powerhouses — cards with a golden star and dramatically amplified abilities. Cleffa (HS) is the universal draw engine: "Eeeeek" refreshes your hand to six, letting you reset dead hands at the cost of falling asleep.',
    "Eelektrik / Magnezone Prime is the dominant archetype. Dynamotor turns the discard pile into a recurring Energy source; Magnezone Prime's Lost Burn closes games by sending Energy to the Lost Zone to deal 50× damage, bypassing most resistances.",
    'The Gothitelle ACE SPEC lock — Item-locking your opponent with Gothitelle\'s Ability while attacking with Gardevoir — is the top control strategy. Counter it with Victini\'s Victory Star to negate the lock, or outrace it before Gothitelle hits the bench.',
    'Junk Arm is format-defining: four copies recycle any Item from the discard pile, effectively doubling your deck\'s Item density.',
  ],
  sets: [
    { code: 'HS1', name: 'HS Base Set',    current: false },
    { code: 'HS2', name: 'Unleashed',      current: false },
    { code: 'HS3', name: 'Undaunted',      current: false },
    { code: 'HS4', name: 'Triumphant',     current: true  },
    { code: 'HS5', name: 'Call of Legends',current: false },
  ],
}

const ERA_DECKS = DECKS.filter(d => d.eraClass === 'hgss')

/* ── Rule item ─────────────────────────────────────── */

function Rule({ label, value, highlight, wide }: { label: string; value: string; highlight?: boolean; wide?: boolean }) {
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
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: highlight ? 'var(--yellow-d)' : 'var(--navy)' }}>
        {value}
      </span>
    </div>
  )
}

/* ── Panel wrapper ─────────────────────────────────── */

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid rgba(26,58,92,0.1)',
      padding: '1.5rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────── */

export function EraPage() {
  return (
    <>
      {/* Header */}
      <div style={{
        borderBottom: '3px solid rgba(26,58,92,0.08)',
        padding: '2.5rem 2rem 1.75rem',
        background: 'rgba(255,255,255,0.6)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'rgba(26,58,92,0.45)', marginBottom: '0.9rem' }}>
            <Link to="/formats" style={{ color: 'rgba(26,58,92,0.45)' }}>Formats</Link>
            <span>/</span>
            <span>TCG Modified</span>
            <span>/</span>
            <span style={{ color: 'var(--yellow-d)', fontWeight: 700 }}>HGSS Block</span>
            <span>/</span>
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{ERA.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-d)', fontSize: 'clamp(1.9rem,3.5vw,3rem)',
              fontWeight: 400, color: 'var(--navy)', lineHeight: 1.08,
            }}>
              {ERA.name}
            </h1>
            <span style={{
              background: 'rgba(196,154,0,0.15)', color: 'var(--yellow-d)',
              border: '1px solid rgba(196,154,0,0.3)',
              fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '0.28rem 0.65rem',
            }}>
              {ERA.block}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(26,58,92,0.45)' }}>
              {ERA.released}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'rgba(26,58,92,0.6)', fontWeight: 400, lineHeight: 1.75, maxWidth: 620 }}>
            {ERA.primer[0].slice(0, 180)}…
          </p>
        </div>
      </div>

      {/* Body: two-column */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 270px',
        gap: '1.75rem', maxWidth: 1400, margin: '0 auto',
        padding: '1.75rem 2rem 4rem',
      }}>
        {/* Main column */}
        <div>
          {/* Rules */}
          <Panel style={{ marginBottom: '1.2rem' }}>
            <div style={{
              fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--navy)',
              marginBottom: '1.1rem', paddingBottom: '0.7rem',
              borderBottom: '2px solid rgba(26,58,92,0.08)',
            }}>
              Game Rules
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <Rule label="Starting Hand"    value={ERA.rules.startingHand} />
              <Rule label="Prize Cards"      value={ERA.rules.prizeCards}  highlight />
              <Rule label="First-Turn Attack" value={ERA.rules.firstTurnAttack ? 'Yes' : 'No'} />
              <Rule label="Mulligan Rule"    value={ERA.rules.mulligan} />
              <Rule label="Banned Cards"     value={ERA.rules.bannedCards} />
              <Rule label="Format Code"      value={ERA.code} highlight />
              <Rule label="Legal Card Pool"  value={ERA.rules.legalPool} wide />
            </div>
          </Panel>

          {/* Primer */}
          <Panel>
            <div style={{
              fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--navy)',
              marginBottom: '1.1rem', paddingBottom: '0.7rem',
              borderBottom: '2px solid rgba(26,58,92,0.08)',
            }}>
              Era Primer
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ERA.primer.map((p, i) => (
                <p key={i} style={{ fontSize: '0.86rem', color: 'rgba(26,58,92,0.65)', lineHeight: 1.78 }}>
                  {p}
                </p>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '2px solid rgba(26,58,92,0.08)', display: 'flex', gap: '0.5rem' }}>
              <button style={{
                padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
                background: 'var(--navy)', color: 'var(--yellow)', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-d)', letterSpacing: '0.04em',
              }}>
                Print Rules Sheet
              </button>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <aside>
          {/* Decks */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)',
            padding: '1.1rem', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.7rem' }}>
              Decks in this block
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {ERA_DECKS.map(deck => {
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
                      borderLeft: '3px solid var(--yellow)',
                      fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 600,
                    }}
                  >
                    {deck.name}
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: statusColor[status] }}>
                      {statusLabel[status]}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Sets */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(26,58,92,0.1)',
            padding: '1.1rem',
          }}>
            <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,58,92,0.4)', fontWeight: 900, marginBottom: '0.7rem' }}>
              HGSS Block Sets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {ERA.sets.map(set => (
                <a
                  key={set.code}
                  href="#"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.42rem 0.55rem',
                    background: set.current ? 'rgba(245,197,24,0.12)' : 'rgba(26,58,92,0.04)',
                    borderLeft: set.current ? '3px solid var(--yellow)' : '3px solid transparent',
                    fontSize: '0.78rem',
                    color: set.current ? 'var(--yellow-d)' : 'rgba(26,58,92,0.65)',
                    fontWeight: set.current ? 700 : 400,
                  }}
                >
                  {set.name}
                  <span style={{ fontSize: '0.65rem', color: set.current ? 'var(--yellow-d)' : 'rgba(26,58,92,0.35)' }}>
                    {set.code}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
