export const BASE = import.meta.env.VITE_API_URL ?? ''
import { adminFetch } from './adminAuth'
export { adminFetch }

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
  era_color:            string
  era_dark:             string
  era_badge_text_color: string
  format:        string   // slug, e.g. 'hgss-block-modified'
  format_name?:  string  // display name
  intended_size: number
  energy_types:  string[] | null
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
  badge_text_color: string
  sort_order: number
  ptcg_series:  string | null
  rules_primer: string | null
  rules_json:   string | null
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
  pokemontcg_id:     string | null
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
  era_block_id:  number
  format_name:   string
  cards:         DeckCard[]
}

export interface Format {
  id:               number
  slug:             string
  name:             string
  regulation_marks: string | null  // JSON array e.g. '["E","F","G"]'
  legal_set_ids:    string | null  // JSON array e.g. '["sv1","sv2"]'
  sort_order:       number
  era_id:           number | null
  is_block:         number         // 0 | 1
  era_slug:         string | null
  era_name:         string | null
  era_color:        string | null
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
  set_id: string | null
  set_name: string | null
  number: string | null
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
  set_id?: string
  include_custom?: boolean
}): Promise<BuylistRow[]> {
  const url = new URL(`${BASE}/api/stats/buylist`, window.location.href)
  if (params?.era)            url.searchParams.set('era',            params.era)
  if (params?.supertype)      url.searchParams.set('supertype',      params.supertype)
  if (params?.set_id)         url.searchParams.set('set_id',         params.set_id)
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

export async function fetchEras(): Promise<EraBlock[]> {
  const res  = await fetch(`${BASE}/api/eras`)
  const json = await res.json() as { data: EraBlock[] }
  return json.data
}

export async function fetchEra(slug: string): Promise<EraBlock | null> {
  const res  = await fetch(`${BASE}/api/eras/${slug}`)
  if (res.status === 404) return null
  const json = await res.json() as { data: EraBlock }
  return json.data
}

export async function fetchAdminCardSets(format_id?: number): Promise<{ set_id: string; set_name: string }[]> {
  const url = new URL(`${BASE}/api/admin/sets`, window.location.href)
  if (format_id) url.searchParams.set('format_id', String(format_id))
  const res  = await adminFetch(url.toString())
  const json = await res.json() as { data: { set_id: string; set_name: string }[] }
  return json.data
}

export async function fetchAdminCards(params?: { name?: string; supertype?: string; era?: string; set?: string; format_id?: number; pokemontcg_id?: string }): Promise<AdminCard[]> {
  const url = new URL(`${BASE}/api/admin/cards`, window.location.href)
  if (params?.name)          url.searchParams.set('name',          params.name)
  if (params?.supertype)     url.searchParams.set('supertype',     params.supertype)
  if (params?.era)           url.searchParams.set('era',           params.era)
  if (params?.set)           url.searchParams.set('set',           params.set)
  if (params?.format_id)     url.searchParams.set('format_id',     String(params.format_id))
  if (params?.pokemontcg_id) url.searchParams.set('pokemontcg_id', params.pokemontcg_id)
  const res  = await adminFetch(url.toString())
  const json = await res.json() as { data: AdminCard[] }
  return json.data
}

export interface PtcgSet {
  id: string
  name: string
  series: string
  releaseDate: string
  regulationMark: string | null
}

export interface FormatDetail extends Format {
  era_dark:        string | null
  era_ptcg_series: string | null
}

export async function fetchFormats(): Promise<Format[]> {
  const res  = await fetch(`${BASE}/api/formats`)
  const json = await res.json() as { data: Format[] }
  return json.data
}

export async function fetchFormat(slug: string): Promise<FormatDetail | null> {
  const res  = await fetch(`${BASE}/api/formats/${slug}`)
  if (res.status === 404) return null
  const json = await res.json() as { data: FormatDetail }
  return json.data
}

export async function fetchPtcgSets(): Promise<PtcgSet[]> {
  const res  = await adminFetch(`${BASE}/api/admin/pokemontcg/sets`)
  const json = await res.json() as { data: PtcgSet[] }
  return json.data
}

export async function searchPokemontcg(q: string, opts?: { ptcgo_code?: string; number?: string; set_id?: string; card_id?: string }): Promise<{ data: any[]; error: string | null }> {
  const url = new URL(`${BASE}/api/admin/pokemontcg/search`, window.location.href)
  if (q)                url.searchParams.set('q',          q)
  if (opts?.ptcgo_code) url.searchParams.set('ptcgo_code', opts.ptcgo_code)
  if (opts?.number)     url.searchParams.set('number',     opts.number)
  if (opts?.set_id)     url.searchParams.set('set',        opts.set_id)
  if (opts?.card_id)    url.searchParams.set('card_id',    opts.card_id)
  const res  = await adminFetch(url.toString())
  const json = await res.json() as { data?: any[]; error?: string | null }
  return { data: json.data ?? [], error: json.error ?? null }
}
