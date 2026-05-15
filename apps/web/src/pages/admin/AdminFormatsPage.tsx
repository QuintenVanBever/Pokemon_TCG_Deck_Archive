import React, { useState, useEffect, useMemo } from 'react'
import { usePersistedState } from '../../lib/usePersistedState'
import { adminS as S } from './AdminLayout'
import { fetchFormats, fetchEraBlocks, BASE } from '../../lib/api'
import type { Format, EraBlock } from '../../lib/api'
import { adminFetch } from '../../lib/adminAuth'

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
  era_id: number | null
  is_block: boolean
  regulation_marks: string[]
  legal_set_ids: string[]
}

const MARKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const emptyForm = (): FormatForm => ({
  name: '', slug: '', sort_order: 0, era_id: null, is_block: false,
  regulation_marks: [], legal_set_ids: [],
})

const fromFormat = (f: Format): FormatForm => ({
  name: f.name,
  slug: f.slug,
  sort_order: f.sort_order,
  era_id: f.era_id ?? null,
  is_block: !!f.is_block,
  regulation_marks: f.regulation_marks ? JSON.parse(f.regulation_marks) : [],
  legal_set_ids:    f.legal_set_ids    ? JSON.parse(f.legal_set_ids)    : [],
})

export function AdminFormatsPage() {
  const [formats,  setFormats]  = useState<Format[]>([])
  const [eras,     setEras]     = useState<EraBlock[]>([])
  const [form,     setForm]     = useState<FormatForm | null>(null)
  const [editId,   setEditId]   = useState<number | null>(null)

  // Filter + sort state
  const [eraFilter, setEraFilter] = usePersistedState('admin:formats:era', '')
  type SortCol = 'name' | 'era'
  const [sortCol, setSortCol] = usePersistedState<SortCol>('admin:formats:sortCol', 'era')
  const [sortDir, setSortDir] = usePersistedState<'asc' | 'desc'>('admin:formats:sortDir', 'asc')

  // Set browser state
  const [allSets,     setAllSets]     = useState<PtcgSet[]>([])
  const [setSearch,   setSetSearch]   = useState('')
  const [loadingSets, setLoadingSets] = useState(false)

  const load = () => Promise.all([fetchFormats(), fetchEraBlocks()]).then(([f, e]) => { setFormats(f); setEras(e) })
  useEffect(() => { load() }, [])

  const loadSets = async () => {
    if (allSets.length > 0 || loadingSets) return
    setLoadingSets(true)
    try {
      const res  = await adminFetch(`${BASE}/api/admin/pokemontcg/sets`)
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
      era_id:           form.era_id,
      is_block:         form.is_block ? 1 : 0,
      regulation_marks: form.regulation_marks.length ? JSON.stringify(form.regulation_marks) : null,
      legal_set_ids:    form.legal_set_ids.length    ? JSON.stringify(form.legal_set_ids)    : null,
    }
    if (editId) {
      await adminFetch(`${BASE}/api/admin/formats/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    } else {
      await adminFetch(`${BASE}/api/admin/formats`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    setForm(null); setEditId(null); load()
  }

  const deleteFormat = async (id: number) => {
    if (!confirm('Delete this format? Decks assigned to it will lose their format.')) return
    await adminFetch(`${BASE}/api/admin/formats/${id}`, { method: 'DELETE' })
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

  // Derive the selected era's ptcg_series for auto-filtering
  const selectedEra = form?.era_id ? eras.find(e => e.id === form.era_id) : null
  const seriesFilter = form?.is_block && selectedEra?.ptcg_series ? selectedEra.ptcg_series : null

  const setQ = setSearch.toLowerCase()
  const filteredSets = allSets
    .filter(s => {
      if (seriesFilter && s.series !== seriesFilter) return false
      if (setQ) return s.name.toLowerCase().includes(setQ) || s.series.toLowerCase().includes(setQ) || s.id.toLowerCase().includes(setQ)
      return true
    })
    .slice(0, 50)

  const setMap = Object.fromEntries(allSets.map(s => [s.id, s]))

  const eraName = (eraId: number | null) => eras.find(e => e.id === eraId)?.name ?? '—'

  const eraOrderById = useMemo(() => {
    const map: Record<number, number> = {}
    eras.forEach(e => { map[e.id] = e.sort_order })
    return map
  }, [eras])

  const filteredFormats = useMemo(() => {
    let result = eraFilter
      ? formats.filter(f => String(f.era_id) === eraFilter)
      : [...formats]

    result.sort((a, b) => {
      const eraA = a.era_id ? (eraOrderById[a.era_id] ?? 99) : 99
      const eraB = b.era_id ? (eraOrderById[b.era_id] ?? 99) : 99
      let cmp = 0
      if (sortCol === 'era') {
        cmp = eraA - eraB || a.name.localeCompare(b.name)
      } else {
        cmp = a.name.localeCompare(b.name)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [formats, eraFilter, sortCol, sortDir, eraOrderById])

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortTh = ({ col, children, style }: { col: SortCol; children: React.ReactNode; style?: React.CSSProperties }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{ ...S.th, cursor: 'pointer', userSelect: 'none', color: sortCol === col ? '#1a3a5c' : undefined, ...style }}
    >
      {children}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <div style={S.page} className="admin-page">
      <h1 style={S.heading}>Formats</h1>

      {/* Form */}
      {form ? (
        <div style={S.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 14 }}>
            {editId ? `Editing format #${editId}` : 'New Format'}
          </div>

          {/* Basic fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: 10, marginBottom: 14 }}>
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
                placeholder="HGSS Block"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Slug</label>
              <input style={{ ...S.input, fontFamily: 'monospace' }} value={form.slug} onChange={e => setForm(f => ({ ...f!, slug: e.target.value }))} placeholder="hgss-block" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Sort order</label>
              <input style={S.input} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f!, sort_order: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Era + is_block row */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20, padding: '12px 14px', background: '#F5F8FF', border: '1.5px solid #C7D2FE' }}>
            <div style={S.field}>
              <label style={S.label}>Era</label>
              <select
                style={S.select}
                value={form.era_id ?? ''}
                onChange={e => setForm(f => ({ ...f!, era_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">— none —</option>
                {eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={S.label}>Block format?</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.is_block}
                  onChange={e => setForm(f => ({ ...f!, is_block: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: form.is_block ? 'var(--navy)' : '#aaa' }}>
                  Is Block
                </span>
              </label>
              {form.is_block && selectedEra && (
                <span style={{ fontSize: 11, color: '#5B9BD5' }}>
                  Set browser filtered to {selectedEra.ptcg_series ?? selectedEra.name}
                </span>
              )}
              {form.is_block && !selectedEra && (
                <span style={{ fontSize: 11, color: '#CC8800' }}>Select an era above to auto-filter sets</span>
              )}
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
                      fontFamily: 'var(--font-d)', fontSize: 15,
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
          </div>

          {/* Legal sets */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>
              Legal Sets
              {seriesFilter && (
                <span style={{ fontWeight: 400, color: '#5B9BD5', marginLeft: 8 }}>
                  Auto-filtered to {seriesFilter}
                </span>
              )}
            </div>

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

            <div style={{ border: '1.5px solid #D0D5DD' }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #E8ECF0', background: '#F8F9FB' }}>
                <input
                  style={{ ...S.input, width: '100%' }}
                  placeholder={seriesFilter ? `Search in ${seriesFilter}…` : 'Search sets by name, series, or ID…'}
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
                  {filteredSets.length === 50 && (
                    <div style={{ padding: '6px 12px', fontSize: 11, color: '#aaa', borderTop: '1px solid #F0F2F5' }}>
                      Showing first 50 — narrow your search to see more
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
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={S.field}>
            <label style={S.label}>Era</label>
            <select
              style={S.select}
              value={eraFilter}
              onChange={e => setEraFilter(e.target.value)}
            >
              <option value="">All eras</option>
              {eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          {eraFilter && (
            <button style={S.btnS} onClick={() => setEraFilter('')}>Clear</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa', alignSelf: 'center' }}>
            {filteredFormats.length} / {formats.length} formats
          </span>
        </div>

        <div className="scroll-x">
        <table style={S.table}>
          <thead>
            <tr>
              <SortTh col="name">Name</SortTh>
              <th style={{ ...S.th, fontFamily: 'monospace' }}>Slug</th>
              <SortTh col="era">Era</SortTh>
              <th style={S.th}>Type</th>
              <th style={S.th}>Reg. Marks</th>
              <th style={S.th}>Legal Sets</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredFormats.map(f => {
              const marks: string[]  = f.regulation_marks ? JSON.parse(f.regulation_marks) : []
              const setIds: string[] = f.legal_set_ids    ? JSON.parse(f.legal_set_ids)    : []
              return (
                <tr key={f.id}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{f.name}</td>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{f.slug}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>
                    {f.era_id ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {f.era_color && <span style={{ width: 8, height: 8, background: f.era_color, display: 'inline-block' }} />}
                        {eraName(f.era_id)}
                      </span>
                    ) : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td style={S.td}>
                    {f.is_block
                      ? <span style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#3730A3', padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Block</span>
                      : <span style={{ color: '#aaa', fontSize: 11 }}>Format</span>
                    }
                  </td>
                  <td style={S.td}>
                    {marks.length > 0 ? (
                      <div style={{ display: 'flex', gap: 3 }}>
                        {marks.map(m => (
                          <span key={m} style={{ display: 'inline-block', background: 'var(--navy)', color: 'var(--yellow)', padding: '1px 6px', fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 900 }}>{m}</span>
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
            {filteredFormats.length === 0 && (
              <tr><td colSpan={8} style={{ ...S.td, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>
                {formats.length === 0 ? 'No formats yet' : 'No formats match the current filter'}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
