import { Outlet, Link, useRouterState } from '@tanstack/react-router'

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

export function AdminLayout() {
  const path = useRouterState({ select: s => s.location.pathname })

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
      </div>
      <div style={{ overflowY: 'auto', background: '#F5F7FA' }}>
        <Outlet />
      </div>
    </div>
  )
}
