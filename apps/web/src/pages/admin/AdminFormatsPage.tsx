import { useState, useEffect } from 'react'
import { adminS as S } from './AdminLayout'
import { fetchFormats, BASE } from '../../lib/api'
import type { Format } from '../../lib/api'

interface PtcgSet {
  id: string
  name: string
  series: string
  releaseDate: string
  regulationMark: string | null
}

type FormatForm = {
  name: string
  slug: string
  sort_order: number
  regulation_marks: string[]
  legal_set_ids: string[]
}

const MARKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const emptyForm = (): FormatForm => ({
  name: '', slug: '', sort_order: 0, regulation_marks: [], legal_set_ids: [],
})

const fromFormat = (f: Format): FormatForm => ({
  name: f.name,
  slug: f.slug,
  sort_order: f.sort_order,
  regulation_marks: f.regulation_marks ? JSON.parse(f.regulation_marks) : [],
  legal_set_ids: f.legal_set_ids ? JSON.parse(f.legal_set_ids) : [],
})

export function AdminFormatsPage() {
  const [formats, setFormats] = useState<Format[]>([])
  const [form, setForm] = useState<FormatForm | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  // Set browser state
  const [allSets, setAllSets] = useState<PtcgSet[]>([])
  const [setSearch, setSetSearch] = useState('')
  const [loadingSets, setLoadingSets] = useState(false)

  const load = () => fetchFormats().then(setFormats)
  useEffect(() => { load() }, [])

  const loadSets = async () => {
    if (allSets.length > 0 || loadingSets) return
    setLoadingSets(true)
    try {
      const res  = await fetch(`${BASE}/api/admin/pokemontcg/sets`)
      const json = await res.json() as { data: PtcgSet[] }
      setAllSets(json.data)
    } finally {
      setLoadingSets(false)
    }
  }

  const openForm = (f?: Format) => {
    setForm(f ? fromFormat(f) : emptyForm())
    setEditId(f?.id ?? null)
    setSetSearch('')
    loadSets()
  }

  const saveFormat = async () => {
    if (!form) return
    const body = {
      name:             form.name,
      slug:             form.slug,
      sort_order:       form.sort_order,
      regulation_marks: form.regulation_marks.length ? JSON.stringify(form.regulation_marks) : null,
      legal_set_ids:    form.legal_set_ids.length    ? JSON.stringify(form.legal_set_ids)    : null,
    }
    if (editId) {
      await fetch(`${BASE}/api/admin/formats/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    } else {
      await fetch(`${BASE}/api/admin/formats`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    setForm(null); setEditId(null); load()
  }

  const deleteFormat = async (id: number) => {
    if (!confirm('Delete this format? Decks assigned to it will lose their format.')) return
    await fetch(`${BASE}/api/admin/formats/${id}`, { method: 'DELETE' })
    load()
  }

  const toggleMark = (mark: string) =>
    setForm(f => {
      if (!f) return f
      const has = f.regulation_marks.includes(mark)
      return { ...f, regulation_marks: has ? f.regulation_marks.filter(m => m !== mark) : [...f.regulation_marks, mark] }
    })

  const toggleSet = (setId: string) =>
    setForm(f => {
      if (!f) return f
      const has = f.legal_set_ids.includes(setId)
      return { ...f, legal_set_ids: has ? f.legal_set_ids.filter(s => s !== setId) : [...f.legal_set_ids, setId] }
    })

  const setQ = setSearch.toLowerCase()
  const filteredSets = allSets
    .filter(s => !setQ || s.name.toLowerCase().includes(setQ) || s.series.toLowerCase().includes(setQ) || s.id.toLowerCase().includes(setQ))
    .slice(0, 30)

  const setMap = Object.fromEntries(allSets.map(s => [s.id, s]))

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Formats</h1>

      {/* Form */}
      {form ? (
        <div style={S.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 14 }}>
            {editId ? `Editing format #${editId}` : 'New Format'}
          </div>

          {/* Basic fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: 10, marginBottom: 20 }}>
            <div style={S.field}>
              <label style={S.label}>Name</label>
              <input
                style={S.input}
                value={form.name}
                onChange={e => setForm(f => {
                  const n = { ...f!, name: e.target.value }
                  if (!editId) n.slug = slugify(e.target.value)
                  return n
                })}
                placeholder="Modified HGSS-on"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Slug</label>
              <input style={{ ...S.input, fontFamily: 'monospace' }} value={form.slug} onChange={e => setForm(f => ({ ...f!, slug: e.target.value }))} placeholder="modified-hgss" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Sort order</label>
              <input style={S.input} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f!, sort_order: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Regulation marks */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>
              Regulation Marks
              <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>For modern standard — cards must carry one of these marks</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MARKS.map(m => {
                const active = form.regulation_marks.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMark(m)}
                    style={{
                      width: 38, height: 38,
                      fontFamily: 'var(--font-d)', fontSize: 15, fontWeight: 900,
                      background: active ? 'var(--navy)' : '#F0F2F5',
                      color:      active ? 'var(--yellow)' : '#888',
                      border:     active ? '2px solid var(--navy)' : '2px solid #D0D5DD',
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
            {form.regulation_marks.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#888' }}>
                Cards with marks <strong>{form.regulation_marks.join(', ')}</strong> will be legal in this format
              </div>
            )}
          </div>

          {/* Legal sets */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>
              Legal Sets
              <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>For older modified formats — specific sets allowed in this format</span>
            </div>

            {/* Selected sets chips */}
            {form.legal_set_ids.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {form.legal_set_ids.map(sid => {
                  const s = setMap[sid]
                  return (
                    <span key={sid} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '3px 8px', fontSize: 11 }}>
                      <span style={{ fontWeight: 700 }}>{s?.name ?? sid}</span>
                      {s && <span style={{ color: '#888' }}>({s.id})</span>}
                      <button onClick={() => toggleSet(sid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Set browser */}
            <div style={{ border: '1.5px solid #D0D5DD' }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #E8ECF0', background: '#F8F9FB' }}>
                <input
                  style={{ ...S.input, width: '100%' }}
                  placeholder="Search sets by name, series, or ID…"
                  value={setSearch}
                  onChange={e => setSetSearch(e.target.value)}
                />
              </div>
              {loadingSets ? (
                <div style={{ padding: '16px 12px', color: '#888', fontSize: 12 }}>Loading sets from pokemontcg.io…</div>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Name</th>
                        <th style={S.th}>Series</th>
                        <th style={{ ...S.th, fontFamily: 'monospace' }}>Set ID</th>
                        <th style={S.th}>Released</th>
                        <th style={S.th}>Mark</th>
                        <th style={S.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSets.map(s => {
                        const inFormat = form.legal_set_ids.includes(s.id)
                        return (
                          <tr key={s.id} style={{ background: inFormat ? '#F0F4FF' : undefined }}>
                            <td style={{ ...S.td, fontWeight: 700 }}>{s.name}</td>
                            <td style={{ ...S.td, color: '#888', fontSize: 12 }}>{s.series}</td>
                            <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{s.id}</td>
                            <td style={{ ...S.td, fontSize: 11, color: '#aaa' }}>{s.releaseDate}</td>
                            <td style={S.td}>
                              {s.regulationMark
                                ? <span style={{ display: 'inline-block', background: 'var(--navy)', color: 'var(--yellow)', padding: '1px 7px', fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 900 }}>{s.regulationMark}</span>
                                : <span style={{ color: '#ccc' }}>—</span>
                              }
                            </td>
                            <td style={S.td}>
                              <button
                                onClick={() => toggleSet(s.id)}
                                style={inFormat ? { ...S.btnD, fontSize: 11, padding: '4px 8px' } : { ...S.btnP, fontSize: 11, padding: '4px 8px' }}
                              >
                                {inFormat ? '✕ Remove' : '+ Add'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {filteredSets.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ ...S.td, color: '#aaa', fontStyle: 'italic' }}>
                            {allSets.length === 0 ? 'Sets not loaded yet' : 'No sets match'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {filteredSets.length === 30 && (
                    <div style={{ padding: '6px 12px', fontSize: 11, color: '#aaa', borderTop: '1px solid #F0F2F5' }}>
                      Showing first 30 — narrow your search to find more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnP} onClick={saveFormat} disabled={!form.name || !form.slug}>Save Format</button>
            <button style={S.btnS} onClick={() => { setForm(null); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <button style={S.btnP} onClick={() => openForm()}>+ New Format</button>
        </div>
      )}

      {/* Formats list */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Name</th>
              <th style={{ ...S.th, fontFamily: 'monospace' }}>Slug</th>
              <th style={S.th}>Regulation Marks</th>
              <th style={S.th}>Legal Sets</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {formats.map(f => {
              const marks: string[] = f.regulation_marks ? JSON.parse(f.regulation_marks) : []
              const setIds: string[] = f.legal_set_ids ? JSON.parse(f.legal_set_ids) : []
              return (
                <tr key={f.id}>
                  <td style={{ ...S.td, color: '#aaa', fontSize: 11 }}>{f.id}</td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{f.name}</td>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{f.slug}</td>
                  <td style={S.td}>
                    {marks.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {marks.map(m => (
                          <span key={m} style={{ display: 'inline-block', background: 'var(--navy)', color: 'var(--yellow)', padding: '1px 7px', fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 900 }}>{m}</span>
                        ))}
                      </div>
                    ) : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td style={S.td}>
                    {setIds.length > 0
                      ? <span style={{ fontSize: 12 }}>{setIds.length} set{setIds.length !== 1 ? 's' : ''}</span>
                      : <span style={{ color: '#ccc' }}>—</span>
                    }
                  </td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => openForm(f)}>Edit</button>
                    <button style={S.btnD} onClick={() => deleteFormat(f.id)}>Del</button>
                  </td>
                </tr>
              )
            })}
            {formats.length === 0 && (
              <tr><td colSpan={6} style={{ ...S.td, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No formats yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
