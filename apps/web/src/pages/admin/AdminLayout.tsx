import { useState } from 'react'
import { Outlet, Link, useRouterState } from '@tanstack/react-router'
import { getAdminPassword, setAdminPassword, clearAdminPassword, adminFetch } from '../../lib/adminAuth'
import { BASE } from '../../lib/api'

const S = {
  page:    { padding: '24px 28px' },
  heading: { fontFamily: 'var(--font-d)', fontSize: 22, color: 'var(--navy)', marginBottom: 20, marginTop: 0 },
  card:    { background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20, marginBottom: 16 },
  table:   { width: '100%', borderCollapse: 'collapse' as const },
  th:      { padding: '8px 12px', textAlign: 'left' as const, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888', borderBottom: '2px solid #E8ECF0' },
  td:      { padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #F0F2F5', verticalAlign: 'middle' as const },
  input:   { padding: '6px 10px', fontSize: 13, border: '1.5px solid #D0D5DD', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  select:  { padding: '6px 10px', fontSize: 13, border: '1.5px solid #D0D5DD', outline: 'none', background: '#fff' },
  btnP:    { background: 'var(--navy)', color: 'var(--yellow)', border: 'none', padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-d)', letterSpacing: '0.05em' },
  btnS:    { background: '#fff', color: '#444', border: '1.5px solid #D0D5DD', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnD:    { background: '#fff', color: '#CC3333', border: '1.5px solid #FFAAAA', padding: '5px 10px', fontSize: 12, cursor: 'pointer' },
  label:   { fontSize: 11, fontWeight: 700 as const, color: '#555', marginBottom: 4, display: 'block' as const },
  row:     { display: 'flex', gap: 12, alignItems: 'flex-end' },
  field:   { display: 'flex', flexDirection: 'column' as const },
}

export { S as adminS }

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw]       = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw) return
    setBusy(true); setError('')
    setAdminPassword(pw)
    const res = await adminFetch(`${BASE}/api/admin/decks`)
    if (res.status === 401) {
      clearAdminPassword()
      setError('Incorrect password')
    } else {
      onAuth()
    }
    setBusy(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - var(--topbar-h))',
      background: '#F5F7FA',
    }}>
      <form onSubmit={submit} style={{
        background: '#fff', padding: '2rem 2.5rem',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        minWidth: 300, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, color: 'var(--navy)', marginBottom: 4 }}>
          Admin Login
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>Enter the admin password to continue.</div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{ padding: '8px 12px', fontSize: 14, border: '1.5px solid #D0D5DD', outline: 'none' }}
        />
        {error && <div style={{ fontSize: 12, color: '#CC3333' }}>{error}</div>}
        <button
          type="submit"
          disabled={busy || !pw}
          style={{
            background: 'var(--navy)', color: 'var(--yellow)',
            border: 'none', padding: '9px 0', fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--font-d)', cursor: busy ? 'default' : 'pointer',
            opacity: busy || !pw ? 0.6 : 1,
          }}
        >
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}

export function AdminLayout() {
  const path   = useRouterState({ select: s => s.location.pathname })
  const [authed, setAuthed] = useState(() => !!getAdminPassword())

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />

  const navLink = (to: string, label: string) => {
    const active = path.startsWith(to)
    return (
      <Link key={to} to={to} style={{
        display: 'block', padding: '10px 16px', textDecoration: 'none',
        fontSize: 13, fontWeight: 700,
        color: active ? 'var(--yellow)' : 'rgba(255,255,255,0.7)',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        borderLeft: `3px solid ${active ? 'var(--yellow)' : 'transparent'}`,
      }}>
        {label}
      </Link>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: 'calc(100vh - var(--topbar-h))', overflow: 'hidden' }}>
      <div style={{ background: '#0F1E2D', borderRight: '2px solid var(--yellow)', overflowY: 'auto', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 14px', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
          Admin
        </div>
        {navLink('/admin/decks', 'Decks')}
        {navLink('/admin/cards', 'Cards')}
        <div style={{ padding: '10px 16px 4px', marginTop: 6, fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
          Data
        </div>
        {navLink('/admin/formats', 'Formats')}
        {navLink('/admin/eras', 'Blocks & Eras')}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />
        <Link to="/decks" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          ← Public site
        </Link>
        <button
          onClick={() => { clearAdminPassword(); setAuthed(false) }}
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '8px 16px', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.25)',
          }}
        >
          Lock admin
        </button>
      </div>
      <div style={{ overflowY: 'auto', background: '#F5F7FA' }}>
        <Outlet />
      </div>
    </div>
  )
}
