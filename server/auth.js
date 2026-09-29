import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getDb } from './db.js'

export const JWT_SECRET = process.env.JWT_SECRET || 'pulse-dev-secret-change-me'
const TOKEN_TTL = '12h'
const HASH_ROUNDS = 8

export const hashPassword = (plain) => bcrypt.hashSync(String(plain), HASH_ROUNDS)

/** Public shape of a user (never the hash). */
export const publicUser = (u) => ({
  id: u._id, email: u.email, name: u.name, color: u.color || '#4f6cf7',
  apps: u.apps || [], roles: u.roles || {}, doctorId: u.doctorId || null, designation: u.designation || '',
})

export async function login(email, password) {
  const users = getDb().collection('users')
  const user = await users.findOne({ email: String(email || '').trim().toLowerCase() })
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  if (user.active === false) throw Object.assign(new Error('This account has been deactivated.'), { status: 403 })
  const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL })
  return { token, user: publicUser(user) }
}

/** Reads the bearer token if present; never rejects. */
export function authOptional(req, _res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : req.query.token
  if (token) {
    try { req.auth = jwt.verify(token, JWT_SECRET) } catch { req.auth = null }
  }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.auth) return res.status(401).json({ error: 'Login required' })
  next()
}

/** Keep the `users` collection in step with the staff directory:
    every staff record can sign in to /staff (and /hr for managers/HR). */
export async function syncUsersFromStaff(staffList) {
  const users = getDb().collection('users')
  const existing = await users.find({ _id: { $in: staffList.map((s) => s.id) } }).toArray()
  const byId = Object.fromEntries(existing.map((u) => [u._id, u]))
  const ops = staffList.filter((s) => s.email).map((s) => {
    const prev = byId[s.id]
    const apps = new Set(['staff', ...(prev?.apps || [])])
    if (s.role === 'hr' || s.role === 'manager') apps.add('hr')
    const roles = { ...(prev?.roles || {}), staff: s.role || 'staff', ...(apps.has('hr') ? { hr: s.role } : {}) }
    const passwordChanged = !prev || (s.password && !bcrypt.compareSync(String(s.password), prev.passwordHash))
    const set = {
      email: String(s.email).toLowerCase(), name: s.name, color: s.color, apps: [...apps], roles,
      doctorId: s.doctorId || null, designation: s.designation || '', active: s.active !== false,
      ...(passwordChanged && s.password ? { passwordHash: hashPassword(s.password) } : {}),
    }
    return { updateOne: { filter: { _id: s.id }, update: { $set: set }, upsert: true } }
  })
  if (ops.length) await users.bulkWrite(ops, { ordered: false })
}
