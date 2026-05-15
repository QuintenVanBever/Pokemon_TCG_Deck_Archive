import React, { useState, useEffect, useRef } from 'react'
import { usePersistedState } from '../../lib/usePersistedState'
import { adminS as S } from './AdminLayout'
import { fetchAdminCards, fetchEraBlocks, searchPokemontcg, BASE } from '../../lib/api'
import type { AdminCard, EraBlock } from '../../lib/api'
import { adminFetch } from '../../lib/adminAuth'

const SUPERTYPES = ['Pokémon', 'Trainer', 'Energy']

type CardForm = {
  name: string; display_name: string; pokemontcg_id: string; supertype: string
  energy_type: string; set_id: string; set_name: string; set_series: string
  era_block_id: string; image_ext_url: string; image_r2_key: string; is_custom: string
}

const emptyForm = (c?: AdminCard): CardForm => ({
  name:         c?.name          ?? '',
  display_name: c?.display_name  ?? '',
  pokemontcg_id: c?.pokemontcg_id ?? '',
  supertype:    c?.supertype     ?? 'Pokémon',
  energy_type:  c?.energy_type   ?? '',
  set_id:       c?.set_id        ?? '',
  set_name:     c?.set_name      ?? '',
  set_series:   c?.set_series    ?? '',
  era_block_id: c?.era_block_id?.toString() ?? '',
  image_ext_url: c?.image_ext_url ?? '',
  image_r2_key: c?.image_r2_key  ?? '',
  is_custom:    c?.is_custom?.toString() ?? '1',
})

type DeleteModal = { cardId: number; cardName: string; decks: { id: number; name: string; slug: string }[] } | null

export function AdminCardsPage() {
  const [cards,   setCards]   = useState<AdminCard[]>([])
  const [blocks,  setBlocks]  = useState<EraBlock[]>([])
  const [filters, setFilters] = usePersistedState('admin:cards:filters', { name: '', supertype: '', era: '', set: '' })
  const [form,    setForm]    = useState<CardForm | null>(null)
  const [editId,  setEditId]  = useState<number | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [deleteModal, setDeleteModal] = useState<DeleteModal>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [cardPreview, setCardPreview] = useState<{ url: string; x: number; y: number } | null>(null)

  // Import state
  const [importMode,    setImportMode]    = useState<'name' | 'set' | 'card_id'>('name')
  const [importQ,       setImportQ]       = useState('')
  const [importEra,     setImportEra]     = useState('')
  const [importResults, setImportResults] = useState<any[]>([])
  const [importError,   setImportError]   = useState<string | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = () => fetchAdminCards(filters).then(setCards)
  useEffect(() => { fetchEraBlocks().then(setBlocks) }, [])
  useEffect(() => { load() }, [filters])

  const saveCard = async () => {
    if (!form) return
    if (!form.name.trim()) { alert('Card name is required'); return }
    const body: Record<string, any> = {
      name:          form.name,
      display_name:  form.display_name  || null,
      pokemontcg_id: form.pokemontcg_id || null,
      supertype:     form.supertype,
      energy_type:   form.energy_type   || null,
      set_id:        form.set_id        || null,
      set_name:      form.set_name      || null,
      set_series:    form.set_series    || null,
      era_block_id:  form.era_block_id  ? Number(form.era_block_id) : null,
      image_ext_url: form.image_ext_url || null,
      image_r2_key:  form.image_r2_key  || null,
      is_custom:     Number(form.is_custom),
    }
    if (editId) {
      await adminFetch(`${BASE}/api/admin/cards/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await adminFetch(`${BASE}/api/admin/cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setForm(null); setEditId(null); load()
  }

  const openDeleteModal = async (card: AdminCard) => {
    setDeleteLoading(true)
    const res  = await adminFetch(`${BASE}/api/admin/cards/${card.id}/decks`)
    const json = await res.json() as { data: { id: number; name: string; slug: string }[] }
    setDeleteModal({ cardId: card.id, cardName: card.display_name ?? card.name, decks: json.data })
    setDeleteLoading(false)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    await adminFetch(`${BASE}/api/admin/cards/${deleteModal.cardId}`, { method: 'DELETE' })
    setDeleteModal(null)
    load()
  }

  const IMPORT_MODES = [
    { id: 'name'    as const, label: 'Name',    placeholder: 'Type to search pokemontcg.io…' },
    { id: 'set'     as const, label: 'Set',     placeholder: 'e.g. Generations, Base Set…' },
    { id: 'card_id' as const, label: 'Card ID', placeholder: 'e.g. g1-26, sv1-6…' },
  ]

  const doSearch = (q: string, mode = importMode) => {
    setImportQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!q.trim()) { setImportResults([]); setImportError(null); return }
    searchTimer.current = setTimeout(async () => {
      setImportLoading(true); setImportError(null)
      const result = mode === 'name'    ? await searchPokemontcg(q)
                   : mode === 'set'     ? await searchPokemontcg('', { set_id: q })
                   :                     await searchPokemontcg('', { card_id: q })
      setImportLoading(false)
      setImportResults(result.data)
      if (result.error) setImportError(result.error)
      else if (!result.data.length) setImportError(
        mode === 'name'    ? 'No cards found for that name' :
        mode === 'set'     ? 'No cards found for that set ID' :
                             'Card not found'
      )
    }, 400)
  }

  const importCard = async (ptcgCard: any) => {
    await adminFetch(`${BASE}/api/admin/cards/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pokemontcg_id: ptcgCard.id, era_block_id: importEra ? Number(importEra) : undefined }),
    })
    load()
  }

  const imgSrc = (c: AdminCard) => c.image_ext_url || (c.image_r2_key ? `${BASE}/api/images/${c.image_r2_key}` : null)

  return (
    <>
    {deleteModal && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
        onClick={e => { if (e.target === e.currentTarget) setDeleteModal(null) }}>
        <div style={{ background: '#fff', width: 480, maxWidth: '90vw', padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#CC3333', marginBottom: 12 }}>Delete "{deleteModal.cardName}"?</div>
          {deleteModal.decks.length > 0 ? (
            <>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>
                This card is used in <strong>{deleteModal.decks.length}</strong> deck{deleteModal.decks.length !== 1 ? 's' : ''}. Deleting it will also remove it from those decks:
              </div>
              <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 13, color: '#333' }}>
                {deleteModal.decks.map(d => <li key={d.id}>{d.name}</li>)}
              </ul>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
              This card is not in any deck. It will be permanently deleted.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={S.btnS} onClick={() => setDeleteModal(null)}>Cancel</button>
            <button style={S.btnD} onClick={confirmDelete}>
              {deleteModal.decks.length > 0 ? 'Delete card & remove from decks' : 'Delete card'}
            </button>
          </div>
        </div>
      </div>
    )}
    <div style={S.page} className="admin-page">
      <h1 style={S.heading}>Card Catalog</h1>

      {/* Filters */}
      <div style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={S.field}>
          <label style={S.label}>Search</label>
          <input style={{ ...S.input, width: 200 }} value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} placeholder="Name or display name…" />
        </div>
        <div style={S.field}>
          <label style={S.label}>Set</label>
          <input style={{ ...S.input, width: 160 }} value={filters.set} onChange={e => setFilters(f => ({ ...f, set: e.target.value }))} placeholder="Name or set ID…" />
        </div>
        <div style={S.field}>
          <label style={S.label}>Supertype</label>
          <select style={S.select} value={filters.supertype} onChange={e => setFilters(f => ({ ...f, supertype: e.target.value }))}>
            <option value="">All</option>
            {SUPERTYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>Era</label>
          <select style={S.select} value={filters.era} onChange={e => setFilters(f => ({ ...f, era: e.target.value }))}>
            <option value="">All</option>
            <option value="__none__">No era</option>
            {blocks.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
        <button style={S.btnP} onClick={() => { setForm(emptyForm()); setEditId(null) }}>+ New card</button>
        <button style={S.btnS} onClick={() => setShowImport(i => !i)}>{showImport ? '✕ Close import' : '↓ Import from TCG API'}</button>
      </div>

      {/* Import panel */}
      {showImport && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 10 }}>Import from pokemontcg.io</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={S.field}>
              <label style={S.label}>Search by</label>
              <div style={{ display: 'flex' }}>
                {IMPORT_MODES.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setImportMode(m.id); setImportQ(''); setImportResults([]); setImportError(null) }}
                    style={{
                      padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: '1.5px solid #D0D5DD',
                      borderRight: i < IMPORT_MODES.length - 1 ? 'none' : '1.5px solid #D0D5DD',
                      background: importMode === m.id ? '#1a3a5c' : '#fff',
                      color:      importMode === m.id ? '#fff'    : '#555',
                    }}
                  >{m.label}</button>
                ))}
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>&nbsp;</label>
              <input
                key={importMode}
                style={{ ...S.input, width: 240 }}
                value={importQ}
                onChange={e => doSearch(e.target.value)}
                placeholder={IMPORT_MODES.find(m => m.id === importMode)!.placeholder}
                autoFocus
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Assign era (optional)</label>
              <select style={S.select} value={importEra} onChange={e => setImportEra(e.target.value)}>
                <option value="">None</option>
                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {importLoading && <div style={{ color: '#888', fontSize: 13 }}>Searching…</div>}
          {importError  && <div style={{ color: '#CC3333', fontSize: 13, marginBottom: 8 }}>{importError}</div>}

          {importResults.length > 0 && (
            <div style={{ border: '1px solid #E8ECF0', maxHeight: 360, overflowY: 'auto' }}>
              <table style={S.table}>
                <thead><tr>
                  <th style={S.th}></th>
                  <th style={S.th}>ID</th>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Set</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}></th>
                </tr></thead>
                <tbody>
                  {importResults.map((r: any) => (
                    <tr key={r.id}>
                      <td style={{ ...S.td, width: 52, padding: '4px 8px' }}>
                        {r.images?.small && (
                          <img
                            src={r.images.small}
                            alt=""
                            style={{ height: 52, aspectRatio: '63/88', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                            onMouseEnter={e => {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                              setCardPreview({ url: r.images.small, x: rect.right + 12, y: rect.top })
                            }}
                            onMouseLeave={() => setCardPreview(null)}
                          />
                        )}
                      </td>
                      <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{r.id}</td>
                      <td style={{ ...S.td, fontWeight: 700 }}>{r.name}</td>
                      <td style={{ ...S.td, color: '#888' }}>{r.set?.name} <span style={{ color: '#bbb' }}>({r.set?.series})</span></td>
                      <td style={S.td}>{r.supertype}</td>
                      <td style={S.td}>
                        <button style={S.btnP} onClick={() => importCard(r)}>Import</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Full edit / create form */}
      {form && (
        <div style={S.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 12 }}>
            {editId ? `Editing card #${editId}` : 'New custom card'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { f: 'name',          label: 'Name (official)' },
              { f: 'display_name',  label: 'Display name (alias)' },
              { f: 'pokemontcg_id', label: 'pokemontcg_id', mono: true },
              { f: 'energy_type',   label: 'Energy type' },
            ].map(({ f, label, mono }) => (
              <div key={f} style={S.field}>
                <label style={S.label}>{label}</label>
                <input style={{ ...S.input, fontFamily: mono ? 'monospace' : undefined }} value={(form as any)[f]} onChange={e => setForm(x => ({ ...x!, [f]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div style={S.field}>
              <label style={S.label}>Supertype</label>
              <select style={S.select} value={form.supertype} onChange={e => setForm(x => ({ ...x!, supertype: e.target.value }))}>
                {SUPERTYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Set ID</label>
              <input style={{ ...S.input, fontFamily: 'monospace' }} value={form.set_id} onChange={e => setForm(x => ({ ...x!, set_id: e.target.value }))} placeholder="hgss4" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Set name</label>
              <input style={S.input} value={form.set_name} onChange={e => setForm(x => ({ ...x!, set_name: e.target.value }))} placeholder="Undaunted" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Set series</label>
              <input style={S.input} value={form.set_series} onChange={e => setForm(x => ({ ...x!, set_series: e.target.value }))} placeholder="HeartGold & SoulSilver" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 80px', gap: 10, marginBottom: 12 }}>
            <div style={S.field}>
              <label style={S.label}>Era</label>
              <select style={S.select} value={form.era_block_id} onChange={e => setForm(x => ({ ...x!, era_block_id: e.target.value }))}>
                <option value="">None</option>
                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Image URL (ext)</label>
              <input style={S.input} value={form.image_ext_url} onChange={e => setForm(x => ({ ...x!, image_ext_url: e.target.value }))} placeholder="https://…" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Image R2 key</label>
              <input style={{ ...S.input, fontFamily: 'monospace' }} value={form.image_r2_key} onChange={e => setForm(x => ({ ...x!, image_r2_key: e.target.value }))} placeholder="cards/42" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Custom?</label>
              <select style={S.select} value={form.is_custom} onChange={e => setForm(x => ({ ...x!, is_custom: e.target.value }))}>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnP} onClick={saveCard}>Save</button>
            <button style={S.btnS} onClick={() => { setForm(null); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Cards table */}
      <div style={S.card}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{cards.length} cards</div>
        <div className="scroll-x">
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}></th>
            <th style={S.th}>ID / pokemontcg_id</th>
            <th style={S.th}>Name</th>
            <th style={S.th}>Set</th>
            <th style={S.th}>Era</th>
            <th style={S.th}>Type</th>
            <th style={S.th}>Custom</th>
            <th style={S.th}></th>
          </tr></thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.id}>
                <td style={{ ...S.td, width: 52, padding: '4px 8px' }}>
                  {imgSrc(c) && (
                    <img
                      src={imgSrc(c)!}
                      alt=""
                      style={{ height: 52, aspectRatio: '63/88', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                      onMouseEnter={e => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setCardPreview({ url: imgSrc(c)!, x: r.right + 12, y: r.top })
                      }}
                      onMouseLeave={() => setCardPreview(null)}
                    />
                  )}
                </td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
                  {c.pokemontcg_id ?? `#${c.id}`}
                </td>
                <td style={{ ...S.td, fontWeight: 700 }}>{c.display_name ? c.display_name : c.name}</td>
                <td style={{ ...S.td, color: '#888', fontSize: 12 }}>
                  {c.set_name ? `${c.set_name} (${c.set_id})` : c.era_name ?? '—'}
                </td>
                <td style={{ ...S.td, color: '#888', fontSize: 12 }}>
                  {c.era_name ? `${c.era_name}` : c.era_name ?? '—'}
                </td>
                <td style={S.td}>{c.supertype}</td>
                <td style={S.td}>{c.is_custom ? '✓' : ''}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => { setForm(emptyForm(c)); setEditId(c.id) }}>Edit</button>
                  <button style={S.btnD} onClick={() => openDeleteModal(c)} disabled={deleteLoading}>Del</button>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr><td colSpan={8} style={{ ...S.td, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No cards found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>

      {cardPreview && (
        <div style={{
          position: 'fixed', left: cardPreview.x, top: cardPreview.y,
          zIndex: 9999, pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          <img src={cardPreview.url} alt="" style={{ height: 260, aspectRatio: '63/88', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
    </>
  )
}
