export const BASE = import.meta.env.VITE_API_URL ?? ''

export interface FanCard {
  fan_slot: number
  name: string
  image_url: string | null
}

export interface DeckSummary {
  id: number
  slug: string
  name: string
  energy_type: string
  era: string       // 'HGSS', 'BW', …
  era_slug: string  // 'hgss', 'bw', …
  era_name: string  // 'HGSS Block', …
  era_color: string
  era_dark: string
  format: string    // 'modified', 'standard', …
  counts: { real: number; proxy: number; missing: number; ordered: number }
  fan_cards: FanCard[]
}

export interface EraBlock {
  id: number
  slug: string
  key: string
  name: string
  color: string
  dark: string
  sort_order: number
}

export interface AdminCard {
  id: number
  pokemontcg_id: string | null
  name: string
  display_name: string | null
  supertype: string
  energy_type: string | null
  set_id: string | null
  set_name: string | null
  set_series: string | null
  era_block_id: number | null
  era_name: string | null
  era_slug: string | null
  is_custom: number
  image_ext_url: string | null
  image_r2_key: string | null
}

export interface DeckCard {
  deck_card_id:      number
  fan_slot:          number | null
  name:              string
  supertype:         string  // 'Pokémon' | 'Trainer' | 'Energy'
  intended_quantity: number
  qty_real:          number
  qty_proxy:         number
  qty_missing:       number
  qty_ordered:       number
  image_url:         string | null
}

export interface DeckDetail extends DeckSummary {
  cover_r2_key:  string | null
  primer_md:     string | null
  manual_status: string | null
  intended_size: number
  format_id:     number
  cards:         DeckCard[]
}

export interface Format {
  id:               number
  slug:             string
  name:             string
  regulation_marks: string | null  // JSON array e.g. '["E","F","G"]'
  legal_set_ids:    string | null  // JSON array e.g. '["sv1","sv2"]'
  sort_order:       number
}

export interface StatsOverview {
  totalDecks: number
  totalReal: number
  totalProxy: number
  totalMissing: number
  totalOrdered: number
}

export async function fetchDecks(params?: { era?: string; format?: string }): Promise<DeckSummary[]> {
  const url = new URL(`${BASE}/api/decks`, window.location.href)
  if (params?.era)    url.searchParams.set('era',    params.era)
  if (params?.format) url.searchParams.set('format', params.format)
  const res = await fetch(url.toString())
  const json = await res.json() as { data: DeckSummary[] }
  return json.data
}

export async function fetchDeck(slug: string): Promise<DeckDetail | null> {
  const res = await fetch(`${BASE}/api/decks/${slug}`)
  if (res.status === 404) return null
  const json = await res.json() as { data: DeckDetail }
  return json.data
}

export async function fetchStatsOverview(): Promise<StatsOverview> {
  const res = await fetch(`${BASE}/api/stats/overview`)
  const json = await res.json() as { data: StatsOverview }
  return json.data
}

export interface BuylistRow {
  name: string
  supertype: string
  era: string | null
  era_slug: string | null
  era_color: string | null
  missing: number
  proxied: number
  ordered: number
  deck_count: number
}

export async function fetchBuylist(params?: {
  era?: string
  supertype?: string
  include_custom?: boolean
}): Promise<BuylistRow[]> {
  const url = new URL(`${BASE}/api/stats/buylist`, window.location.href)
  if (params?.era)            url.searchParams.set('era',            params.era)
  if (params?.supertype)      url.searchParams.set('supertype',      params.supertype)
  if (params?.include_custom) url.searchParams.set('include_custom', 'true')
  const res  = await fetch(url.toString())
  const json = await res.json() as { data: BuylistRow[] }
  return json.data
}

// ── Admin helpers ──────────────────────────────────────────────────────

export async function fetchEraBlocks(): Promise<EraBlock[]> {
  const res  = await fetch(`${BASE}/api/era-blocks`)
  const json = await res.json() as { data: EraBlock[] }
  return json.data
}

export async function fetchAdminCards(params?: { name?: string; supertype?: string; era?: string; format_id?: number }): Promise<AdminCard[]> {
  const url = new URL(`${BASE}/api/admin/cards`, window.location.href)
  if (params?.name)      url.searchParams.set('name',      params.name)
  if (params?.supertype) url.searchParams.set('supertype', params.supertype)
  if (params?.era)       url.searchParams.set('era',       params.era)
  if (params?.format_id) url.searchParams.set('format_id', String(params.format_id))
  const res  = await fetch(url.toString())
  const json = await res.json() as { data: AdminCard[] }
  return json.data
}

export async function fetchFormats(): Promise<Format[]> {
  const res  = await fetch(`${BASE}/api/formats`)
  const json = await res.json() as { data: Format[] }
  return json.data
}

export async function searchPokemontcg(q: string): Promise<{ data: any[]; error: string | null }> {
  const res  = await fetch(`${BASE}/api/admin/pokemontcg/search?q=${encodeURIComponent(q)}`)
  const json = await res.json() as { data?: any[]; error?: string | null }
  return { data: json.data ?? [], error: json.error ?? null }
}
