import { useState, useEffect } from 'react'
import { adminS as S } from './AdminLayout'
import { BASE } from '../../lib/api'

interface EraBlock { id: number; slug: string; key: string; name: string; color: string; dark: string; sort_order: number }
interface Era { id: number; era_block_id: number; slug: string; name: string; code: string | null; release_date: string | null; sort_order: number; rules_primer: string | null }

const empty = (): Omit<EraBlock, 'id'> => ({ slug: '', key: '', name: '', color: '#888888', dark: '#444444', sort_order: 0 })
const emptyEra = (era_block_id: number): Omit<Era, 'id'> => ({ era_block_id, slug: '', name: '', code: null, release_date: null, sort_order: 0, rules_primer: null })
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function AdminErasPage() {
  const [blocks, setBlocks]   = useState<EraBlock[]>([])
  const [eras,   setEras]     = useState<Era[]>([])
  const [form,   setForm]     = useState<Omit<EraBlock, 'id'> | null>(null)
  const [editId, setEditId]   = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [eraForm,  setEraForm]  = useState<(Omit<Era, 'id'> & { editId?: number }) | null>(null)

  const load = async () => {
    const [b, e] = await Promise.all([
      fetch(`${BASE}/api/era-blocks`).then(r => r.json() as Promise<{ data: EraBlock[] }>),
      fetch(`${BASE}/api/eras`).then(r => r.json() as Promise<{ data: Era[] }>),
    ])
    setBlocks(b.data)
    setEras(e.data)
  }

  useEffect(() => { load() }, [])

  const saveBlock = async () => {
    if (!form) return
    if (editId) {
      await fetch(`${BASE}/api/admin/era-blocks/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`${BASE}/api/admin/era-blocks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setForm(null); setEditId(null); load()
  }

  const deleteBlock = async (id: number) => {
    if (!confirm('Delete this era block and all its eras?')) return
    await fetch(`${BASE}/api/admin/era-blocks/${id}`, { method: 'DELETE' })
    load()
  }

  const saveEra = async () => {
    if (!eraForm) return
    const { editId: eid, ...body } = eraForm
    if (eid) {
      await fetch(`${BASE}/api/admin/eras/${eid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch(`${BASE}/api/admin/eras`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setEraForm(null); load()
  }

  const deleteEra = async (id: number) => {
    if (!confirm('Delete this era?')) return
    await fetch(`${BASE}/api/admin/eras/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Eras &amp; Blocks</h1>

      {/* New block form */}
      <div style={S.card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 12 }}>
          {editId ? 'Edit Era Block' : 'New Era Block'}
        </div>
        {form ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px 100px 100px', gap: 10 }}>
              {(['name', 'slug', 'key', 'sort_order', 'color', 'dark'] as const).map(f => (
                <div key={f} style={S.field}>
                  <label style={S.label}>{f}</label>
                  <input style={S.input} value={(form as any)[f] ?? ''} onChange={e => {
                    const v = f === 'sort_order' ? Number(e.target.value) : e.target.value
                    const next = { ...form, [f]: v }
                    if (f === 'name' && !editId) next.slug = slugify(e.target.value)
                    setForm(next)
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btnP} onClick={saveBlock}>Save</button>
              <button style={S.btnS} onClick={() => { setForm(null); setEditId(null) }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button style={S.btnP} onClick={() => setForm(empty())}>+ New Era Block</button>
        )}
      </div>

      {/* Blocks list */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['#', 'Key', 'Name', 'Slug', 'Color', 'Order', 'Eras', ''].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks.map(b => (
              <>
                <tr key={b.id} style={{ background: expanded[b.id] ? '#FAFBFF' : '#fff' }}>
                  <td style={S.td}>{b.id}</td>
                  <td style={S.td}>
                    <span style={{ display: 'inline-block', background: b.color, color: '#fff', padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>{b.key}</span>
                  </td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{b.name}</td>
                  <td style={{ ...S.td, color: '#888', fontFamily: 'monospace' }}>{b.slug}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <div style={{ width: 14, height: 14, background: b.color, border: '1px solid #ccc' }} />
                      <div style={{ width: 14, height: 14, background: b.dark, border: '1px solid #ccc' }} />
                    </div>
                  </td>
                  <td style={S.td}>{b.sort_order}</td>
                  <td style={S.td}>{eras.filter(e => e.era_block_id === b.id).length}</td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => setExpanded(x => ({ ...x, [b.id]: !x[b.id] }))}>
                      {expanded[b.id] ? 'Hide eras ▲' : 'Eras ▼'}
                    </button>
                    <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => { setForm({ slug: b.slug, key: b.key, name: b.name, color: b.color, dark: b.dark, sort_order: b.sort_order }); setEditId(b.id) }}>Edit</button>
                    <button style={S.btnD} onClick={() => deleteBlock(b.id)}>Del</button>
                  </td>
                </tr>
                {expanded[b.id] && (
                  <tr key={`${b.id}-eras`}>
                    <td colSpan={8} style={{ padding: '0 0 0 40px', background: '#F8F9FF' }}>
                      <div style={{ padding: '12px 0' }}>
                        {/* Era rows */}
                        <table style={{ ...S.table, marginBottom: 8 }}>
                          <thead>
                            <tr>
                              {['#', 'Name', 'Slug', 'Code', 'Release', 'Order', ''].map(h => (
                                <th key={h} style={{ ...S.th, background: 'transparent' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {eras.filter(e => e.era_block_id === b.id).map(e => (
                              <tr key={e.id}>
                                <td style={S.td}>{e.id}</td>
                                <td style={{ ...S.td, fontWeight: 700 }}>{e.name}</td>
                                <td style={{ ...S.td, color: '#888', fontFamily: 'monospace' }}>{e.slug}</td>
                                <td style={S.td}>{e.code ?? '—'}</td>
                                <td style={S.td}>{e.release_date ?? '—'}</td>
                                <td style={S.td}>{e.sort_order}</td>
                                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                                  <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => setEraForm({ era_block_id: b.id, slug: e.slug, name: e.name, code: e.code, release_date: e.release_date, sort_order: e.sort_order, rules_primer: e.rules_primer, editId: e.id })}>Edit</button>
                                  <button style={S.btnD} onClick={() => deleteEra(e.id)}>Del</button>
                                </td>
                              </tr>
                            ))}
                            {eras.filter(e => e.era_block_id === b.id).length === 0 && (
                              <tr><td colSpan={7} style={{ ...S.td, color: '#aaa', fontStyle: 'italic' }}>No eras yet</td></tr>
                            )}
                          </tbody>
                        </table>
                        {/* Era form */}
                        {eraForm && eraForm.era_block_id === b.id ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 100px 60px', gap: 8, alignItems: 'flex-end', padding: '8px 0' }}>
                            {(['name', 'slug', 'code', 'release_date', 'sort_order'] as const).map(f => (
                              <div key={f} style={S.field}>
                                <label style={S.label}>{f}</label>
                                <input style={S.input} value={(eraForm as any)[f] ?? ''} onChange={ev => {
                                  const v = f === 'sort_order' ? Number(ev.target.value) : ev.target.value || null
                                  const next = { ...eraForm, [f]: v }
                                  if (f === 'name' && !eraForm.editId) next.slug = slugify(ev.target.value)
                                  setEraForm(next)
                                }} />
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={S.btnP} onClick={saveEra}>Save</button>
                              <button style={S.btnS} onClick={() => setEraForm(null)}>✕</button>
                            </div>
                          </div>
                        ) : (
                          <button style={S.btnP} onClick={() => setEraForm(emptyEra(b.id))}>+ New Era</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
