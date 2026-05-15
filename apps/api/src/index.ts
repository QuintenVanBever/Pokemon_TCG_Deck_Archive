import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
  DB: D1Database
  STORAGE: R2Bucket
  POKEMONTCG_API_KEY: string
  ADMIN_PASSWORD: string | undefined
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: (o) => {
    if (o === 'http://localhost:5173') return o
    if (o === 'https://deck-archive.byquint.dev') return o
    if (o === 'https://pokemon-tcg-deck-archive.pages.dev') return o
    if (o?.endsWith('.pokemon-tcg-deck-archive.pages.dev')) return o
    return null
  },
}))

// ── Admin auth middleware ─────────────────────────────────────────────

app.use('/api/admin/*', async (c, next) => {
  const pw = c.env.ADMIN_PASSWORD
  if (!pw) return next()  // secret not configured → open (dev mode)
  const auth = c.req.header('Authorization') ?? ''
  if (!auth.startsWith('Basic ')) {
    return c.json({ error: 'Unauthorized' }, 401, { 'WWW-Authenticate': 'Basic realm="Deck Archive Admin"' })
  }
  const decoded = atob(auth.slice(6))
  const password = decoded.slice(decoded.indexOf(':') + 1)
  if (password !== pw) {
    return c.json({ error: 'Unauthorized' }, 401, { 'WWW-Authenticate': 'Basic realm="Deck Archive Admin"' })
  }
  return next()
})

// ── Image proxy (R2) ──────────────────────────────────────────────────

app.get('/api/images/:key{.+}', async c => {
  const obj = await c.env.STORAGE.get(c.req.param('key'))
  if (!obj) return c.notFound()
  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
})

// ── Helpers ───────────────────────────────────────────────────────────

function resolveImageUrl(origin: string, r2Key: string | null, extUrl: string | null): string | null {
  if (r2Key)  return `${origin}/api/images/${r2Key}`
  if (extUrl) return extUrl
  return null
}

// ── Public routes ──────────────────────────────────────────────────────

app.get('/api/formats', async c => {
  const { results } = await c.env.DB.prepare(`
    SELECT f.*, eb.slug AS era_slug, eb.name AS era_name, eb.color AS era_color
    FROM formats f
    LEFT JOIN era_blocks eb ON eb.id = f.era_id
    ORDER BY f.sort_order, f.id
  `).all()
  return c.json({ data: results })
})

app.get('/api/formats/:slug', async c => {
  const { slug } = c.req.param()
  const format = await c.env.DB.prepare(`
    SELECT f.*, eb.slug AS era_slug, eb.name AS era_name, eb.color AS era_color,
           eb.dark AS era_dark, eb.ptcg_series AS era_ptcg_series
    FROM formats f
    LEFT JOIN era_blocks eb ON eb.id = f.era_id
    WHERE f.slug = ?
  `).bind(slug).first()
  if (!format) return c.json({ data: null }, 404)
  return c.json({ data: format })
})

// era-blocks: kept for backwards-compat (admin pages use this)
app.get('/api/era-blocks', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM era_blocks ORDER BY sort_order').all()
  return c.json({ data: results })
})

app.get('/api/era-blocks/:id', async c => {
  const id = Number(c.req.param('id'))
  const [block, legacyEras] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT * FROM era_blocks WHERE id = ?').bind(id),
    c.env.DB.prepare('SELECT * FROM eras WHERE era_block_id = ? ORDER BY sort_order').bind(id),
  ])
  const data = block.results[0]
  if (!data) return c.json({ data: null }, 404)
  return c.json({ data: { ...data, eras: legacyEras.results } })
})

// /api/eras — now returns era_blocks (Eras in the new model)
app.get('/api/eras', async c => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, slug, key, name, color, dark, badge_text_color, sort_order, ptcg_series, rules_primer, rules_json FROM era_blocks ORDER BY sort_order'
  ).all()
  return c.json({ data: results })
})

app.get('/api/eras/:slug', async c => {
  const { slug } = c.req.param()
  const era = await c.env.DB.prepare(
    'SELECT id, slug, key, name, color, dark, badge_text_color, sort_order, ptcg_series, rules_primer, rules_json FROM era_blocks WHERE slug = ?'
  ).bind(slug).first()
  if (!era) return c.json({ data: null }, 404)
  return c.json({ data: era })
})

app.get('/api/decks', async c => {
  const era    = c.req.query('era')    ?? null
  const format = c.req.query('format') ?? null
  const origin = new URL(c.req.url).origin

  let deckSql = `
    SELECT
      d.id, d.slug, d.name, d.energy_type, d.energy_types, d.intended_size,
      eb.key  AS era,       eb.slug AS era_slug, eb.name AS era_name,
      eb.color AS era_color, eb.dark AS era_dark, eb.badge_text_color AS era_badge_text_color,
      f.slug  AS format,    f.name  AS format_name,
      SUM(dc.qty_real)    AS count_real,
      SUM(dc.qty_proxy)   AS count_proxy,
      SUM(dc.qty_missing) AS count_missing,
      SUM(dc.qty_ordered) AS count_ordered
    FROM decks d
    JOIN era_blocks eb    ON eb.id = d.era_block_id
    JOIN formats    f     ON f.id  = d.format_id
    LEFT JOIN deck_cards dc ON dc.deck_id = d.id
    WHERE 1=1`
  const params: string[] = []
  if (era)    { deckSql += ' AND eb.slug = ?'; params.push(era) }
  if (format) { deckSql += ' AND f.slug  = ?'; params.push(format) }
  deckSql += ' GROUP BY d.id ORDER BY eb.sort_order, d.id'

  const [deckResult, fanResult] = await c.env.DB.batch([
    c.env.DB.prepare(deckSql).bind(...params),
    c.env.DB.prepare(`
      SELECT d.slug AS deck_slug, dc.fan_slot,
             COALESCE(c.display_name, c.name) AS name,
             c.image_r2_key, c.image_ext_url
      FROM deck_cards dc
      JOIN cards c ON c.id  = dc.card_id
      JOIN decks d ON d.id  = dc.deck_id
      WHERE dc.fan_slot IS NOT NULL
      ORDER BY d.slug, dc.fan_slot
    `),
  ])

  // Build fan-cards map keyed by deck slug
  const fanMap: Record<string, { fan_slot: number; name: string; image_url: string | null }[]> = {}
  for (const r of fanResult.results as any[]) {
    if (!fanMap[r.deck_slug]) fanMap[r.deck_slug] = []
    fanMap[r.deck_slug].push({ fan_slot: r.fan_slot, name: r.name, image_url: resolveImageUrl(origin, r.image_r2_key, r.image_ext_url) })
  }
  for (const slug in fanMap) fanMap[slug].sort((a, b) => a.fan_slot - b.fan_slot)

  return c.json({
    data: deckResult.results.map((row: any) => ({
      id:        row.id,
      slug:      row.slug,
      name:      row.name,
      energy_type: row.energy_type,
      era:       row.era,
      era_slug:  row.era_slug,
      era_name:  row.era_name,
      era_color:            row.era_color,
      era_dark:             row.era_dark,
      era_badge_text_color: row.era_badge_text_color ?? '#ffffff',
      format:        row.format,
      format_name:   row.format_name ?? null,
      intended_size: row.intended_size ?? 60,
      energy_types:  row.energy_types ? JSON.parse(row.energy_types) : null,
      counts: {
        real:    row.count_real    ?? 0,
        proxy:   row.count_proxy   ?? 0,
        missing: row.count_missing ?? 0,
        ordered: row.count_ordered ?? 0,
      },
      fan_cards: fanMap[row.slug] ?? [],
    })),
  })
})

app.get('/api/decks/:slug', async c => {
  const { slug } = c.req.param()
  const origin   = new URL(c.req.url).origin

  const [deckResult, cardsResult] = await c.env.DB.batch([
    c.env.DB.prepare(`
      SELECT
        d.id, d.slug, d.name, d.energy_type, d.energy_types, d.cover_r2_key,
        d.primer_md, d.manual_status, d.intended_size,
        d.format_id, d.era_block_id,
        eb.key  AS era,        eb.slug AS era_slug, eb.name AS era_name,
        eb.color AS era_color,  eb.dark AS era_dark, eb.badge_text_color AS era_badge_text_color,
        f.slug  AS format,     f.name  AS format_name
      FROM decks d
      JOIN era_blocks eb ON eb.id = d.era_block_id
      JOIN formats    f  ON f.id  = d.format_id
      WHERE d.slug = ?
    `).bind(slug),

    c.env.DB.prepare(`
      SELECT dc.id AS deck_card_id, dc.card_id, dc.fan_slot,
             COALESCE(c.display_name, c.name) AS name,
             c.pokemontcg_id,
             c.supertype,
             dc.intended_quantity, dc.qty_real, dc.qty_proxy, dc.qty_missing, dc.qty_ordered,
             c.image_r2_key, c.image_ext_url
      FROM deck_cards dc
      JOIN cards c ON c.id = dc.card_id
      JOIN decks d ON d.id = dc.deck_id
      WHERE d.slug = ?
      ORDER BY
        CASE c.supertype WHEN 'Pokémon' THEN 1 WHEN 'Trainer' THEN 2 ELSE 3 END,
        c.name
    `).bind(slug),
  ])

  const deck = deckResult.results[0] as any
  if (!deck) return c.json({ data: null }, 404)

  const cards = cardsResult.results as any[]
  const counts = cards.reduce(
    (acc, r) => { acc.real += r.qty_real; acc.proxy += r.qty_proxy; acc.missing += r.qty_missing; acc.ordered += r.qty_ordered; return acc },
    { real: 0, proxy: 0, missing: 0, ordered: 0 },
  )

  return c.json({
    data: {
      id:           deck.id,
      slug:         deck.slug,
      name:         deck.name,
      energy_type:  deck.energy_type,
      energy_types: deck.energy_types ? JSON.parse(deck.energy_types) : null,
      cover_r2_key: deck.cover_r2_key ?? null,
      primer_md:    deck.primer_md    ?? null,
      manual_status: deck.manual_status ?? null,
      intended_size: deck.intended_size ?? 60,
      format_id:    deck.format_id,
      era_block_id: deck.era_block_id,
      era:          deck.era,
      era_slug:     deck.era_slug,
      era_name:     deck.era_name,
      era_color:            deck.era_color,
      era_dark:             deck.era_dark,
      era_badge_text_color: deck.era_badge_text_color ?? '#ffffff',
      format:       deck.format,
      format_name:  deck.format_name,
      counts,
      cards: cards.map(r => ({
        deck_card_id:      r.deck_card_id,
        card_id:           r.card_id,
        fan_slot:          r.fan_slot ?? null,
        name:              r.name,
        pokemontcg_id:     r.pokemontcg_id ?? null,
        supertype:         r.supertype,
        intended_quantity: r.intended_quantity,
        qty_real:          r.qty_real,
        qty_proxy:         r.qty_proxy,
        qty_missing:       r.qty_missing,
        qty_ordered:       r.qty_ordered,
        image_url: resolveImageUrl(origin, r.image_r2_key, r.image_ext_url),
      })),
    },
  })
})

app.get('/api/decks/:slug/export', c => {
  return c.text('', 200, { 'Content-Type': 'text/plain' })
})

// Lookup by pokemontcg_id string (e.g. "hgss4-94") or fall back to integer id
app.get('/api/cards/:id', async c => {
  const id   = c.req.param('id')
  const intId = Number(id)
  const card  = await c.env.DB.prepare(`
    SELECT c.*, eb.name AS era_name, eb.slug AS era_slug
    FROM cards c LEFT JOIN era_blocks eb ON eb.id = c.era_block_id
    WHERE c.pokemontcg_id = ? OR (c.pokemontcg_id IS NULL AND c.id = ?)
  `).bind(id, isNaN(intId) ? -1 : intId).first()
  return c.json({ data: card ?? null })
})

app.get('/api/stats/overview', async c => {
  const { results } = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT d.id)   AS total_decks,
      SUM(dc.qty_real)       AS total_real,
      SUM(dc.qty_proxy)      AS total_proxy,
      SUM(dc.qty_missing)    AS total_missing,
      SUM(dc.qty_ordered)    AS total_ordered
    FROM decks d
    LEFT JOIN deck_cards dc ON dc.deck_id = d.id
  `).all()
  const row = results[0] as any
  return c.json({
    data: {
      totalDecks:   row?.total_decks   ?? 0,
      totalReal:    row?.total_real    ?? 0,
      totalProxy:   row?.total_proxy   ?? 0,
      totalMissing: row?.total_missing ?? 0,
      totalOrdered: row?.total_ordered ?? 0,
    },
  })
})

app.get('/api/stats/buylist', async c => {
  const era           = c.req.query('era')       ?? null
  const supertype     = c.req.query('supertype') ?? null
  const setId         = c.req.query('set_id')    ?? null
  const includeCustom = c.req.query('include_custom') === 'true'

  let sql = `
    SELECT
      COALESCE(c.display_name, c.name) AS name,
      c.supertype,
      c.set_id,
      c.set_name,
      c.pokemontcg_id,
      card_era.key   AS era,
      card_era.slug  AS era_slug,
      card_era.color AS era_color,
      SUM(dc.qty_missing) AS missing,
      SUM(dc.qty_proxy)   AS proxied,
      SUM(dc.qty_ordered) AS ordered,
      COUNT(DISTINCT dc.deck_id) AS deck_count
    FROM deck_cards dc
    JOIN cards      c        ON c.id       = dc.card_id
    JOIN decks      d        ON d.id       = dc.deck_id
    JOIN era_blocks deck_era ON deck_era.id = d.era_block_id
    LEFT JOIN era_blocks card_era ON card_era.id = c.era_block_id
    WHERE 1=1`
  const params: (string | number)[] = []
  if (era)       { sql += ' AND deck_era.slug = ?'; params.push(era) }
  if (supertype) { sql += ' AND c.supertype   = ?'; params.push(supertype) }
  if (setId)     { sql += ' AND c.set_id      = ?'; params.push(setId) }
  if (!includeCustom) { sql += ' AND c.is_custom = 0' }
  sql += `
    GROUP BY c.id
    HAVING missing + proxied + ordered > 0
    ORDER BY missing DESC, proxied DESC, c.name`

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({
    data: results.map((r: any) => {
      const ptcgId: string | null = r.pokemontcg_id ?? null
      const number = ptcgId ? (ptcgId.includes('-') ? ptcgId.slice(ptcgId.lastIndexOf('-') + 1) : null) : null
      return {
        name: r.name, supertype: r.supertype,
        set_id: r.set_id ?? null, set_name: r.set_name ?? null,
        number,
        era: r.era ?? null, era_slug: r.era_slug ?? null, era_color: r.era_color ?? null,
        missing: r.missing, proxied: r.proxied, ordered: r.ordered, deck_count: r.deck_count,
      }
    }),
  })
})

app.get('/api/stats/card-search', async c => {
  const q = (c.req.query('q') ?? '').trim()
  if (!q) return c.json({ data: [] })
  const like   = `%${q}%`
  const origin = new URL(c.req.url).origin
  const { results } = await c.env.DB.prepare(`
    SELECT
      c.id,
      COALESCE(c.display_name, c.name) AS name,
      c.supertype,
      c.set_name, c.set_id,
      c.image_ext_url, c.image_r2_key,
      c.pokemontcg_id,
      eb.name  AS era_name,
      eb.color AS era_color,
      COUNT(DISTINCT dc.deck_id)       AS deck_count,
      SUM(COALESCE(dc.qty_real,    0)) AS total_real,
      SUM(COALESCE(dc.qty_proxy,   0)) AS total_proxy,
      SUM(COALESCE(dc.qty_missing, 0)) AS total_missing,
      SUM(COALESCE(dc.qty_ordered, 0)) AS total_ordered
    FROM cards c
    LEFT JOIN deck_cards dc  ON dc.card_id  = c.id
    LEFT JOIN era_blocks eb  ON eb.id       = c.era_block_id
    WHERE LOWER(c.name) LIKE LOWER(?) OR LOWER(COALESCE(c.display_name,'')) LIKE LOWER(?)
    GROUP BY c.id
    ORDER BY deck_count DESC, c.name
    LIMIT 20
  `).bind(like, like).all()
  return c.json({
    data: (results as any[]).map(r => ({
      id:            r.id,
      name:          r.name,
      supertype:     r.supertype,
      set_name:      r.set_name  ?? null,
      set_id:        r.set_id    ?? null,
      image_url:     resolveImageUrl(origin, r.image_r2_key, r.image_ext_url),
      pokemontcg_id: r.pokemontcg_id ?? null,
      era_name:      r.era_name  ?? null,
      era_color:     r.era_color ?? null,
      deck_count:    r.deck_count,
      total_real:    r.total_real,
      total_proxy:   r.total_proxy,
      total_missing: r.total_missing,
      total_ordered: r.total_ordered,
    })),
  })
})

app.get('/api/stats/card-decks/:id', async c => {
  const cardId = Number(c.req.param('id'))
  const { results } = await c.env.DB.prepare(`
    SELECT
      d.id, d.name, d.slug,
      eb.name             AS era_name,
      eb.key              AS era_key,
      eb.color            AS era_color,
      eb.badge_text_color AS era_badge_text_color,
      eb.sort_order       AS era_sort,
      dc.qty_real, dc.qty_proxy, dc.qty_missing, dc.qty_ordered
    FROM deck_cards dc
    JOIN decks      d  ON d.id  = dc.deck_id
    JOIN era_blocks eb ON eb.id = d.era_block_id
    WHERE dc.card_id = ?
    ORDER BY eb.sort_order, d.name
  `).bind(cardId).all()
  return c.json({
    data: (results as any[]).map(r => ({
      id:                   r.id,
      name:                 r.name,
      slug:                 r.slug,
      era_name:             r.era_name,
      era_key:              r.era_key,
      era_color:            r.era_color,
      era_badge_text_color: r.era_badge_text_color ?? '#ffffff',
      qty_real:             r.qty_real,
      qty_proxy:            r.qty_proxy,
      qty_missing:          r.qty_missing,
      qty_ordered:          r.qty_ordered,
    })),
  })
})

app.get('/api/search', async c => {
  const q = c.req.query('q') ?? ''
  return c.json({ data: { decks: [], cards: [], eras: [] }, q })
})

// ── Admin routes ───────────────────────────────────────────────────────

app.get('/api/admin/pokemontcg/search', async c => {
  const q         = c.req.query('q')          ?? ''
  const set       = c.req.query('set')        ?? ''
  const ptcgoCode = c.req.query('ptcgo_code') ?? ''
  const number    = c.req.query('number')     ?? ''
  const cardId    = c.req.query('card_id')    ?? ''

  if (!q.trim() && !ptcgoCode && !set.trim() && !cardId.trim()) return c.json({ data: [] })

  const apiKey = c.env.POKEMONTCG_API_KEY ?? ''
  const SELECT = 'id,name,images,set,supertype,types,number'

  try {
    // Card ID — wildcard query so partial inputs like "g1-2" match g1-2, g1-20, g1-21…
    if (cardId.trim()) {
      const q = `id:${cardId.trim().replace(/\s+/g, '')}*`
      const res  = await fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=20&select=${SELECT}`, { headers: { 'X-Api-Key': apiKey } })
      const json = await res.json<any>()
      return c.json({ data: json.data ?? [], error: null })
    }

    // Pure set search — search by set name with wildcard, paginate to return every card
    if (set.trim() && !q.trim() && !ptcgoCode) {
      const setQ = `set.name:"${set.trim().replace(/"/g, '')}*"`
      const all: any[] = []
      for (let page = 1; page <= 5; page++) {
        const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(setQ)}&pageSize=250&page=${page}&orderBy=number&select=${SELECT}`
        const res  = await fetch(url, { headers: { 'X-Api-Key': apiKey } })
        const json = await res.json<any>()
        const batch: any[] = json.data ?? []
        all.push(...batch)
        if (all.length >= (json.totalCount ?? 0) || batch.length === 0) break
      }
      return c.json({ data: all, error: null })
    }

    // Name / combined search — regular 20-result query
    const parts: string[] = []
    if (q.trim()) {
      const safe = q.trim().replace(/"/g, '')
      parts.push(ptcgoCode ? `name:"${safe}"` : `name:"${safe}*"`)
    }
    if (set)       parts.push(`set.id:${set}`)
    if (ptcgoCode) parts.push(`set.ptcgoCode:${ptcgoCode}`)
    if (number)    parts.push(`number:${number}`)
    const res  = await fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(parts.join(' '))}&pageSize=20&select=${SELECT}`, { headers: { 'X-Api-Key': apiKey } })
    const json = await res.json<any>()
    return c.json({ data: json.data ?? [], error: json.error ?? null })
  } catch (e) {
    return c.json({ data: [], error: String(e) }, 502)
  }
})

app.get('/api/admin/pokemontcg/sets', async c => {
  const url = 'https://api.pokemontcg.io/v2/sets?pageSize=250&orderBy=-releaseDate&select=id,name,series,releaseDate,regulationMark'
  try {
    const res  = await fetch(url, { headers: { 'X-Api-Key': c.env.POKEMONTCG_API_KEY ?? '' }, cf: { cacheTtl: 3600 } } as any)
    const json = await res.json<any>()
    return c.json({ data: json.data ?? [] })
  } catch (e) {
    return c.json({ data: [], error: String(e) }, 502)
  }
})

// ── Formats ────────────────────────────────────────────────────────────

app.post('/api/admin/formats', async c => {
  const body = await c.req.json<any>()
  const { meta } = await c.env.DB.prepare(
    'INSERT INTO formats (slug, name, regulation_marks, legal_set_ids, sort_order, era_id, is_block) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(body.slug, body.name, body.regulation_marks ?? null, body.legal_set_ids ?? null, body.sort_order ?? 0, body.era_id ?? null, body.is_block ? 1 : 0).run()
  return c.json({ success: true, id: meta.last_row_id })
})
app.patch('/api/admin/formats/:id', async c => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>()
  const fields = ['name', 'slug', 'regulation_marks', 'legal_set_ids', 'sort_order', 'era_id', 'is_block']
  const sets: string[] = []; const params: any[] = []
  for (const f of fields) { if (f in body) { sets.push(`${f} = ?`); params.push(body[f] ?? null) } }
  if (sets.length) { params.push(id); await c.env.DB.prepare(`UPDATE formats SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
  return c.json({ success: true })
})
app.delete('/api/admin/formats/:id', async c => {
  await c.env.DB.prepare('DELETE FROM formats WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json({ success: true })
})

// ── Era blocks ─────────────────────────────────────────────────────────

app.post('/api/admin/era-blocks', async c => {
  const body = await c.req.json<any>()
  const { meta } = await c.env.DB.prepare(
    'INSERT INTO era_blocks (slug, key, name, color, dark, badge_text_color, sort_order, ptcg_series, rules_primer, rules_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(body.slug, body.key, body.name, body.color, body.dark, body.badge_text_color ?? '#ffffff', body.sort_order ?? 0, body.ptcg_series ?? null, body.rules_primer ?? null, body.rules_json ?? null).run()
  return c.json({ success: true, id: meta.last_row_id })
})
app.patch('/api/admin/era-blocks/:id', async c => {
  const id = Number(c.req.param('id')); const body = await c.req.json<any>()
  const fields = ['slug', 'key', 'name', 'color', 'dark', 'badge_text_color', 'sort_order', 'ptcg_series', 'rules_primer', 'rules_json']
  const sets: string[] = []; const params: any[] = []
  for (const f of fields) { if (f in body) { sets.push(`${f} = ?`); params.push(body[f] ?? null) } }
  if (sets.length) { params.push(id); await c.env.DB.prepare(`UPDATE era_blocks SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
  return c.json({ success: true })
})
app.delete('/api/admin/era-blocks/:id', async c => {
  await c.env.DB.prepare('DELETE FROM era_blocks WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json({ success: true })
})

// ── Eras ───────────────────────────────────────────────────────────────

app.post('/api/admin/eras', async c => {
  const body = await c.req.json<any>()
  const { meta } = await c.env.DB.prepare(`
    INSERT INTO eras (era_block_id, slug, name, code, release_date, sort_order, rules_primer, rules_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(body.era_block_id, body.slug, body.name, body.code ?? null, body.release_date ?? null, body.sort_order ?? 0, body.rules_primer ?? null, body.rules_json ?? null).run()
  return c.json({ success: true, id: meta.last_row_id })
})
app.patch('/api/admin/eras/:id', async c => {
  const id = Number(c.req.param('id')); const body = await c.req.json<any>()
  const fields = ['slug', 'name', 'code', 'release_date', 'sort_order', 'rules_primer', 'rules_json']
  const sets: string[] = []; const params: any[] = []
  for (const f of fields) { if (f in body) { sets.push(`${f} = ?`); params.push(body[f] ?? null) } }
  if (sets.length) { params.push(id); await c.env.DB.prepare(`UPDATE eras SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
  return c.json({ success: true })
})
app.delete('/api/admin/eras/:id', async c => {
  await c.env.DB.prepare('DELETE FROM eras WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json({ success: true })
})

// ── Cards ──────────────────────────────────────────────────────────────

app.get('/api/admin/sets', async c => {
  const formatId = c.req.query('format_id') ?? ''
  let sql = `SELECT DISTINCT c.set_id, c.set_name FROM cards c
    WHERE c.set_id IS NOT NULL AND c.set_name IS NOT NULL`
  const params: any[] = []
  if (formatId) {
    const fmt = await c.env.DB.prepare('SELECT era_id, regulation_marks, legal_set_ids FROM formats WHERE id = ?').bind(Number(formatId)).first() as any
    if (fmt) {
      if (fmt.legal_set_ids)     { sql += ' AND c.set_id IN (SELECT value FROM json_each(?))'; params.push(fmt.legal_set_ids) }
      else if (fmt.regulation_marks) { sql += ' AND c.regulation_mark IN (SELECT value FROM json_each(?))'; params.push(fmt.regulation_marks) }
      else if (fmt.era_id)       { sql += ' AND c.era_block_id = ?'; params.push(fmt.era_id) }
    }
  }
  sql += ' ORDER BY c.set_name'
  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ data: results })
})

app.get('/api/admin/cards', async c => {
  const name         = c.req.query('name')           ?? ''
  const supertype    = c.req.query('supertype')     ?? ''
  const era          = c.req.query('era')           ?? ''
  const formatId     = c.req.query('format_id')    ?? ''
  const pokemontcgId = c.req.query('pokemontcg_id') ?? ''
  const set          = c.req.query('set')           ?? ''
  let sql = `
    SELECT c.id, c.pokemontcg_id, c.name, c.display_name, c.supertype, c.energy_type,
           c.set_id, c.set_name, c.set_series, c.era_block_id,
           c.is_custom, c.image_ext_url, c.image_r2_key,
           eb.name AS era_name, eb.slug AS era_slug
    FROM cards c LEFT JOIN era_blocks eb ON eb.id = c.era_block_id
    WHERE 1=1`
  const params: any[] = []
  if (pokemontcgId) { sql += ' AND c.pokemontcg_id = ?'; params.push(pokemontcgId) }
  if (name)      { sql += ' AND (c.name LIKE ? OR c.display_name LIKE ?)'; params.push(`%${name}%`, `%${name}%`) }
  if (supertype) { sql += ' AND c.supertype = ?'; params.push(supertype) }
  if (set)       { sql += ' AND (c.set_id LIKE ? OR c.set_name LIKE ?)'; params.push(`%${set}%`, `%${set}%`) }
  if (era === '__none__') { sql += ' AND c.era_block_id IS NULL' }
  else if (era) { sql += ' AND eb.slug = ?'; params.push(era) }
  if (formatId) {
    const fmt = await c.env.DB.prepare('SELECT era_id, regulation_marks, legal_set_ids FROM formats WHERE id = ?').bind(Number(formatId)).first() as any
    if (fmt) {
      if (fmt.legal_set_ids) {
        sql += ' AND (c.set_id IN (SELECT value FROM json_each(?)) OR c.is_custom = 1)'
        params.push(fmt.legal_set_ids)
      } else if (fmt.regulation_marks) {
        sql += ' AND (c.regulation_mark IN (SELECT value FROM json_each(?)) OR c.is_custom = 1)'
        params.push(fmt.regulation_marks)
      } else if (fmt.era_id) {
        sql += ' AND (c.era_block_id = ? OR c.is_custom = 1)'
        params.push(fmt.era_id)
      }
    }
  }
  sql += ' ORDER BY c.name LIMIT 200'
  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ data: results })
})

app.post('/api/admin/cards', async c => {
  const body = await c.req.json<any>()
  const { meta } = await c.env.DB.prepare(`
    INSERT INTO cards (name, display_name, supertype, energy_type, era_block_id,
                       set_id, set_name, set_series, pokemontcg_id, image_ext_url, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.name, body.display_name ?? null, body.supertype,
    body.energy_type ?? null, body.era_block_id ?? null,
    body.set_id ?? null, body.set_name ?? null, body.set_series ?? null,
    body.pokemontcg_id ?? null, body.image_ext_url ?? null,
    body.is_custom ?? 1,
  ).run()
  return c.json({ success: true, id: meta.last_row_id })
})

app.post('/api/admin/cards/import', async c => {
  const body = await c.req.json<{ pokemontcg_id: string; era_block_id?: number }>()
  const url  = `https://api.pokemontcg.io/v2/cards/${body.pokemontcg_id}?select=id,name,images,supertype,types,set,regulationMark`
  const res  = await fetch(url, { headers: { 'X-Api-Key': c.env.POKEMONTCG_API_KEY ?? '' } })
  const json = await res.json<{ data?: any }>()
  const card  = json.data
  if (!card) return c.json({ success: false, error: 'Card not found' }, 404)

  const { meta } = await c.env.DB.prepare(`
    INSERT INTO cards (pokemontcg_id, name, supertype, energy_type, era_block_id,
                       image_ext_url, set_id, set_name, set_series, regulation_mark, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT (pokemontcg_id) DO UPDATE SET
      image_ext_url   = excluded.image_ext_url,
      set_id          = excluded.set_id,
      set_name        = excluded.set_name,
      set_series      = excluded.set_series,
      regulation_mark = excluded.regulation_mark
  `).bind(
    card.id, card.name, card.supertype,
    card.types?.[0] ?? null, body.era_block_id ?? null,
    card.images?.small ?? null,
    card.set?.id ?? null, card.set?.name ?? null, card.set?.series ?? null,
    card.regulationMark ?? null,
  ).run()
  return c.json({ success: true, id: meta.last_row_id })
})

app.post('/api/admin/cards/bulk-sync', async c => {
  const ERA_SERIES: Record<string, string> = {
    hgss: 'HeartGold & SoulSilver', bw: 'Black & White', xy: 'XY',
    sm: 'Sun & Moon', swsh: 'Sword & Shield', sv: 'Scarlet & Violet',
  }
  const { results: cards } = await c.env.DB.prepare(`
    SELECT c.id, c.name, eb.slug AS era_slug
    FROM cards c LEFT JOIN era_blocks eb ON eb.id = c.era_block_id
    WHERE c.image_ext_url IS NULL
  `).all()
  if (!cards.length) return c.json({ success: true, updated: 0, message: 'All cards already have images' })

  let updated = 0; const failed: string[] = []
  const BATCH = 8
  for (let i = 0; i < cards.length; i += BATCH) {
    await Promise.all(
      (cards as any[]).slice(i, i + BATCH).map(async (card) => {
        try {
          const q   = `name:"${card.name.replace(/"/g, '\\"')}"`
          const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=20&select=id,name,images,set`
          const res  = await fetch(url, { headers: { 'X-Api-Key': c.env.POKEMONTCG_API_KEY ?? '' } })
          const json = await res.json<{ data?: any[] }>()
          const hits  = json.data ?? []
          if (!hits.length) { failed.push(`${card.name}: no results`); return }
          const series = ERA_SERIES[card.era_slug as string]
          const best   = (series && hits.find((h: any) => h.set?.series === series)) ?? hits[0]
          await c.env.DB.prepare(
            'UPDATE cards SET pokemontcg_id = ?, image_ext_url = ?, set_id = ?, set_name = ?, set_series = ? WHERE id = ?'
          ).bind(best.id, best.images.small, best.set?.id ?? null, best.set?.name ?? null, best.set?.series ?? null, card.id).run()
          updated++
        } catch { failed.push(card.name) }
      })
    )
  }
  return c.json({ success: true, updated, total: cards.length, failed })
})

app.patch('/api/admin/cards/:id', async c => {
  const id   = Number(c.req.param('id'))
  const body = await c.req.json<any>()
  const fields = ['name', 'display_name', 'supertype', 'energy_type', 'era_block_id',
                  'set_id', 'set_name', 'set_series', 'pokemontcg_id', 'image_ext_url', 'image_r2_key', 'is_custom']
  const sets: string[] = []; const params: any[] = []
  for (const f of fields) { if (f in body) { sets.push(`${f} = ?`); params.push(body[f] ?? null) } }
  if (sets.length) { params.push(id); await c.env.DB.prepare(`UPDATE cards SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run() }
  return c.json({ success: true })
})

app.get('/api/admin/cards/:id/decks', async c => {
  const id = Number(c.req.param('id'))
  const { results } = await c.env.DB.prepare(`
    SELECT DISTINCT d.id, d.name, d.slug
    FROM deck_cards dc JOIN decks d ON d.id = dc.deck_id
    WHERE dc.card_id = ?
    ORDER BY d.name
  `).bind(id).all()
  return c.json({ data: results })
})

app.delete('/api/admin/cards/:id', async c => {
  const id = Number(c.req.param('id'))
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM deck_cards WHERE card_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(id),
  ])
  return c.json({ success: true })
})

app.post('/api/admin/cards/:id/image', async c => {
  const id  = Number(c.req.param('id'))
  const key = `cards/${id}`
  await c.env.STORAGE.put(key, await c.req.arrayBuffer(), { httpMetadata: { contentType: c.req.header('content-type') ?? 'image/jpeg' } })
  await c.env.DB.prepare('UPDATE cards SET image_r2_key = ? WHERE id = ?').bind(key, id).run()
  return c.json({ success: true, key })
})

// ── Decks ──────────────────────────────────────────────────────────────

app.post('/api/admin/decks', async c => {
  const body = await c.req.json<any>()
  const { meta } = await c.env.DB.prepare(`
    INSERT INTO decks (name, slug, era_block_id, format_id, energy_type, intended_size, primer_md)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(body.name, body.slug, body.era_block_id, body.format_id, body.energy_type, body.intended_size ?? 60, body.primer_md ?? null).run()
  return c.json({ success: true, id: meta.last_row_id })
})

app.patch('/api/admin/decks/:id', async c => {
  const id   = Number(c.req.param('id'))
  const body = await c.req.json<any>()
  const fields = ['name', 'slug', 'era_block_id', 'format_id', 'energy_type', 'energy_types', 'intended_size', 'primer_md', 'manual_status']
  const sets: string[] = []; const params: any[] = []
  for (const f of fields) {
    if (f in body) {
      sets.push(`${f} = ?`)
      params.push(f === 'energy_types' ? (Array.isArray(body[f]) ? JSON.stringify(body[f]) : null) : (body[f] ?? null))
    }
  }
  sets.push('updated_at = unixepoch()'); params.push(id)
  await c.env.DB.prepare(`UPDATE decks SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  return c.json({ success: true })
})

app.delete('/api/admin/decks/:id', async c => {
  await c.env.DB.prepare('DELETE FROM decks WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return c.json({ success: true })
})

app.post('/api/admin/decks/:id/cover', async c => {
  const deckId = Number(c.req.param('id'))
  const key    = `covers/${deckId}`
  await c.env.STORAGE.put(key, await c.req.arrayBuffer(), { httpMetadata: { contentType: c.req.header('content-type') ?? 'image/jpeg' } })
  await c.env.DB.prepare('UPDATE decks SET cover_r2_key = ? WHERE id = ?').bind(key, deckId).run()
  return c.json({ success: true, key })
})

// ── Deck cards ─────────────────────────────────────────────────────────

app.post('/api/admin/decks/:id/cards', async c => {
  const deckId = Number(c.req.param('id'))
  const body   = await c.req.json<{ card_id: number; qty_real: number; qty_proxy: number; qty_missing: number; qty_ordered: number; fan_slot?: number | null }>()
  const intended = body.qty_real + body.qty_proxy + body.qty_missing + body.qty_ordered

  // Per-card max 4 guardrail (Energy cards exempt)
  const cardRow = await c.env.DB.prepare('SELECT supertype FROM cards WHERE id = ?').bind(body.card_id).first() as any
  if (cardRow?.supertype !== 'Energy' && intended > 4) {
    return c.json({ success: false, error: `Cannot add more than 4 copies of a single card (attempted: ${intended})` }, 422)
  }

  // Size guardrail: check current total (excluding this card if it already exists)
  const [deckRow, existingRow] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT intended_size FROM decks WHERE id = ?').bind(deckId),
    c.env.DB.prepare('SELECT COALESCE(SUM(intended_quantity),0) AS total FROM deck_cards WHERE deck_id = ?').bind(deckId),
  ])
  const deck     = deckRow.results[0] as any
  const existing = existingRow.results[0] as any
  const currentCard = await c.env.DB.prepare('SELECT intended_quantity FROM deck_cards WHERE deck_id = ? AND card_id = ?').bind(deckId, body.card_id).first() as any
  const currentCardQty = currentCard?.intended_quantity ?? 0
  const newTotal = (existing.total - currentCardQty) + intended

  if (newTotal > deck.intended_size) {
    return c.json({ success: false, error: `Adding this card would bring the deck to ${newTotal} cards (limit: ${deck.intended_size})` }, 422)
  }

  await c.env.DB.prepare(`
    INSERT INTO deck_cards (deck_id, card_id, intended_quantity, qty_real, qty_proxy, qty_missing, qty_ordered, fan_slot)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (deck_id, card_id) DO UPDATE SET
      intended_quantity = excluded.intended_quantity,
      qty_real    = excluded.qty_real,
      qty_proxy   = excluded.qty_proxy,
      qty_missing = excluded.qty_missing,
      qty_ordered = excluded.qty_ordered,
      fan_slot    = excluded.fan_slot
  `).bind(deckId, body.card_id, intended, body.qty_real, body.qty_proxy, body.qty_missing, body.qty_ordered, body.fan_slot ?? null).run()
  return c.json({ success: true })
})

app.patch('/api/admin/decks/:id/cards/:deckCardId', async c => {
  const deckId     = Number(c.req.param('id'))
  const deckCardId = Number(c.req.param('deckCardId'))
  const body       = await c.req.json<{ qty_real?: number; qty_proxy?: number; qty_missing?: number; qty_ordered?: number; fan_slot?: number | null; card_id?: number }>()

  const sets: string[] = []; const params: any[] = []

  if (body.qty_real !== undefined || body.qty_proxy !== undefined || body.qty_missing !== undefined || body.qty_ordered !== undefined) {
    const qty_real    = body.qty_real    ?? 0
    const qty_proxy   = body.qty_proxy   ?? 0
    const qty_missing = body.qty_missing ?? 0
    const qty_ordered = body.qty_ordered ?? 0
    const intended    = qty_real + qty_proxy + qty_missing + qty_ordered

    // Per-card max 4 guardrail (Energy cards exempt)
    const cardTypeRow = await c.env.DB.prepare(
      'SELECT c.supertype FROM deck_cards dc JOIN cards c ON c.id = dc.card_id WHERE dc.id = ?'
    ).bind(deckCardId).first() as any
    if (cardTypeRow?.supertype !== 'Energy' && intended > 4) {
      return c.json({ success: false, error: `Cannot have more than 4 copies of a single card (attempted: ${intended})` }, 422)
    }

    // Size guardrail
    const [deckRow, totalRow, selfRow] = await c.env.DB.batch([
      c.env.DB.prepare('SELECT intended_size FROM decks WHERE id = ?').bind(deckId),
      c.env.DB.prepare('SELECT COALESCE(SUM(intended_quantity),0) AS total FROM deck_cards WHERE deck_id = ?').bind(deckId),
      c.env.DB.prepare('SELECT intended_quantity FROM deck_cards WHERE id = ?').bind(deckCardId),
    ])
    const deckData = deckRow.results[0] as any
    const totalData = totalRow.results[0] as any
    const selfData  = selfRow.results[0] as any
    const newTotal  = (totalData.total - (selfData?.intended_quantity ?? 0)) + intended
    if (newTotal > deckData.intended_size) {
      return c.json({ success: false, error: `Deck would have ${newTotal} cards (limit: ${deckData.intended_size})` }, 422)
    }

    sets.push('intended_quantity = ?', 'qty_real = ?', 'qty_proxy = ?', 'qty_missing = ?', 'qty_ordered = ?')
    params.push(intended, qty_real, qty_proxy, qty_missing, qty_ordered)
  }

  if ('fan_slot' in body) {
    sets.push('fan_slot = ?')
    params.push(body.fan_slot ?? null)
  }

  if (body.card_id !== undefined) {
    const conflict = await c.env.DB.prepare(
      'SELECT id FROM deck_cards WHERE deck_id = ? AND card_id = ? AND id != ?'
    ).bind(deckId, body.card_id, deckCardId).first()
    if (conflict) {
      return c.json({ success: false, error: 'That card is already in this deck' }, 422)
    }
    sets.push('card_id = ?')
    params.push(body.card_id)
  }

  if (sets.length) {
    params.push(deckCardId)
    await c.env.DB.prepare(`UPDATE deck_cards SET ${sets.join(', ')} WHERE id = ?`).bind(...params).run()
  }
  return c.json({ success: true })
})

app.delete('/api/admin/decks/:id/cards/:deckCardId', async c => {
  await c.env.DB.prepare('DELETE FROM deck_cards WHERE id = ?').bind(Number(c.req.param('deckCardId'))).run()
  return c.json({ success: true })
})

export default app
