import React, { useState, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { adminS as S } from './AdminLayout'
import { fetchDecks, fetchEraBlocks, BASE } from '../../lib/api'
import type { DeckSummary, EraBlock } from '../../lib/api'
import { adminFetch } from '../../lib/adminAuth'
import { ENERGY_META } from '../../data/decks'
import type { EnergyType } from '../../data/decks'

const ENERGY_TYPES = ['colorless', 'darkness', 'dragon', 'fighting', 'fire', 'grass', 'lightning', 'metal', 'psychic', 'water']
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const emptyForm = () => ({
  name: '', slug: '', era_block_id: '', format_id: '', energy_type: 'colorless', intended_size: '60', primer_md: '',
})

type SortCol = 'name' | 'type' | 'format' | 'era'

export function AdminDecksPage() {
  const [decks,   setDecks]   = useState<DeckSummary[]>([])
  const [blocks,  setBlocks]  = useState<EraBlock[]>([])
  const [formats, setFormats] = useState<{ id: number; name: string; era_id: number | null; is_block: number }[]>([])
  const [form,    setForm]    = useState<ReturnType<typeof emptyForm> | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  // Filter + sort state
  const [eraFilter,    setEraFilter]    = useState('')
  const [formatFilter, setFormatFilter] = useState('')
  const [sortCol,      setSortCol]      = useState<SortCol>('era')
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc')

  const load = () => fetchDecks().then(setDecks)

  useEffect(() => {
    load()
    fetchEraBlocks().then(setBlocks)
    fetch(`${BASE}/api/formats`).then(r => r.json()).then((j: any) => setFormats(j.data))
  }, [])

  // era slug → sort_order lookup
  const eraOrder = useMemo(() => {
    const map: Record<string, number> = {}
    blocks.forEach(b => { map[b.slug] = b.sort_order })
    return map
  }, [blocks])

  // unique format options derived from decks (respects era filter)
  const formatOptions = useMemo(() => {
    const seen = new Set<string>()
    return decks
      .filter(d => !eraFilter || d.era_slug === eraFilter)
      .reduce<{ slug: string; name: string }[]>((acc, d) => {
        if (d.format && !seen.has(d.format)) {
          seen.add(d.format)
          acc.push({ slug: d.format, name: d.format_name ?? d.format })
        }
        return acc
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [decks, eraFilter])

  const filteredDecks = useMemo(() => {
    let result = decks.filter(d =>
      (!eraFilter    || d.era_slug === eraFilter) &&
      (!formatFilter || d.format   === formatFilter)
    )

    result = [...result].sort((a, b) => {
      const eraA = eraOrder[a.era_slug] ?? 99
      const eraB = eraOrder[b.era_slug] ?? 99
      const fmtA = a.format_name ?? a.format ?? ''
      const fmtB = b.format_name ?? b.format ?? ''

      let cmp = 0
      if (sortCol === 'era') {
        cmp = eraA - eraB || fmtA.localeCompare(fmtB) || a.name.localeCompare(b.name)
      } else if (sortCol === 'format') {
        cmp = fmtA.localeCompare(fmtB) || eraA - eraB || a.name.localeCompare(b.name)
      } else if (sortCol === 'type') {
        cmp = a.energy_type.localeCompare(b.energy_type) || a.name.localeCompare(b.name)
      } else {
        cmp = a.name.localeCompare(b.name)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [decks, eraFilter, formatFilter, sortCol, sortDir, eraOrder])

  const createDeck = async () => {
    if (!form) return
    setCreateError(null)
    const res = await adminFetch(`${BASE}/api/admin/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:          form.name,
        slug:          form.slug,
        era_block_id:  Number(form.era_block_id),
        format_id:     Number(form.format_id),
        energy_type:   form.energy_type,
        intended_size: Number(form.intended_size),
        primer_md:     form.primer_md || undefined,
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
    await adminFetch(`${BASE}/api/admin/decks/${id}`, { method: 'DELETE' })
    load()
  }

  const totals = (d: DeckSummary) => d.counts.real + d.counts.proxy + d.counts.missing + d.counts.ordered

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortTh = ({ col, children }: { col: SortCol; children: React.ReactNode }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{ ...S.th, cursor: 'pointer', userSelect: 'none', color: sortCol === col ? '#1a3a5c' : undefined }}
    >
      {children}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <div style={S.page} className="admin-page">
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
                <label style={S.label}>Era</label>
                <select
                  style={S.select}
                  value={form.era_block_id}
                  onChange={e => {
                    const newEra = e.target.value
                    const fmtValid = formats.find(f => f.id === Number(form.format_id))?.era_id === Number(newEra)
                    setForm(f => ({ ...f!, era_block_id: newEra, format_id: fmtValid ? f!.format_id : '' }))
                  }}
                >
                  <option value="">Select…</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
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
                  {(form.era_block_id ? formats.filter(f => f.era_id === Number(form.era_block_id)) : formats)
                    .map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
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
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={S.field}>
            <label style={S.label}>Era</label>
            <select
              style={S.select}
              value={eraFilter}
              onChange={e => { setEraFilter(e.target.value); setFormatFilter('') }}
            >
              <option value="">All eras</option>
              {blocks.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Format</label>
            <select
              style={S.select}
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value)}
            >
              <option value="">All formats</option>
              {formatOptions.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}
            </select>
          </div>
          {(eraFilter || formatFilter) && (
            <button style={S.btnS} onClick={() => { setEraFilter(''); setFormatFilter('') }}>Clear</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa', alignSelf: 'center' }}>
            {filteredDecks.length} / {decks.length} decks
          </span>
        </div>

        <div className="scroll-x">
        <table style={S.table}>
          <thead><tr>
            <SortTh col="name">Name</SortTh>
            <SortTh col="type">Type</SortTh>
            <SortTh col="format">Format</SortTh>
            <SortTh col="era">Era</SortTh>
            <th style={S.th}>Real</th>
            <th style={S.th}>Proxy</th>
            <th style={S.th}>Missing</th>
            <th style={S.th}>Ordered</th>
            <th style={S.th}>Total</th>
            <th style={S.th}></th>
          </tr></thead>
          <tbody>
            {filteredDecks.map(d => {
              const typeMeta = ENERGY_META[d.energy_type as EnergyType]
              return (
                <tr key={d.id}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{d.name}</td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    {typeMeta
                      ? <span style={{ display: 'inline-block', background: typeMeta.color, color: '#fff', padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{typeMeta.abbr}</span>
                      : <span style={{ color: '#888' }}>{d.energy_type}</span>}
                  </td>
                  <td style={{ ...S.td, color: '#888', fontSize: 12 }}>{d.format_name ?? d.format}</td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-block', background: d.era_color, color: d.era_badge_text_color, padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{d.era}</span>
                  </td>
                  <td style={{ ...S.td, color: '#2E8B57', fontWeight: 700 }}>{d.counts.real}</td>
                  <td style={{ ...S.td, color: '#7B52C4' }}>{d.counts.proxy || '—'}</td>
                  <td style={{ ...S.td, color: d.counts.missing ? '#CC3333' : '#aaa' }}>{d.counts.missing || '—'}</td>
                  <td style={{ ...S.td, color: d.counts.ordered ? '#1E78C4' : '#aaa' }}>{d.counts.ordered || '—'}</td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{totals(d)}</td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <Link to="/admin/decks/$slug/edit" params={{ slug: d.slug }} style={{ textDecoration: 'none' }}>
                      <button style={{ ...S.btnP, marginRight: 4 }}>Edit</button>
                    </Link>
                    <button style={S.btnD} onClick={() => deleteDeck(d.id)}>Del</button>
                  </td>
                </tr>
              )
            })}
            {filteredDecks.length === 0 && (
              <tr><td colSpan={10} style={{ ...S.td, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No decks match the current filters</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
