import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { adminS as S } from './AdminLayout'
import { fetchDecks, fetchEraBlocks, BASE } from '../../lib/api'
import type { DeckSummary, EraBlock } from '../../lib/api'

const ENERGY_TYPES = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water']
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const emptyForm = () => ({
  name: '', slug: '', era_block_id: '', format_id: '', energy_type: 'Colorless', intended_size: '60', primer_md: '',
})

export function AdminDecksPage() {
  const [decks,   setDecks]   = useState<DeckSummary[]>([])
  const [blocks,  setBlocks]  = useState<EraBlock[]>([])
  const [formats, setFormats] = useState<{ id: number; name: string; era_id: number | null; is_block: number }[]>([])
  const [form,    setForm]    = useState<ReturnType<typeof emptyForm> | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const load = () => fetchDecks().then(setDecks)

  useEffect(() => {
    load()
    fetchEraBlocks().then(setBlocks)
    fetch(`${BASE}/api/formats`).then(r => r.json()).then((j: any) => setFormats(j.data))
  }, [])

  const createDeck = async () => {
    if (!form) return
    setCreateError(null)
    const res = await fetch(`${BASE}/api/admin/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         form.name,
        slug:         form.slug,
        era_block_id: Number(form.era_block_id),
        format_id:    Number(form.format_id),
        energy_type:  form.energy_type,
        intended_size: Number(form.intended_size),
        primer_md:    form.primer_md || undefined,
      }),
    })
    if (!res.ok) {
      const json = await res.json() as { error?: string }
      setCreateError(json.error ?? 'Failed to create deck')
      return
    }
    setForm(null); load()
  }

  const deleteDeck = async (id: number) => {
    if (!confirm('Delete this deck and all its cards?')) return
    await fetch(`${BASE}/api/admin/decks/${id}`, { method: 'DELETE' })
    load()
  }

  const totals = (d: DeckSummary) => d.counts.real + d.counts.proxy + d.counts.missing + d.counts.ordered

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Decks</h1>

      {/* Create form */}
      <div style={S.card}>
        {form ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>New Deck</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 10, marginBottom: 10 }}>
              <div style={S.field}>
                <label style={S.label}>Name</label>
                <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f!, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Magnezone Prime" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Slug</label>
                <input style={S.input} value={form.slug} onChange={e => setForm(f => ({ ...f!, slug: e.target.value }))} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Format</label>
                <select
                  style={S.select}
                  value={form.format_id}
                  onChange={e => {
                    const fmt = formats.find(f => f.id === Number(e.target.value))
                    setForm(f => ({
                      ...f!,
                      format_id: e.target.value,
                      era_block_id: fmt?.era_id ? String(fmt.era_id) : f!.era_block_id,
                    }))
                  }}
                >
                  <option value="">Select…</option>
                  {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Era</label>
                <select style={S.select} value={form.era_block_id} onChange={e => setForm(f => ({ ...f!, era_block_id: e.target.value }))}>
                  <option value="">Select…</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Type</label>
                <select style={S.select} value={form.energy_type} onChange={e => setForm(f => ({ ...f!, energy_type: e.target.value }))}>
                  {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Size</label>
                <input style={S.input} type="number" value={form.intended_size} onChange={e => setForm(f => ({ ...f!, intended_size: e.target.value }))} />
              </div>
            </div>
            {createError && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', color: '#CC3333', fontSize: 12, padding: '6px 10px', marginBottom: 8 }}>
                {createError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btnP} onClick={createDeck} disabled={!form.name || !form.era_block_id || !form.format_id}>Create Deck</button>
              <button style={S.btnS} onClick={() => { setForm(null); setCreateError(null) }}>Cancel</button>
            </div>
          </>
        ) : (
          <button style={S.btnP} onClick={() => setForm(emptyForm())}>+ New Deck</button>
        )}
      </div>

      {/* Decks table */}
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            {['Name', 'Era', 'Type', 'Format', 'Real', 'Proxy', 'Missing', 'Ordered', 'Total', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {decks.map(d => (
              <tr key={d.id}>
                <td style={{ ...S.td, fontWeight: 700 }}>{d.name}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', background: d.era_color, color: '#fff', padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{d.era}</span>
                </td>
                <td style={{ ...S.td, color: '#888' }}>{d.energy_type}</td>
                <td style={{ ...S.td, color: '#888' }}>{d.format}</td>
                <td style={{ ...S.td, color: '#2E8B57', fontWeight: 700 }}>{d.counts.real}</td>
                <td style={{ ...S.td, color: '#7B52C4' }}>{d.counts.proxy || '—'}</td>
                <td style={{ ...S.td, color: d.counts.missing ? '#CC3333' : '#aaa' }}>{d.counts.missing || '—'}</td>
                <td style={{ ...S.td, color: d.counts.ordered ? '#1E78C4' : '#aaa' }}>{d.counts.ordered || '—'}</td>
                <td style={S.td}>{totals(d)}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Link to="/admin/decks/$slug/edit" params={{ slug: d.slug }} style={{ textDecoration: 'none' }}>
                    <button style={{ ...S.btnP, marginRight: 4 }}>Edit</button>
                  </Link>
                  <button style={S.btnD} onClick={() => deleteDeck(d.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
