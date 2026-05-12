import React from 'react'

/* ── Era badge ─────────────────────────────────────────── */

type Era = 'hgss' | 'bw' | 'xy' | 'sm' | 'swsh' | 'sv'

const ERA_STYLES: Record<Era, React.CSSProperties> = {
  hgss: { background: 'rgba(196,135,59,.2)',  color: '#E8A850', border: '1px solid rgba(196,135,59,.4)' },
  bw:   { background: 'rgba(107,143,168,.2)', color: '#8BB0C8', border: '1px solid rgba(107,143,168,.4)' },
  xy:   { background: 'rgba(90,138,106,.2)',  color: '#7AB08A', border: '1px solid rgba(90,138,106,.4)' },
  sm:   { background: 'rgba(212,120,74,.2)',  color: '#E8946A', border: '1px solid rgba(212,120,74,.4)' },
  swsh: { background: 'rgba(74,123,212,.2)',  color: '#6A9BE8', border: '1px solid rgba(74,123,212,.4)' },
  sv:   { background: 'rgba(196,74,90,.2)',   color: '#E8706A', border: '1px solid rgba(196,74,90,.4)' },
}

const ERA_LABELS: Record<Era, string> = {
  hgss: 'HGSS', bw: 'BW', xy: 'XY', sm: 'SM', swsh: 'SwSh', sv: 'SV',
}

interface EraBadgeProps {
  era: Era
  label?: string
  size?: 'sm' | 'md'
}

export function EraBadge({ era, label, size = 'sm' }: EraBadgeProps) {
  return (
    <span
      style={{
        ...ERA_STYLES[era],
        fontFamily: 'var(--font-m)',
        fontSize: size === 'md' ? '.7rem' : '.6rem',
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        padding: size === 'md' ? '.28rem .65rem' : '.18rem .45rem',
        borderRadius: '3px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label ?? ERA_LABELS[era]}
    </span>
  )
}

/* ── Deck status badge ─────────────────────────────────── */

type DeckStatus = 'playable' | 'all-real' | 'wip' | 'awaiting'

const STATUS_STYLES: Record<DeckStatus, React.CSSProperties> = {
  'playable':  { background: 'rgba(91,168,122,.15)',  color: 'var(--real)',    border: '1px solid rgba(91,168,122,.3)' },
  'all-real':  { background: 'rgba(196,151,58,.15)',  color: 'var(--gold)',    border: '1px solid rgba(196,151,58,.3)' },
  'wip':       { background: 'rgba(212,98,74,.15)',   color: 'var(--missing)', border: '1px solid rgba(212,98,74,.3)' },
  'awaiting':  { background: 'rgba(79,158,196,.15)',  color: 'var(--ordered)', border: '1px solid rgba(79,158,196,.3)' },
}

const STATUS_LABELS: Record<DeckStatus, string> = {
  'playable': 'Playable',
  'all-real': 'All Real',
  'wip':      'WIP',
  'awaiting': 'Awaiting',
}

interface StatusBadgeProps {
  status: DeckStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      style={{
        ...STATUS_STYLES[status],
        fontFamily: 'var(--font-m)',
        fontSize: size === 'md' ? '.7rem' : '.6rem',
        fontWeight: 700,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        padding: size === 'md' ? '.28rem .65rem' : '.18rem .45rem',
        borderRadius: '3px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

/* ── Card-copy status pill ─────────────────────────────── */

type CopyStatus = 'real' | 'proxy' | 'missing' | 'ordered'

const PIP_STYLES: Record<CopyStatus, React.CSSProperties> = {
  real:    { background: 'var(--real-bg)',    color: 'var(--real)' },
  proxy:   { background: 'var(--proxy-bg)',   color: 'var(--proxy)' },
  missing: { background: 'var(--missing-bg)', color: 'var(--missing)' },
  ordered: { background: 'var(--ordered-bg)', color: 'var(--ordered)' },
}

interface StatusPipProps {
  status: CopyStatus
  count: number
}

export function StatusPip({ status, count }: StatusPipProps) {
  if (count === 0) return null
  const labels: Record<CopyStatus, string> = {
    real: 'Real', proxy: 'Proxy', missing: 'Missing', ordered: 'Ordered',
  }
  return (
    <span
      style={{
        ...PIP_STYLES[status],
        fontFamily: 'var(--font-m)',
        fontSize: '.65rem',
        fontWeight: 700,
        padding: '.18rem .42rem',
        borderRadius: '3px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.2rem',
        whiteSpace: 'nowrap',
      }}
    >
      ×{count} {labels[status]}
    </span>
  )
}

/* ── Progress bar (real/proxy/ordered/missing breakdown) ─ */

interface ProgressBarProps {
  real: number
  proxy: number
  ordered: number
  missing: number
  total: number
}

export function ProgressBar({ real, proxy, ordered, missing, total }: ProgressBarProps) {
  const pct = (n: number) => `${(n / total) * 100}%`
  return (
    <div style={{ display: 'flex', gap: '2px', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
      {real    > 0 && <div style={{ width: pct(real),    background: 'var(--real)' }} />}
      {proxy   > 0 && <div style={{ width: pct(proxy),   background: 'var(--proxy)' }} />}
      {ordered > 0 && <div style={{ width: pct(ordered), background: 'var(--ordered)' }} />}
      {missing > 0 && <div style={{ width: pct(missing), background: 'var(--missing)' }} />}
    </div>
  )
}
