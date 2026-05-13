import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { adminS as S } from './AdminLayout'
import { fetchDeck, fetchEraBlocks, fetchAdminCards, fetchFormats, BASE } from '../../lib/api'
import type { DeckDetail, DeckCard, EraBlock, AdminCard, Format } from '../../lib/api'

const ENERGY_TYPES = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water']

function QtyCell({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <td style={{ ...S.td, width: 60 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <label style={{ ...S.label, margin: 0, fontSize: 9 }}>{label}</label>
        <input
          type="number" min={0} max={99}
          value={value}
          onChange={e => onChange(Math.max(0, Number(e.target.value)))}
          style={{ ...S.input, width: 48, textAlign: 'center', padding: '4px 2px' }}
        />
      </div>
    </td>
  )
}

export function AdminDeckEditPage() {
  const { slug } = useParams({ from: '/admin/decks/$slug/edit' })

  const [deck,    setDeck]    = useState<DeckDetail | null>(null)
  const [blocks,  setBlocks]  = useState<EraBlock[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [meta,    setMeta]    = useState({ name: '', slug: '', energy_type: 'Colorless', intended_size: 60, primer_md: '', format_id: 0 })
  const [metaSaved, setMetaSaved] = useState(false)

  // Card search state
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<AdminCard[]>([])
  const [searchBlock, setSearchBlock] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Per-row editing state
  const [qtys, setQtys] = useState<Record<number, { qty_real: number; qty_proxy: number; qty_missing: number; qty_ordered: number }>>({})
  const [fanSlots, setFanSlots] = useState<Record<number, number | null>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const load = async () => {
    const d = await fetchDeck(slug)
    if (!d) return
    setDeck(d)
    setMeta({ name: d.name, slug: d.slug, energy_type: d.energy_type, intended_size: d.intended_size, primer_md: d.primer_md ?? '', format_id: d.format_id })
    const initial: typeof qtys = {}
    const initialFan: Record<number, number | null> = {}
    for (const c of d.cards) {
      initial[c.deck_card_id] = { qty_real: c.qty_real, qty_proxy: c.qty_proxy, qty_missing: c.qty_missing, qty_ordered: c.qty_ordered }
      initialFan[c.deck_card_id] = c.fan_slot
    }
    setQtys(initial)
    setFanSlots(initialFan)
  }

  useEffect(() => { load(); fetchEraBlocks().then(setBlocks); fetchFormats().then(setFormats) }, [slug])

  const saveMeta = async () => {
    if (!deck) return
    await fetch(`${BASE}/api/admin/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: meta.name, slug: meta.slug, energy_type: meta.energy_type, intended_size: meta.intended_size, primer_md: meta.primer_md || null, format_id: meta.format_id }),
    })
    setMetaSaved(true)
    setTimeout(() => setMetaSaved(false), 2000)
    await load()
  }

  const searchCards = (q: string, block?: string) => {
    const blockVal = block ?? searchBlock
    setQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return }
      const r = await fetchAdminCards({ name: q, format_id: meta.format_id || undefined, era: blockVal || undefined })
      setResults(r.slice(0, 12))
    }, 300)
  }

  const addCard = async (card: AdminCard) => {
    if (!deck) return
    if (deck.cards.find(c => c.name === card.name)) {
      setDuplicateWarning(`"${card.display_name ?? card.name}" is already in this deck`)
      setTimeout(() => setDuplicateWarning(null), 3000)
      return
    }
    setSaveError(null)
    setDuplicateWarning(null)
    const res = await fetch(`${BASE}/api/admin/decks/${deck.id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: card.id, qty_real: 1, qty_proxy: 0, qty_missing: 0, qty_ordered: 0 }),
    })
    if (!res.ok) {
      const json = await res.json() as { error?: string }
      setSaveError(json.error ?? 'Failed to add card')
      return
    }
    setQuery(''); setResults([])
    load()
  }

  const saveCard = async (deckCardId: number) => {
    if (!deck || !qtys[deckCardId]) return
    const q = qtys[deckCardId]
    const fan_slot = fanSlots[deckCardId] ?? null
    setSaveError(null)
    const res = await fetch(`${BASE}/api/admin/decks/${deck.id}/cards/${deckCardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...q, fan_slot }),
    })
    if (!res.ok) {
      const json = await res.json() as { error?: string }
      setSaveError(json.error ?? 'Save failed')
      return
    }
    load()
  }

  const removeCard = async (deckCardId: number) => {
    if (!deck) return
    await fetch(`${BASE}/api/admin/decks/${deck.id}/cards/${deckCardId}`, { method: 'DELETE' })
    load()
  }

  if (!deck) return <div style={{ padding: 40, color: '#888' }}>Loading…</div>

  const totalCards = deck.cards.reduce((s, c) => s + c.intended_quantity, 0)

  const grouped: Record<string, DeckCard[]> = {}
  for (const c of deck.cards) {
    const g = c.supertype
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(c)
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/decks" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>← Decks</Link>
      </div>
      <h1 style={S.heading}>{deck.name}</h1>

      {/* Meta */}
      <div style={S.card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>Deck metadata</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 10, marginBottom: 10 }}>
          <div style={S.field}>
            <label style={S.label}>Name</label>
            <input style={S.input} value={meta.name} onChange={e => setMeta(m => ({ ...m, name: e.target.value }))} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Slug</label>
            <input style={S.input} value={meta.slug} onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Type</label>
            <select style={S.select} value={meta.energy_type} onChange={e => setMeta(m => ({ ...m, energy_type: e.target.value }))}>
              {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Format</label>
            <select style={S.select} value={meta.format_id} onChange={e => setMeta(m => ({ ...m, format_id: Number(e.target.value) }))}>
              <option value={0}>— none —</option>
              {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Size</label>
            <input style={S.input} type="number" value={meta.intended_size} onChange={e => setMeta(m => ({ ...m, intended_size: Number(e.target.value) }))} />
          </div>
        </div>
        <div style={S.field}>
          <label style={S.label}>Primer (Markdown)</label>
          <textarea style={{ ...S.input, height: 80, resize: 'vertical', fontFamily: 'monospace' }} value={meta.primer_md} onChange={e => setMeta(m => ({ ...m, primer_md: e.target.value }))} />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={S.btnP} onClick={saveMeta}>Save metadata</button>
          {metaSaved && <span style={{ fontSize: 12, color: '#2E8B57' }}>✓ Saved</span>}
        </div>
      </div>

      {/* Card search */}
      <div style={S.card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>Add card</div>
        {duplicateWarning && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', color: '#92400E', fontSize: 12, padding: '6px 10px', marginBottom: 8 }}>
            {duplicateWarning}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <input
              style={S.input}
              value={query}
              onChange={e => searchCards(e.target.value)}
              placeholder="Search card name…"
            />
            {results.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #D0D5DD', borderTop: 'none', zIndex: 10, maxHeight: 280, overflowY: 'auto' }}>
                {results.map(r => (
                  <div key={r.id} onClick={() => addCard(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F0F2F5' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F5F7FA')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    {r.image_ext_url && <img src={r.image_ext_url} alt="" style={{ height: 28 }} />}
                    <span style={{ fontWeight: 700 }}>{r.name}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>{r.supertype} · {r.era_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={S.field}>
            <label style={S.label}>Block</label>
            <select style={S.select} value={searchBlock} onChange={e => { setSearchBlock(e.target.value); searchCards(query, e.target.value) }}>
              <option value="">All blocks</option>
              {blocks.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Deck cards */}
      <div style={S.card}>
        {saveError && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', color: '#CC3333', fontSize: 12, padding: '6px 10px', marginBottom: 10 }}>
            {saveError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: totalCards > deck.intended_size ? '#CC3333' : '#888' }}>
            Cards ({totalCards} / {deck.intended_size})
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
            <span style={{ color: '#2E8B57' }}>● Real: {deck.counts.real}</span>
            <span style={{ color: '#7B52C4' }}>● Proxy: {deck.counts.proxy}</span>
            {deck.counts.missing > 0 && <span style={{ color: '#CC3333' }}>● Missing: {deck.counts.missing}</span>}
            {deck.counts.ordered > 0 && <span style={{ color: '#1E78C4' }}>● Ordered: {deck.counts.ordered}</span>}
          </div>
        </div>

        {Object.entries(grouped).map(([supertype, cards]) => (
          <div key={supertype} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', padding: '6px 0 4px', borderBottom: '2px solid #E8ECF0', marginBottom: 4 }}>
              {supertype} ({cards.reduce((s, c) => s + c.intended_quantity, 0)})
            </div>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}></th>
                <th style={S.th}>Name</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Real</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Proxy</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Missing</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Ordered</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Total</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Fan</th>
                <th style={S.th}></th>
              </tr></thead>
              <tbody>
                {cards.map(c => {
                  const q = qtys[c.deck_card_id] ?? { qty_real: c.qty_real, qty_proxy: c.qty_proxy, qty_missing: c.qty_missing, qty_ordered: c.qty_ordered }
                  const currentFan = fanSlots[c.deck_card_id] ?? null
                  const changed = q.qty_real !== c.qty_real || q.qty_proxy !== c.qty_proxy || q.qty_missing !== c.qty_missing || q.qty_ordered !== c.qty_ordered || currentFan !== c.fan_slot
                  const update = (field: keyof typeof q, v: number) => setQtys(prev => ({ ...prev, [c.deck_card_id]: { ...q, [field]: v } }))
                  return (
                    <tr key={c.deck_card_id}>
                      <td style={{ ...S.td, width: 36 }}>
                        {c.image_url && <img src={c.image_url} alt="" style={{ height: 30 }} />}
                      </td>
                      <td style={{ ...S.td, fontWeight: 700 }}>{c.name}</td>
                      <QtyCell label="Real"    value={q.qty_real}    onChange={v => update('qty_real', v)} />
                      <QtyCell label="Proxy"   value={q.qty_proxy}   onChange={v => update('qty_proxy', v)} />
                      <QtyCell label="Missing" value={q.qty_missing} onChange={v => update('qty_missing', v)} />
                      <QtyCell label="Ordered" value={q.qty_ordered} onChange={v => update('qty_ordered', v)} />
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>{q.qty_real + q.qty_proxy + q.qty_missing + q.qty_ordered}</td>
                      <td style={{ ...S.td, width: 54, textAlign: 'center' }}>
                        <select
                          value={currentFan ?? ''}
                          onChange={e => setFanSlots(p => ({ ...p, [c.deck_card_id]: e.target.value ? Number(e.target.value) : null }))}
                          style={{ ...S.select, width: 50, padding: '2px 2px' }}
                        >
                          <option value="">—</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </td>
                      <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                        {changed && <button style={{ ...S.btnP, marginRight: 4 }} onClick={() => saveCard(c.deck_card_id)}>Save</button>}
                        <button style={S.btnD} onClick={() => removeCard(c.deck_card_id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}

        {deck.cards.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
            No cards yet — search for cards above to add them
          </div>
        )}
      </div>
    </div>
  )
}
