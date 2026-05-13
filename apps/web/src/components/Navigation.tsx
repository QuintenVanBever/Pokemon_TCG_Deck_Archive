import React, { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

const NAV_LINKS = [
  { to: '/decks',   label: 'Decks'    },
  { to: '/stats',   label: 'Stats'    },
  { to: '/formats', label: 'Formats'  },
]

export function Navigation() {
  const router = useRouterState()
  const pathname = router.location.pathname
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'var(--navy)',
      borderBottom: '4px solid var(--yellow)',
      display: 'flex', alignItems: 'stretch',
      height: 'var(--topbar-h)',
    }}>
      {/* Logo */}
      <Link
        to="/decks"
        style={{
          display: 'flex', alignItems: 'center',
          padding: '0 1.5rem', gap: '0.6rem',
          borderRight: '2px solid rgba(255,255,255,0.1)',
          flexShrink: 0, textDecoration: 'none',
        }}
      >
        <div style={{
          width: 28, height: 28,
          background: 'var(--yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-d)', fontSize: 13,
          color: 'var(--navy)', flexShrink: 0,
        }}>
          DA
        </div>
        <span className="nav-wordmark" style={{
          fontFamily: 'var(--font-d)', fontSize: '1.2rem',
          color: 'var(--yellow)',
          letterSpacing: '0.3px',
        }}>
          Deck{' '}
          <span style={{ color: 'var(--sky)' }}>Archive</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 1rem' }}>
        {NAV_LINKS.map(({ to, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/')
          const hovered = hoveredLink === to
          return (
            <Link
              key={to}
              to={to}
              onMouseEnter={() => setHoveredLink(to)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                fontFamily: 'var(--font-d)', fontSize: '0.82rem',
                letterSpacing: '0.04em',
                color: active
                  ? 'var(--yellow)'
                  : hovered
                    ? 'rgba(255,255,255,0.72)'
                    : 'rgba(255,255,255,0.42)',
                padding: '0 1rem', height: 'var(--topbar-h)',
                display: 'flex', alignItems: 'center',
                borderBottom: active ? '3px solid var(--yellow)' : '3px solid transparent',
                marginBottom: '-4px',
                transition: 'color 0.15s, border-color 0.15s',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: admin button */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 1.5rem', gap: '0.75rem',
        borderLeft: '2px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <AdminButton />
      </div>
    </nav>
  )
}

function AdminButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to="/admin"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-d)', fontSize: '0.72rem',
        letterSpacing: '0.05em',
        padding: '0.3rem 0.9rem',
        background: hovered ? 'var(--sky)' : 'transparent',
        border: '2px solid var(--sky)',
        color: hovered ? 'var(--navy)' : 'var(--sky)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      Admin ↗
    </Link>
  )
}
