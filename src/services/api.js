/* ============================================================
   API sync layer.

   The stores (clinicStore / staffStore / billingStore) stay synchronous:
   they read from an in-memory cache that is filled from GET /api/bootstrap
   at startup, and every write() is mirrored to localStorage (offline copy)
   and PUT to the server. Other devices are refreshed through SSE.
   ============================================================ */

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
export const CLIENT_ID = Math.random().toString(36).slice(2)

export const cache = new Map()
let online = false
let source = null
const pending = new Map() // key → value not yet accepted by the server
const timers = new Map()

const SESSION_KEYS = {
  '/admin': 'pulse-admin-session', '/staff': 'pulse-staff-session', '/hr': 'pulse-hr-session',
  '/billing': 'pulse-billing-session', '/pharmacy': 'pulse-pharmacy-session',
}

/** Token of the console the user is currently in, else any stored session. */
export function token() {
  const here = Object.keys(SESSION_KEYS).find((p) => location.pathname.startsWith(p))
  const keys = here ? [SESSION_KEYS[here], ...Object.values(SESSION_KEYS)] : Object.values(SESSION_KEYS)
  for (const k of keys) {
    try { const t = JSON.parse(localStorage.getItem(k))?.token; if (t) return t } catch { /* ignore */ }
  }
  return null
}

export async function request(path, { method = 'GET', body, timeout = 8000 } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const headers = { 'X-Client-Id': CLIENT_ID }
    const tk = token()
    if (tk) headers.Authorization = `Bearer ${tk}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
    return data
  } finally {
    clearTimeout(t)
  }
}

const toLocal = (key, value) => {
  try { localStorage.setItem(key, key === 'pulse-theme' ? String(value) : JSON.stringify(value)) } catch { /* quota / private mode */ }
}
const fromLocal = (key) => {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return undefined
    return key === 'pulse-theme' ? raw : JSON.parse(raw)
  } catch { return undefined }
}

/** Load everything the current user may read. Resolves true when the server answered. */
export async function bootstrap() {
  try {
    const data = await request('/bootstrap', { timeout: 4000 })
    Object.entries(data).forEach(([k, v]) => { cache.set(k, v); toLocal(k, v) })
    online = true
    subscribeServer()
    flushPending()
  } catch (e) {
    online = false
    console.warn('[pulse] API unreachable, running from the local copy:', e.message)
    window.dispatchEvent(new CustomEvent('pulse:offline'))
  }
  // Another tab changed localStorage → keep this tab's cache in step.
  window.addEventListener('storage', (e) => { if (e.key?.startsWith('pulse-') && !e.key.endsWith('-session')) { const v = fromLocal(e.key); if (v !== undefined) cache.set(e.key, v) } })
  return online
}

/** Re-fetch what the caller may read (after a login, the private keys become readable). */
export async function refresh() {
  try {
    const data = await request('/bootstrap', { timeout: 6000 })
    Object.entries(data).forEach(([k, v]) => { cache.set(k, v); toLocal(k, v) })
    online = true
    Object.keys(data).forEach((k) => window.dispatchEvent(new CustomEvent('pulse:store', { detail: { key: k } })))
  } catch { /* stay on the local copy */ }
}

/** Debounced write-through. Failed writes are kept and retried on the next sync. */
export function sync(key, value) {
  pending.set(key, value)
  clearTimeout(timers.get(key))
  timers.set(key, setTimeout(() => flushKey(key), 200))
}
async function flushKey(key) {
  if (!pending.has(key)) return
  const value = pending.get(key)
  try {
    await request(`/data/${key}`, { method: 'PUT', body: { value } })
    if (pending.get(key) === value) pending.delete(key)
    if (!online) { online = true; subscribeServer() }
  } catch (e) {
    if (e.status === 401 || e.status === 404) { pending.delete(key); return } // not allowed / unknown key: don't loop
    online = false
    window.dispatchEvent(new CustomEvent('pulse:offline'))
  }
}
const flushPending = () => [...pending.keys()].forEach((k) => flushKey(k))

/** Live updates from other devices/tabs through Server-Sent Events. */
function subscribeServer() {
  if (source || typeof EventSource === 'undefined') return
  try {
    source = new EventSource(`${API_URL}/events`)
    source.onmessage = async (ev) => {
      let msg
      try { msg = JSON.parse(ev.data) } catch { return }
      if (!msg?.key || msg.client === CLIENT_ID) return
      try {
        const { value } = await request(`/data/${msg.key}`)
        cache.set(msg.key, value)
        toLocal(msg.key, value)
        window.dispatchEvent(new CustomEvent('pulse:store', { detail: { key: msg.key } }))
      } catch { /* not readable for this user */ }
    }
    source.onerror = () => { source?.close(); source = null; setTimeout(subscribeServer, 5000) }
  } catch { source = null }
}

export async function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password }, timeout: 6000 })
}

export const isOnline = () => online
export const api = { bootstrap, refresh, sync, request, login, isOnline, cache, token }
export default api
