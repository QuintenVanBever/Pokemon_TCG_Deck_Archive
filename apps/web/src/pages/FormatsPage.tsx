import React from 'react'
import { Link } from '@tanstack/react-router'
import { ERA_META, DECKS, type EraKey } from '../data/decks'

const ERA_ORDER: EraKey[] = ['HGSS', 'BW', 'XY', 'SM', 'SwSh', 'SV']

const ERA_DESCRIPTIONS: Record<EraKey, string> = {
  HGSS:  'HeartGold & SoulSilver block — Pokémon Primes, Lost Zone mechanics, and Junk Arm.',
  BW:    'Black & White block — EX Pokémon, ACE SPECs, and the Plasma Freeze sub-format.',
  XY:    'XY block — EX and BREAK Pokémon, Tool cards, and the Night March era.',
  SM:    'Sun & Moon block — GX Pokémon, Prism Stars, and Tag Teams.',
  SwSh:  'Sword & Shield block — V / VMAX Pokémon, Fusion Strike, and expanded VSTAR preview.',
  SV:    'Scarlet & Violet block — ex Pokémon, Tera mechanic, and ACE SPEC return.',
}

export function FormatsPage() {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', width: 28, height: 3, background: 'var(--yellow)' }} />
          <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--yellow-d)' }}>
            Pokémon TCG — Modified
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
      }}>
        {ERA_ORDER.map(era => {
          const meta  = ERA_META[era]
          const count = DECKS.filter(d => d.era === era).length
          return (
            <Link
              key={era}
              to="/eras/$slug"
              params={{ slug: meta.eraClass }}
              style={{
                display: 'block', background: '#FFFFFF',
                border: '1px solid rgba(26,58,92,0.1)',
                borderLeft: `4px solid ${meta.color}`,
                padding: '1.25rem 1.5rem',
                textDecoration: 'none', color: 'inherit',
                transition: 'box-shadow 0.18s, transform 0.18s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.boxShadow = '0 4px 18px rgba(26,58,92,0.12)'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.boxShadow = 'none'
                el.style.transform = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{
                  fontFamily: 'var(--font-d)', fontSize: '1.4rem', color: 'var(--navy)',
                }}>
                  {era} Block
                </span>
                <span style={{
                  background: meta.color + '22', color: meta.color,
                  fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em',
                  padding: '0.2rem 0.5rem',
                }}>
                  {count} deck{count !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(26,58,92,0.55)', lineHeight: 1.7 }}>
                {ERA_DESCRIPTIONS[era]}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
