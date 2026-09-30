/* ============================================================
   Pulse Clinic API — Express + MongoDB.

   One collection per front-end storage key (see keys.js). The
   front-end keeps a local cache and PUTs a whole key when it
   changes; the server upserts by id, removes missing ids, and
   broadcasts the key over SSE so other devices refresh.
   Plain REST per collection is also exposed for future work.
   ============================================================ */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connect } from './db.js'
import { getDb } from './db.js'
import { COLLECTIONS, SETTINGS_KEYS, PUBLIC_READ, PUBLIC_WRITE, ALL_KEYS, collectionFor, keyFor, isSettingsKey } from './keys.js'
import { login, authOptional, requireAuth, publicUser, syncUsersFromStaff } from './auth.js'

const PORT = Number(process.env.PORT) || 4000
const ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim())

const app = express()
app.use(cors({ origin: (origin, cb) => cb(null, !origin || ORIGINS.includes(origin) || ORIGINS.includes('*')), credentials: false }))
app.use(express.json({ limit: '10mb' }))
app.use(authOptional)
/* On a serverless host there is no startup step, so connect on first request. */
app.use((_req, res, next) => connect().then(() => next(), (e) => res.status(503).json({ error: `Database unavailable: ${e.message}` })))

/* ---------- SSE hub ---------- */
const clients = new Set()
const broadcast = (key, from) => {
  const msg = `data: ${JSON.stringify({ key, client: from || null, at: Date.now() })}\n\n`
  for (const res of clients) res.write(msg)
}
app.get('/api/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  res.flushHeaders()
  res.write('data: {"hello":true}\n\n')
  clients.add(res)
  const ping = setInterval(() => res.write(': ping\n\n'), 25000)
  req.on('close', () => { clearInterval(ping); clients.delete(res) })
})

/* ---------- helpers ---------- */
const strip = ({ _id, _order, ...rest }) => rest
const readKey = async (key) => {
  const db = getDb()
  if (isSettingsKey(key)) {
    const doc = await db.collection('settings').findOne({ _id: key })
    return doc ? doc.value : null
  }
  const col = collectionFor(key)
  const docs = await db.collection(col).find({}).sort({ _order: 1 }).toArray()
  return docs.map(strip)
}
const writeKey = async (key, value) => {
  const db = getDb()
  if (isSettingsKey(key)) {
    await db.collection('settings').replaceOne({ _id: key }, { _id: key, value }, { upsert: true })
    return value
  }
  if (!Array.isArray(value)) throw Object.assign(new Error(`${key} must be an array`), { status: 400 })
  const col = db.collection(collectionFor(key))
  const items = value.filter((v) => v && v.id != null)
  const ids = items.map((v) => String(v.id))
  const ops = items.map((v, i) => ({ replaceOne: { filter: { _id: String(v.id) }, replacement: { ...v, _id: String(v.id), _order: i }, upsert: true } }))
  if (ops.length) await col.bulkWrite(ops, { ordered: false })
  await col.deleteMany({ _id: { $nin: ids } })
  if (key === 'pulse-staff') await syncUsersFromStaff(items)
  return items
}
const canRead = (req, key) => PUBLIC_READ.includes(key) || !!req.auth
const canWrite = (req, key) => PUBLIC_WRITE.includes(key) || !!req.auth
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(e.status || 500).json({ error: e.message }))

app.get('/api/health', (_req, res) => res.json({ ok: true, collections: Object.values(COLLECTIONS), settings: SETTINGS_KEYS }))

/* ---------- auth ---------- */
app.post('/api/auth/login', wrap(async (req, res) => res.json(await login(req.body?.email, req.body?.password))))
app.get('/api/auth/me', requireAuth, wrap(async (req, res) => {
  const u = await getDb().collection('users').findOne({ _id: req.auth.sub })
  if (!u) return res.status(404).json({ error: 'User not found' })
  res.json(publicUser(u))
}))

/* ---------- bootstrap: everything the caller may read, in one go ---------- */
app.get('/api/bootstrap', wrap(async (req, res) => {
  const out = {}
  for (const key of ALL_KEYS) {
    if (!canRead(req, key)) continue
    const v = await readKey(key)
    if (v != null) out[key] = v
  }
  res.json(out)
}))

/* ---------- key-level sync ---------- */
app.get('/api/data/:key', wrap(async (req, res) => {
  const { key } = req.params
  if (!ALL_KEYS.includes(key)) return res.status(404).json({ error: 'Unknown key' })
  if (!canRead(req, key)) return res.status(401).json({ error: 'Login required' })
  res.json({ key, value: await readKey(key) })
}))
app.put('/api/data/:key', wrap(async (req, res) => {
  const { key } = req.params
  if (!ALL_KEYS.includes(key)) return res.status(404).json({ error: 'Unknown key' })
  if (!canWrite(req, key)) return res.status(401).json({ error: 'Login required' })
  const value = await writeKey(key, req.body?.value)
  broadcast(key, req.headers['x-client-id'])
  res.json({ key, value })
}))

/* ---------- plain REST per collection (for future integrations) ---------- */
app.get('/api/:collection', wrap(async (req, res) => {
  const key = keyFor(req.params.collection)
  if (!key) return res.status(404).json({ error: 'Unknown collection' })
  if (!canRead(req, key)) return res.status(401).json({ error: 'Login required' })
  res.json(await readKey(key))
}))
app.get('/api/:collection/:id', wrap(async (req, res) => {
  const key = keyFor(req.params.collection)
  if (!key) return res.status(404).json({ error: 'Unknown collection' })
  if (!canRead(req, key)) return res.status(401).json({ error: 'Login required' })
  const doc = await getDb().collection(req.params.collection).findOne({ _id: req.params.id })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(strip(doc))
}))
app.post('/api/:collection', wrap(async (req, res) => {
  const key = keyFor(req.params.collection)
  if (!key) return res.status(404).json({ error: 'Unknown collection' })
  if (!canWrite(req, key)) return res.status(401).json({ error: 'Login required' })
  const body = req.body || {}
  const id = String(body.id || `${req.params.collection.slice(0, 2)}-${Date.now()}-${Math.floor(Math.random() * 100000)}`)
  const col = getDb().collection(req.params.collection)
  const count = await col.countDocuments()
  await col.insertOne({ ...body, id, _id: id, _order: count })
  if (key === 'pulse-staff') await syncUsersFromStaff([{ ...body, id }])
  broadcast(key, req.headers['x-client-id'])
  res.status(201).json({ ...body, id })
}))
app.patch('/api/:collection/:id', wrap(async (req, res) => {
  const key = keyFor(req.params.collection)
  if (!key) return res.status(404).json({ error: 'Unknown collection' })
  if (!canWrite(req, key)) return res.status(401).json({ error: 'Login required' })
  const col = getDb().collection(req.params.collection)
  const { _id, _order, id, ...patch } = req.body || {}
  const r = await col.findOneAndUpdate({ _id: req.params.id }, { $set: patch }, { returnDocument: 'after' })
  if (!r) return res.status(404).json({ error: 'Not found' })
  if (key === 'pulse-staff') await syncUsersFromStaff([strip(r)])
  broadcast(key, req.headers['x-client-id'])
  res.json(strip(r))
}))
app.delete('/api/:collection/:id', wrap(async (req, res) => {
  const key = keyFor(req.params.collection)
  if (!key) return res.status(404).json({ error: 'Unknown collection' })
  if (!canWrite(req, key)) return res.status(401).json({ error: 'Login required' })
  const r = await getDb().collection(req.params.collection).deleteOne({ _id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  broadcast(key, req.headers['x-client-id'])
  res.json({ ok: true })
}))

/* Vercel imports the app and serves it as a function; everywhere else we listen. */
if (!process.env.VERCEL) {
  connect()
    .then(() => app.listen(PORT, () => console.log(`Pulse API listening on http://localhost:${PORT}  (db: ${process.env.DB_NAME || 'pulse_clinic'})`)))
    .catch((e) => { console.error('Could not connect to MongoDB:', e.message); process.exit(1) })
}

export default app
