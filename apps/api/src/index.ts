import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
  DB: D1Database
  STORAGE: R2Bucket
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({ origin: ['http://localhost:5173', 'https://deck-archive.pages.dev'] }))

// ── Public routes ──────────────────────────────────────
app.get('/api/formats',     c => c.json({ data: [] }))
app.get('/api/formats/:slug', c => c.json({ data: null }))
app.get('/api/eras/:id',    c => c.json({ data: null }))
app.get('/api/era-blocks/:id', c => c.json({ data: null }))

app.get('/api/decks', async c => {
  const format = c.req.query('format')
  const era    = c.req.query('era')
  // TODO: query D1
  return c.json({ data: [], meta: { format, era } })
})

app.get('/api/decks/:slug', async c => {
  const { slug } = c.req.param()
  // TODO: query D1
  return c.json({ data: null, slug })
})

app.get('/api/decks/:slug/export', c => {
  const format = c.req.query('format') ?? 'ptcgo'
  return c.text('', 200, { 'Content-Type': 'text/plain' })
})

app.get('/api/cards/:id',  c => c.json({ data: null }))

app.get('/api/stats/overview', async c => {
  return c.json({
    data: {
      totalDecks:   0,
      totalReal:    0,
      totalProxy:   0,
      totalMissing: 0,
      totalOrdered: 0,
    },
  })
})

app.get('/api/stats/buylist', async c => {
  const format        = c.req.query('format')
  const era           = c.req.query('era')
  const supertype     = c.req.query('supertype')
  const includeCustom = c.req.query('include_custom') === 'true'
  // TODO: query D1 with GROUP BY
  return c.json({ data: [], meta: { format, era, supertype, includeCustom } })
})

app.get('/api/search', async c => {
  const q = c.req.query('q') ?? ''
  return c.json({ data: { decks: [], cards: [], eras: [] }, q })
})

// ── Admin routes (Cloudflare Access protects /api/admin/*) ─
app.get('/api/admin/pokemontcg/search', async c => {
  const q   = c.req.query('q') ?? ''
  const set = c.req.query('set') ?? ''
  // Proxy to pokemontcg.io
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}${set ? ` set.id:${set}` : ''}`
  const res = await fetch(url, {
    headers: { 'X-Api-Key': c.env?.POKEMONTCG_API_KEY ?? '' },
  })
  const json = await res.json()
  return c.json(json)
})

app.post('/api/admin/cards/import', async c => {
  const body = await c.req.json<{ pokemontcg_id: string; era_id: number }>()
  // TODO: fetch from pokemontcg.io and insert into D1
  return c.json({ success: true, body })
})

app.post('/api/admin/formats',        c => c.json({ success: true }))
app.patch('/api/admin/formats/:id',   c => c.json({ success: true }))
app.delete('/api/admin/formats/:id',  c => c.json({ success: true }))

app.post('/api/admin/era-blocks',       c => c.json({ success: true }))
app.patch('/api/admin/era-blocks/:id',  c => c.json({ success: true }))
app.delete('/api/admin/era-blocks/:id', c => c.json({ success: true }))

app.post('/api/admin/eras',       c => c.json({ success: true }))
app.patch('/api/admin/eras/:id',  c => c.json({ success: true }))
app.delete('/api/admin/eras/:id', c => c.json({ success: true }))

app.post('/api/admin/cards',       c => c.json({ success: true }))
app.patch('/api/admin/cards/:id',  c => c.json({ success: true }))
app.delete('/api/admin/cards/:id', c => c.json({ success: true }))

app.post('/api/admin/cards/:id/image', async c => {
  // TODO: stream body to R2
  return c.json({ success: true })
})

app.post('/api/admin/decks',       c => c.json({ success: true }))
app.patch('/api/admin/decks/:id',  c => c.json({ success: true }))
app.delete('/api/admin/decks/:id', c => c.json({ success: true }))

app.post('/api/admin/decks/:id/cards',                c => c.json({ success: true }))
app.patch('/api/admin/decks/:id/cards/:deckCardId',   c => c.json({ success: true }))
app.delete('/api/admin/decks/:id/cards/:deckCardId',  c => c.json({ success: true }))

app.post('/api/admin/decks/:id/cover', async c => {
  // TODO: stream to R2
  return c.json({ success: true })
})

export default app
