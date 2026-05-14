import { useState, useEffect } from 'react'
import { adminS as S } from './AdminLayout'
import { fetchEraBlocks, BASE } from '../../lib/api'
import type { EraBlock } from '../../lib/api'
import { adminFetch } from '../../lib/adminAuth'

type EraForm = Omit<EraBlock, 'id'>

const empty = (): EraForm => ({
  slug: '', key: '', name: '', color: '#888888', dark: '#444444', badge_text_color: '#ffffff', sort_order: 0,
  ptcg_series: '', rules_primer: '', rules_json: '',
})

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function AdminErasPage() {
  const [eras,   setEras]   = useState<EraBlock[]>([])
  const [form,   setForm]   = useState<EraForm | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [saved,  setSaved]  = useState(false)

  const load = () => fetchEraBlocks().then(setEras)
  useEffect(() => { load() }, [])

  const openEdit = (b: EraBlock) => {
    setForm({
      slug: b.slug, key: b.key, name: b.name, color: b.color, dark: b.dark, badge_text_color: b.badge_text_color,
      sort_order: b.sort_order,
      ptcg_series:  b.ptcg_series  ?? '',
      rules_primer: b.rules_primer ?? '',
      rules_json:   b.rules_json   ?? '',
    })
    setEditId(b.id)
    setSaved(false)
  }

  const save = async () => {
    if (!form) return
    const body = {
      ...form,
      ptcg_series:  form.ptcg_series  || null,
      rules_primer: form.rules_primer || null,
      rules_json:   form.rules_json   || null,
    }
    if (editId) {
      await adminFetch(`${BASE}/api/admin/era-blocks/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    } else {
      await adminFetch(`${BASE}/api/admin/era-blocks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    load()
  }

  const deleteEra = async (id: number) => {
    if (!confirm('Delete this era? This cannot be undone.')) return
    await adminFetch(`${BASE}/api/admin/era-blocks/${id}`, { method: 'DELETE' })
    if (editId === id) { setForm(null); setEditId(null) }
    load()
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Eras</h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
        Each era maps to a pokemontcg.io series and holds the rules primer shown on the public era page.
      </p>

      {/* Form panel */}
      {form ? (
        <div style={S.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 14 }}>
            {editId ? `Editing era #${editId}` : 'New Era'}
          </div>

          {/* Identity row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 100px 100px 100px', gap: 10, marginBottom: 12 }}>
            {(['name', 'key', 'slug', 'sort_order', 'color', 'dark', 'badge_text_color'] as const).map(f => (
              <div key={f} style={S.field}>
                <label style={S.label}>{f === 'sort_order' ? 'Order' : f === 'badge_text_color' ? 'Badge text' : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                <input
                  style={{ ...S.input, ...(f === 'slug' || f === 'key' ? { fontFamily: 'monospace' } : {}) }}
                  type={f === 'sort_order' ? 'number' : 'text'}
                  value={(form as any)[f] ?? ''}
                  onChange={e => {
                    const v = f === 'sort_order' ? Number(e.target.value) : e.target.value
                    const next = { ...form, [f]: v }
                    if (f === 'name' && !editId) next.slug = slugify(e.target.value)
                    setForm(next)
                  }}
                />
              </div>
            ))}
          </div>

          {/* ptcg_series */}
          <div style={{ ...S.field, marginBottom: 12 }}>
            <label style={S.label}>pokemontcg.io series string</label>
            <input
              style={S.input}
              value={form.ptcg_series ?? ''}
              onChange={e => setForm(f => ({ ...f!, ptcg_series: e.target.value }))}
              placeholder="e.g. HeartGold & SoulSilver"
            />
            <span style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
              Must match the series field from pokemontcg.io exactly — used to filter sets on the era page.
            </span>
          </div>

          {/* rules_primer */}
          <div style={{ ...S.field, marginBottom: 12 }}>
            <label style={S.label}>Rules primer (Markdown)</label>
            <textarea
              style={{ ...S.input, height: 160, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
              value={form.rules_primer ?? ''}
              onChange={e => setForm(f => ({ ...f!, rules_primer: e.target.value }))}
              placeholder="Write the era's rules overview in Markdown…"
            />
          </div>

          {/* rules_json */}
          <div style={{ ...S.field, marginBottom: 16 }}>
            <label style={S.label}>Rules JSON (structured rules)</label>
            <textarea
              style={{ ...S.input, height: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
              value={form.rules_json ?? ''}
              onChange={e => setForm(f => ({ ...f!, rules_json: e.target.value }))}
              placeholder={'{"prizes": 6, "hand_size": 7, "bench_size": 5}'}
            />
            <span style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
              Optional JSON object for structured rule display (prize count, hand size, etc.)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={S.btnP} onClick={save} disabled={!form.name || !form.slug || !form.key}>Save era</button>
            <button style={S.btnS} onClick={() => { setForm(null); setEditId(null) }}>Cancel</button>
            {saved && <span style={{ fontSize: 12, color: '#2E8B57' }}>✓ Saved</span>}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <button style={S.btnP} onClick={() => { setForm(empty()); setEditId(null) }}>+ New Era</button>
        </div>
      )}

      {/* Eras list */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Key</th>
              <th style={S.th}>Name</th>
              <th style={{ ...S.th, fontFamily: 'monospace' }}>Slug</th>
              <th style={S.th}>pokemontcg.io Series</th>
              <th style={S.th}>Order</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {eras.map(b => (
              <tr key={b.id} style={{ background: editId === b.id ? '#F5F8FF' : undefined }}>
                <td style={{ ...S.td, color: '#aaa', fontSize: 11 }}>{b.id}</td>
                <td style={S.td}>
                  <span style={{ display: 'inline-block', background: b.color, color: b.badge_text_color, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>{b.key}</span>
                </td>
                <td style={{ ...S.td, fontWeight: 700 }}>{b.name}</td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{b.slug}</td>
                <td style={{ ...S.td, fontSize: 12, color: '#666' }}>{b.ptcg_series ?? <span style={{ color: '#ccc' }}>—</span>}</td>
                <td style={S.td}>{b.sort_order}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => openEdit(b)}>Edit</button>
                  <button style={S.btnD} onClick={() => deleteEra(b.id)}>Del</button>
                </td>
              </tr>
            ))}
            {eras.length === 0 && (
              <tr><td colSpan={8} style={{ ...S.td, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No eras</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
