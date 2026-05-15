import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { adminS as S } from './AdminLayout'
import { fetchDeck, fetchEraBlocks, fetchAdminCards, fetchAdminCardSets, fetchFormats, searchPokemontcg, BASE } from '../../lib/api'
import { ENERGY_META } from '../../data/decks'
import { adminFetch } from '../../lib/adminAuth'
import type { DeckDetail, DeckCard, EraBlock, AdminCard, Format } from '../../lib/api'
import type { EnergyType } from '../../data/decks'

const ENERGY_TYPES = ['colorless', 'darkness', 'dragon', 'fairy', 'fighting', 'fire', 'grass', 'lightning', 'metal', 'psychic', 'water'] as const

type ParsedLine   = { count: number; name: string; set: string; number: string }
type ImportStatus = 'found' | 'needs-import' | 'not-found'
type ImportResult = ParsedLine & { card: AdminCard | null; ptcgCard: any | null; status: ImportStatus }

function parseTcgLive(text: string): ParsedLine[] {
  const map = new Map<string, ParsedLine>()
  text
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^\d/.test(l))
    .forEach(l => {
      const tokens = l.split(/\s+/)
      if (tokens.length < 4) return
      const count = parseInt(tokens[0], 10)
      if (isNaN(count) || count <= 0) return
      const number = tokens[tokens.length - 1]
      const set    = tokens[tokens.length - 2]
      const name   = tokens.slice(1, -2).join(' ')
      const key    = `${name}|${set}|${number}`
      const existing = map.get(key)
      if (existing) { existing.count += count } else { map.set(key, { count, name, set, number }) }
    })
  return Array.from(map.values())
}

function QtyCell({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <td style={{ ...S.td, width: 72 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <label style={{ ...S.label, margin: 0, fontSize: 9 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            style={{ width: 20, height: 22, border: '1.5px solid #D0D5DD', background: '#F5F7FA', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <span style={{ minWidth: 18, textAlign: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-b)' }}>{value}</span>
          <button
            onClick={() => onChange(Math.min(99, value + 1))}
            style={{ width: 20, height: 22, border: '1.5px solid #D0D5DD', background: '#F5F7FA', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        </div>
      </div>
    </td>
  )
}

export function AdminDeckEditPage() {
  const { slug } = useParams({ from: '/admin/decks/$slug/edit' })

  const [deck,    setDeck]    = useState<DeckDetail | null>(null)
  const [blocks,  setBlocks]  = useState<EraBlock[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [meta,    setMeta]    = useState({ name: '', slug: '', era_block_id: 0, energy_type: 'colorless', energy_types: ['colorless'] as string[], intended_size: 60, primer_md: '', format_id: 0 })
  const [metaSaved, setMetaSaved] = useState(false)

  // Card search state
  const [query,          setQuery]          = useState('')
  const [results,        setResults]        = useState<AdminCard[]>([])
  const [searchFormatId, setSearchFormatId] = useState(0)
  const [searchSet,      setSearchSet]      = useState('')
  const [setOptions,     setSetOptions]     = useState<{ set_id: string; set_name: string }[]>([])
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Per-row editing state
  const [qtys, setQtys] = useState<Record<number, { qty_real: number; qty_proxy: number; qty_missing: number; qty_ordered: number }>>({})
  const [fanSlots, setFanSlots] = useState<Record<number, number | null>>({})
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [savingAll, setSavingAll]       = useState(false)
  const [saveAllDone, setSaveAllDone]   = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Card hover preview
  const [cardPreview, setCardPreview] = useState<{ url: string; x: number; y: number } | null>(null)

  // Swap printing modal
  const [swapModal, setSwapModal] = useState<{ deckCardId: number; currentCardId: number; cardName: string; options: AdminCard[] } | null>(null)

  // TCG Live import state
  const [importOpen,     setImportOpen]     = useState(false)
  const [importText,     setImportText]     = useState('')
  const [importResults,  setImportResults]  = useState<ImportResult[] | null>(null)
  const [importCardEras, setImportCardEras] = useState<Record<number, number>>({})
  const [importBusy,     setImportBusy]     = useState(false)
  const [importMessage,  setImportMessage]  = useState<string | null>(null)
  const [rowSearch,       setRowSearch]       = useState<Record<number, string>>({})
  const [rowLocalResults, setRowLocalResults] = useState<Record<number, AdminCard[]>>({})
  const [rowPtcgResults,  setRowPtcgResults]  = useState<Record<number, any[]>>({})
  const rowSearchTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const load = async () => {
    const d = await fetchDeck(slug)
    if (!d) return
    setDeck(d)
    const types = (d.energy_types ?? [d.energy_type]).map(t => t.toLowerCase())
    setMeta({ name: d.name, slug: d.slug, era_block_id: d.era_block_id, energy_type: types[0] ?? 'colorless', energy_types: types, intended_size: d.intended_size, primer_md: d.primer_md ?? '', format_id: d.format_id })
    setSearchFormatId(d.format_id)
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

  useEffect(() => {
    setSearchSet('')
    fetchAdminCardSets(searchFormatId || undefined).then(setSetOptions)
  }, [searchFormatId])

  const saveMeta = async () => {
    if (!deck) return
    await adminFetch(`${BASE}/api/admin/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: meta.name, slug: meta.slug, era_block_id: meta.era_block_id, energy_type: meta.energy_types[0] ?? meta.energy_type, energy_types: meta.energy_types, intended_size: meta.intended_size, primer_md: meta.primer_md || null, format_id: meta.format_id }),
    })
    setMetaSaved(true)
    setTimeout(() => setMetaSaved(false), 2000)
    await load()
  }

  const searchCards = (q: string, fmtId?: number, set?: string) => {
    const fmtVal = fmtId ?? searchFormatId
    const setVal = set  ?? searchSet
    setQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return }
      const r = await fetchAdminCards({ name: q, format_id: fmtVal || undefined, set: setVal || undefined })
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
    const res = await adminFetch(`${BASE}/api/admin/decks/${deck.id}/cards`, {
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

  const saveAll = async () => {
    if (!deck) return
    setSavingAll(true); setSaveError(null); setSaveAllDone(false)
    const toSave = deck.cards.filter(c => {
      const q = qtys[c.deck_card_id]
      if (!q) return false
      return q.qty_real !== c.qty_real || q.qty_proxy !== c.qty_proxy ||
             q.qty_missing !== c.qty_missing || q.qty_ordered !== c.qty_ordered ||
             (fanSlots[c.deck_card_id] ?? null) !== c.fan_slot
    })
    const results = await Promise.all(toSave.map(c =>
      adminFetch(`${BASE}/api/admin/decks/${deck.id}/cards/${c.deck_card_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...qtys[c.deck_card_id], fan_slot: fanSlots[c.deck_card_id] ?? null }),
      })
    ))
    const failed = results.filter(r => !r.ok)
    setSavingAll(false)
    if (failed.length > 0) {
      setSaveError(`${failed.length} card${failed.length !== 1 ? 's' : ''} failed to save`)
    } else {
      setSaveAllDone(true)
      setTimeout(() => setSaveAllDone(false), 2000)
    }
    load()
  }

  const openSwapModal = async (c: DeckCard) => {
    const all = await fetchAdminCards({ name: c.name })
    const options = all.filter(a => a.name === c.name || a.display_name === c.name)
    setSwapModal({ deckCardId: c.deck_card_id, currentCardId: c.card_id, cardName: c.name, options })
  }

  const swapCard = async (newCardId: number) => {
    if (!deck || !swapModal) return
    await adminFetch(`${BASE}/api/admin/decks/${deck.id}/cards/${swapModal.deckCardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: newCardId }),
    })
    setSwapModal(null)
    load()
  }

  const removeCard = async (deckCardId: number) => {
    if (!deck) return
    await adminFetch(`${BASE}/api/admin/decks/${deck.id}/cards/${deckCardId}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    load()
  }

  const clearRowSearch = (idx: number) => {
    setRowSearch(prev => ({ ...prev, [idx]: '' }))
    setRowLocalResults(prev => ({ ...prev, [idx]: [] }))
    setRowPtcgResults(prev => ({ ...prev, [idx]: [] }))
  }

  const searchRow = (idx: number, q: string) => {
    setRowSearch(prev => ({ ...prev, [idx]: q }))
    if (rowSearchTimers.current[idx]) clearTimeout(rowSearchTimers.current[idx])
    if (!q.trim()) {
      setRowLocalResults(prev => ({ ...prev, [idx]: [] }))
      setRowPtcgResults(prev => ({ ...prev, [idx]: [] }))
      return
    }
    rowSearchTimers.current[idx] = setTimeout(async () => {
      // Parse "Name SET" syntax, e.g. "Snorlax LOR" → name=Snorlax, ptcgo_code=LOR
      const parts = q.trim().split(/\s+/)
      const lastPart = parts[parts.length - 1]
      const looksLikeSetCode = parts.length > 1 && /^[A-Z0-9-]{2,8}$/.test(lastPart)
      const name     = looksLikeSetCode ? parts.slice(0, -1).join(' ') : q.trim()
      const setCode  = looksLikeSetCode ? lastPart : undefined

      const [local, ptcgRes] = await Promise.all([
        fetchAdminCards({ name }),
        searchPokemontcg(name, setCode ? { ptcgo_code: setCode } : undefined),
      ])
      setRowLocalResults(prev => ({ ...prev, [idx]: local.slice(0, 5) }))
      setRowPtcgResults(prev => ({ ...prev, [idx]: ptcgRes.data.slice(0, 8) }))
    }, 300)
  }

  const assignRowCard = (idx: number, card: AdminCard) => {
    setImportResults(prev => {
      if (!prev) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], card, ptcgCard: null, status: 'found' }
      return next
    })
    clearRowSearch(idx)
  }

  const assignRowPtcgCard = (idx: number, ptcgCard: any) => {
    setImportResults(prev => {
      if (!prev) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], card: null, ptcgCard, status: 'needs-import' }
      return next
    })
    clearRowSearch(idx)
  }

  const parseAndLookup = async () => {
    if (!deck) return
    const lines = parseTcgLive(importText)
    if (!lines.length) return
    setImportBusy(true); setImportResults(null); setImportMessage(null)
    const results: ImportResult[] = []
    for (const line of lines) {
      // 1 — local DB lookup by name
      const localCards    = await fetchAdminCards({ name: line.name })
      const numberMatches = localCards.filter(c => c.pokemontcg_id?.split('-').pop() === line.number)

      // Unambiguous local hit — no external API call needed
      if (numberMatches.length === 1) {
        results.push({ ...line, card: numberMatches[0], ptcgCard: null, status: 'found' }); continue
      }

      // 2 — ambiguous or missing locally → resolve via pokemontcg.io (set ptcgo code + number)
      const ptcgRes  = await searchPokemontcg(line.name, { ptcgo_code: line.set, number: line.number })
      const ptcgCard = ptcgRes.data[0] ?? null

      if (ptcgCard) {
        // 3 — already in local DB under this exact pokemontcg_id?
        const exact = localCards.find(c => c.pokemontcg_id === ptcgCard.id) ?? null
        if (exact) { results.push({ ...line, card: exact, ptcgCard: null, status: 'found' }); continue }

        // 4 — not in local DB → defer import to doImport so user can pick era first
        results.push({ ...line, card: null, ptcgCard, status: 'needs-import' })
        continue
      }

      // 5 — pokemontcg.io found nothing → best local guess or not-found
      const fallback = numberMatches[0] ?? localCards[0] ?? null
      results.push({ ...line, card: fallback, ptcgCard: null, status: fallback ? 'found' : 'not-found' })
    }
    // Default per-card era to the deck's era
    const eraInit: Record<number, number> = {}
    results.forEach((_, i) => { eraInit[i] = deck.era_block_id })
    setImportCardEras(eraInit)
    setImportResults(results)
    setImportBusy(false)
  }

  const doImport = async (mode: 'real' | 'proxy' | 'missing') => {
    if (!deck || !importResults) return
    setImportBusy(true)
    const existingNames = new Set(deck.cards.map(c => c.name))
    let ok = 0; let skipped = 0

    for (let i = 0; i < importResults.length; i++) {
      const r = importResults[i]
      if (r.status === 'not-found') continue

      let cardId = r.card?.id

      // needs-import: first import the card into the local DB with the selected era
      if (!cardId && r.ptcgCard) {
        if (existingNames.has(r.ptcgCard.name)) continue
        const eraBlockId = importCardEras[i] ?? deck.era_block_id
        const importRes = await adminFetch(`${BASE}/api/admin/cards/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pokemontcg_id: r.ptcgCard.id, era_block_id: eraBlockId || undefined }),
        })
        if (!importRes.ok) { skipped++; continue }
        const json = await importRes.json() as { id?: number }
        cardId = json.id
      }

      if (!cardId || existingNames.has(r.card?.name ?? '')) continue

      const res = await adminFetch(`${BASE}/api/admin/decks/${deck.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id:     cardId,
          qty_real:    mode === 'real'    ? r.count : 0,
          qty_proxy:   mode === 'proxy'   ? r.count : 0,
          qty_missing: mode === 'missing' ? r.count : 0,
          qty_ordered: 0,
        }),
      })
      if (res.ok) ok++; else skipped++
    }
    setImportMessage(`Imported ${ok} card${ok !== 1 ? 's' : ''} as ${mode}${skipped > 0 ? ` · ${skipped} skipped` : ''}`)
    setImportResults(null); setImportText(''); setImportOpen(false); setImportBusy(false); setImportCardEras({}); setRowSearch({}); setRowLocalResults({}); setRowPtcgResults({})
    load()
  }

  if (!deck) return <div style={{ padding: 40, color: '#888' }}>Loading…</div>

  // Live count from unsaved qtys state
  const totalCards = Object.values(qtys).reduce((s, q) => s + q.qty_real + q.qty_proxy + q.qty_missing + q.qty_ordered, 0)
  const liveReal    = Object.values(qtys).reduce((s, q) => s + q.qty_real,    0)
  const liveProxy   = Object.values(qtys).reduce((s, q) => s + q.qty_proxy,   0)
  const liveMissing = Object.values(qtys).reduce((s, q) => s + q.qty_missing, 0)
  const liveOrdered = Object.values(qtys).reduce((s, q) => s + q.qty_ordered, 0)

  // All cards in a single sorted list with supertype order preserved
  const supertypeOrder: Record<string, number> = { 'Pokémon': 1, 'Trainer': 2, 'Energy': 3 }
  const sortedCards = [...deck.cards].sort((a, b) =>
    (supertypeOrder[a.supertype] ?? 9) - (supertypeOrder[b.supertype] ?? 9) || a.name.localeCompare(b.name)
  )

  // Group cards by supertype for section headers
  const grouped: Record<string, DeckCard[]> = {}
  for (const c of sortedCards) {
    if (!grouped[c.supertype]) grouped[c.supertype] = []
    grouped[c.supertype].push(c)
  }

  return (
    <div style={S.page} className="admin-page">
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
            <label style={S.label}>Era</label>
            <select
              style={S.select}
              value={meta.era_block_id}
              onChange={e => {
                const newEra = Number(e.target.value)
                const fmtValid = formats.find(f => f.id === meta.format_id)?.era_id === newEra
                setMeta(m => ({ ...m, era_block_id: newEra, format_id: fmtValid ? m.format_id : 0 }))
              }}
            >
              <option value={0}>— none —</option>
              {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Format</label>
            <select style={S.select} value={meta.format_id} onChange={e => setMeta(m => ({ ...m, format_id: Number(e.target.value) }))}>
              <option value={0}>— none —</option>
              {(meta.era_block_id ? formats.filter(f => f.era_id === meta.era_block_id) : formats)
                .map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Size</label>
            <input style={S.input} type="number" value={meta.intended_size} onChange={e => setMeta(m => ({ ...m, intended_size: Number(e.target.value) }))} />
          </div>
        </div>
        <div style={{ ...S.field, marginBottom: 10 }}>
          <label style={S.label}>Type(s) — first is primary</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ENERGY_TYPES.map(t => {
              const isOn = meta.energy_types.includes(t)
              const e = ENERGY_META[t as EnergyType]
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const next = isOn
                      ? meta.energy_types.filter(x => x !== t)
                      : [...meta.energy_types, t]
                    if (next.length === 0) return
                    setMeta(m => ({ ...m, energy_types: next, energy_type: next[0] }))
                  }}
                  style={{
                    padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                    border: `1.5px solid ${isOn ? e.color : '#D0D5DD'}`,
                    background: isOn ? e.color : 'transparent',
                    color: isOn ? '#fff' : '#aaa',
                    cursor: 'pointer', textTransform: 'uppercase',
                  }}
                >
                  {t}
                  {isOn && meta.energy_types[0] === t && meta.energy_types.length > 1 && (
                    <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 8 }}>★</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div style={S.field}>
          <label style={S.label}>Deck Description (Markdown)</label>
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ ...S.field, position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <label style={S.label}>Card name</label>
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
                    {r.image_ext_url && <img src={r.image_ext_url} alt="" style={{ height: 28, aspectRatio: '63/88', objectFit: 'cover' }} />}
                    <span style={{ fontWeight: 700 }}>{r.display_name ?? r.name}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>{r.supertype} · {r.set_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={S.field}>
            <label style={S.label}>Set</label>
            <select
              style={{ ...S.select, width: 180 }}
              value={searchSet}
              onChange={e => { setSearchSet(e.target.value); searchCards(query, undefined, e.target.value) }}
            >
              <option value="">All sets</option>
              {setOptions.map(s => <option key={s.set_id} value={s.set_id}>{s.set_name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Format</label>
            <select style={S.select} value={searchFormatId} onChange={e => { const id = Number(e.target.value); setSearchFormatId(id); searchCards(query, id) }}>
              <option value={0}>All formats</option>
              {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TCG Live import */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: importOpen ? 12 : 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>Import from TCG Live</div>
          <button
            style={S.btnS}
            onClick={() => { setImportOpen(o => !o); setImportResults(null); setImportMessage(null); setImportCardEras({}); setRowSearch({}); setRowLocalResults({}); setRowPtcgResults({}) }}
          >
            {importOpen ? 'Cancel' : 'Paste decklist ↓'}
          </button>
        </div>

        {importMessage && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', fontSize: 12, padding: '6px 10px', marginTop: 8 }}>
            {importMessage}
          </div>
        )}

        {importOpen && (
          <>
            <textarea
              style={{ ...S.input, height: 160, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }}
              placeholder={'Paste your TCG Live export here:\n\nPokémon: 4\n4 Charizard ex SVI 6\n\nTrainer: 4\n4 Arven OBF 186\n\nEnergy: 4\n4 Fire Energy SVE 1'}
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportResults(null); setRowSearch({}); setRowLocalResults({}); setRowPtcgResults({}) }}
            />
            <button
              style={{ ...S.btnP, marginBottom: importResults ? 14 : 0 }}
              onClick={parseAndLookup}
              disabled={importBusy || !importText.trim()}
            >
              {importBusy ? 'Looking up cards…' : 'Parse & look up'}
            </button>

            {importResults && (
              <>
                <div className="scroll-x">
                <table style={{ ...S.table, marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 36 }}></th>
                      {['Qty', 'Parsed name', 'Set', '#', 'Card ID', 'Matched card', 'Era', 'Status'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((r, i) => {
                      const matchedName = r.card?.name ?? r.ptcgCard?.name ?? null
                      const already = matchedName ? !!deck.cards.find(c => c.name === matchedName) : false
                      const imgUrl = r.card?.image_ext_url ?? (r.ptcgCard?.images?.small ?? null)
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,58,92,0.02)' }}>
                          <td style={{ ...S.td, width: 44, padding: '4px 8px' }}>
                            {imgUrl && (
                              <img
                                src={imgUrl}
                                alt=""
                                style={{ height: 44, aspectRatio: '63/88', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                onMouseEnter={e => {
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                  setCardPreview({ url: imgUrl, x: rect.right + 12, y: rect.top })
                                }}
                                onMouseLeave={() => setCardPreview(null)}
                              />
                            )}
                          </td>
                          <td style={S.td}>{r.count}</td>
                          <td style={{ ...S.td, fontWeight: 600 }}>{r.name}</td>
                          <td style={{ ...S.td, color: '#888', fontFamily: 'monospace' }}>{r.set}</td>
                          <td style={{ ...S.td, color: '#888', fontFamily: 'monospace' }}>{r.number}</td>
                          <td style={{ ...S.td, color: '#888', fontFamily: 'monospace' }}>{r.ptcgCard?.id}</td>
                          <td style={{ ...S.td, minWidth: 180 }}>
                            {r.status === 'not-found' ? (
                              <div style={{ position: 'relative' }}>
                                <input
                                  style={{ ...S.input, fontSize: 11, padding: '3px 6px', width: 160 }}
                                  value={rowSearch[i] ?? ''}
                                  onChange={e => searchRow(i, e.target.value)}
                                  placeholder="Search…"
                                />
                                {((rowLocalResults[i]?.length ?? 0) > 0 || (rowPtcgResults[i]?.length ?? 0) > 0) && (
                                  <div style={{ position: 'absolute', top: '100%', left: 0, width: 260, background: '#fff', border: '1.5px solid #D0D5DD', borderTop: 'none', zIndex: 20, maxHeight: 280, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                                    {(rowLocalResults[i]?.length ?? 0) > 0 && (
                                      <>
                                        <div style={{ padding: '4px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.08em', color: '#aaa', background: '#FAFBFC', borderBottom: '1px solid #F0F2F5', textTransform: 'uppercase' }}>Catalog</div>
                                        {rowLocalResults[i].map(opt => (
                                          <div
                                            key={opt.id}
                                            onClick={() => assignRowCard(i, opt)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #F0F2F5' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F5F7FA'}
                                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}
                                          >
                                            {opt.image_ext_url && <img src={opt.image_ext_url} alt="" style={{ height: 28, aspectRatio: '63/88', objectFit: 'cover', flexShrink: 0 }} />}
                                            <span>
                                              <span style={{ fontWeight: 700 }}>{opt.display_name ?? opt.name}</span>
                                              <span style={{ color: '#aaa', fontSize: 10, display: 'block' }}>{opt.set_name}</span>
                                            </span>
                                          </div>
                                        ))}
                                      </>
                                    )}
                                    {(rowPtcgResults[i]?.length ?? 0) > 0 && (
                                      <>
                                        <div style={{ padding: '4px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.08em', color: '#1E78C4', background: '#F0F8FF', borderBottom: '1px solid #F0F2F5', textTransform: 'uppercase' }}>TCG API — will import</div>
                                        {rowPtcgResults[i].map((opt: any) => (
                                          <div
                                            key={opt.id}
                                            onClick={() => assignRowPtcgCard(i, opt)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #F0F2F5' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F0F8FF'}
                                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}
                                          >
                                            {opt.images?.small && <img src={opt.images.small} alt="" style={{ height: 28, aspectRatio: '63/88', objectFit: 'cover', flexShrink: 0 }} />}
                                            <span>
                                              <span style={{ fontWeight: 700 }}>{opt.name}</span>
                                              <span style={{ color: '#aaa', fontSize: 10, display: 'block' }}>{opt.set?.name} · {opt.id}</span>
                                            </span>
                                          </div>
                                        ))}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              r.card ? (r.card.display_name ?? r.card.name) : r.ptcgCard?.name ?? '—'
                            )}
                          </td>
                          <td style={{ ...S.td, minWidth: 120 }}>
                            {r.status === 'needs-import' ? (
                              <select
                                value={importCardEras[i] ?? deck.era_block_id}
                                onChange={e => setImportCardEras(prev => ({ ...prev, [i]: Number(e.target.value) }))}
                                style={{ ...S.select, fontSize: 11, padding: '2px 4px' }}
                              >
                                <option value={0}>— none —</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            ) : r.card?.era_name ? (
                              <span style={{ fontSize: 11, color: '#888' }}>{r.card.era_name}</span>
                            ) : (
                              <span style={{ color: '#ccc' }}>—</span>
                            )}
                          </td>
                          <td style={S.td}>
                            {already
                              ? <span style={{ color: '#888', fontSize: 11 }}>already in deck</span>
                              : r.status === 'found'
                                ? <span style={{ color: '#2E8B57', fontSize: 11, fontWeight: 700 }}>✓ found</span>
                                : r.status === 'needs-import'
                                  ? <span style={{ color: '#1E78C4', fontSize: 11, fontWeight: 700 }}>⬇ will import</span>
                                  : <span style={{ color: '#CC3333', fontSize: 11, fontWeight: 700 }}>✗ not found</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                </div>

                {(() => {
                  const existingNames = new Set(deck.cards.map(c => c.name))
                  const importable = importResults.filter(r => {
                    if (r.status === 'not-found') return false
                    if (r.status === 'needs-import') return r.ptcgCard && !existingNames.has(r.ptcgCard.name)
                    return r.card && !existingNames.has(r.card.name)
                  })
                  const notFound = importResults.filter(r => r.status === 'not-found').length
                  return (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button style={S.btnP} onClick={() => doImport('real')}
                        disabled={importBusy || importable.length === 0}>
                        {importBusy ? 'Importing…' : `Import ${importable.length} as Real`}
                      </button>
                      <button style={{ ...S.btnS, color: '#7B52C4', borderColor: '#C4B0F0' }} onClick={() => doImport('proxy')}
                        disabled={importBusy || importable.length === 0}>
                        Import {importable.length} as Proxy
                      </button>
                      <button style={{ ...S.btnD }} onClick={() => doImport('missing')}
                        disabled={importBusy || importable.length === 0}>
                        Import {importable.length} as Missing
                      </button>
                      {notFound > 0 && (
                        <span style={{ fontSize: 11, color: '#aaa' }}>{notFound} not found will be skipped</span>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </>
        )}
      </div>

      {/* Deck cards */}
      <div style={S.card}>
        {saveError && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', color: '#CC3333', fontSize: 12, padding: '6px 10px', marginBottom: 10 }}>
            {saveError}
          </div>
        )}
        {(() => {
          const changedCount = deck.cards.filter(c => {
            const q = qtys[c.deck_card_id]
            if (!q) return false
            return q.qty_real !== c.qty_real || q.qty_proxy !== c.qty_proxy ||
                   q.qty_missing !== c.qty_missing || q.qty_ordered !== c.qty_ordered ||
                   (fanSlots[c.deck_card_id] ?? null) !== c.fan_slot
          }).length
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: totalCards > deck.intended_size ? '#CC3333' : '#888' }}>
                  Cards ({totalCards} / {deck.intended_size})
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
                  <span style={{ color: '#2E8B57' }}>● Real: {liveReal}</span>
                  <span style={{ color: '#7B52C4' }}>● Proxy: {liveProxy}</span>
                  {liveMissing > 0 && <span style={{ color: '#CC3333' }}>● Missing: {liveMissing}</span>}
                  {liveOrdered > 0 && <span style={{ color: '#1E78C4' }}>● Ordered: {liveOrdered}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {saveAllDone && <span style={{ fontSize: 12, color: '#2E8B57' }}>✓ Saved</span>}
                <button
                  style={{ ...S.btnP, opacity: changedCount === 0 || savingAll ? 0.5 : 1 }}
                  onClick={saveAll}
                  disabled={changedCount === 0 || savingAll}
                >
                  {savingAll ? 'Saving…' : changedCount > 0 ? `Save ${changedCount} change${changedCount !== 1 ? 's' : ''}` : 'No changes'}
                </button>
              </div>
            </div>
          )
        })()}

        {/* Single unified table for all card types */}
        {deck.cards.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
            No cards yet — search for cards above to add them
          </div>
        ) : (
          <div className="scroll-x">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 36 }}></th>
                <th style={S.th}>Name</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Real</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Proxy</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Missing</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Ordered</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Total</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Fan</th>
                <th style={{ ...S.th, width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([supertype, cards]) => (
                <React.Fragment key={supertype}>
                  <tr>
                    <td colSpan={9} style={{
                      padding: '6px 12px 4px',
                      fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: '#aaa',
                      borderBottom: '2px solid #E8ECF0',
                      background: '#FAFBFC',
                    }}>
                      {supertype} ({cards.reduce((s, c) => s + (qtys[c.deck_card_id]
                        ? qtys[c.deck_card_id].qty_real + qtys[c.deck_card_id].qty_proxy + qtys[c.deck_card_id].qty_missing + qtys[c.deck_card_id].qty_ordered
                        : c.intended_quantity), 0)})
                    </td>
                  </tr>
                  {cards.map(c => {
                    const q = qtys[c.deck_card_id] ?? { qty_real: c.qty_real, qty_proxy: c.qty_proxy, qty_missing: c.qty_missing, qty_ordered: c.qty_ordered }
                    const currentFan = fanSlots[c.deck_card_id] ?? null
                    const changed = q.qty_real !== c.qty_real || q.qty_proxy !== c.qty_proxy || q.qty_missing !== c.qty_missing || q.qty_ordered !== c.qty_ordered || currentFan !== c.fan_slot
                    const update = (field: keyof typeof q, v: number) => setQtys(prev => ({ ...prev, [c.deck_card_id]: { ...q, [field]: v } }))
                    const isConfirming = deleteConfirm === c.deck_card_id
                    return (
                      <tr key={c.deck_card_id} style={{ borderLeft: changed ? '3px solid #F59E0B' : '3px solid transparent' }}>
                        <td style={{ ...S.td, width: 52, padding: '4px 8px' }}>
                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt=""
                              style={{ height: 52, aspectRatio: '63/88', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                              onMouseEnter={e => {
                                const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                setCardPreview({ url: c.image_url!, x: r.right + 12, y: r.top })
                              }}
                              onMouseLeave={() => setCardPreview(null)}
                            />
                          )}
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
                        <td style={{ ...S.td, whiteSpace: 'nowrap', textAlign: 'right', width: 140 }}>
                          {isConfirming ? (
                            <>
                              <span style={{ fontSize: 12, color: '#CC3333', marginRight: 6 }}>Remove?</span>
                              <button style={{ ...S.btnD, marginRight: 4 }} onClick={() => removeCard(c.deck_card_id)}>Yes</button>
                              <button style={S.btnS} onClick={() => setDeleteConfirm(null)}>No</button>
                            </>
                          ) : (
                            <>
                              <button style={{ ...S.btnS, marginRight: 4 }} onClick={() => openSwapModal(c)} title="Change printing">⇄</button>
                              <button style={S.btnD} onClick={() => setDeleteConfirm(c.deck_card_id)}>✕</button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        )}
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

      {swapModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) setSwapModal(null) }}
        >
          <div style={{ background: '#fff', width: 520, maxWidth: '90vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.22)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#1a3a5c', marginBottom: 16 }}>
              Change printing — {swapModal.cardName}
            </div>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {swapModal.options.length === 0 ? (
                <div style={{ color: '#888', fontSize: 13, padding: '12px 0' }}>No other printings found in the catalog.</div>
              ) : swapModal.options.map(opt => {
                const isCurrent = opt.id === swapModal.currentCardId
                const imgUrl = opt.image_ext_url || (opt.image_r2_key ? `${BASE}/api/images/${opt.image_r2_key}` : null)
                return (
                  <div
                    key={opt.id}
                    onClick={() => { if (!isCurrent) swapCard(opt.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      border: isCurrent ? '2px solid #1a3a5c' : '1.5px solid #E8ECF0',
                      background: isCurrent ? '#F0F4FF' : '#fff',
                      cursor: isCurrent ? 'default' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.background = '#F5F7FA' }}
                    onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.background = '#fff' }}
                  >
                    {imgUrl
                      ? <img src={imgUrl} alt="" style={{ height: 60, aspectRatio: '63/88', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 43, height: 60, background: '#F0F2F5', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{opt.display_name ?? opt.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        {opt.set_name ?? '—'}{opt.set_id ? ` (${opt.set_id})` : ''}
                      </div>
                      {opt.pokemontcg_id && (
                        <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', marginTop: 1 }}>{opt.pokemontcg_id}</div>
                      )}
                    </div>
                    {isCurrent && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', flexShrink: 0 }}>Current</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button style={S.btnS} onClick={() => setSwapModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
