/* staff console auth — POST /api/auth/login, session kept in localStorage.
   If the API is unreachable the seeded demo accounts below still work offline. */
import { api } from '../../services/api'
import { getStaff } from '../../services/staffStore'
import { STAFF_ROLES } from '../../data/staff'
const SESSION_KEY = 'pulse-staff-session'
const APP = 'staff'

export const ROLE_LABEL = STAFF_ROLES

const FALLBACK_USERS = () => getStaff().filter((s) => s.active !== false)

const toSession = (u, token) => ({ id: u.id, name: u.name, email: u.email, role: u.roles?.[APP] || u.role, color: u.color, doctorId: u.doctorId || null, designation: u.designation || '', token: token || null })

export async function login({ email, password }) {
  const e = String(email || '').trim().toLowerCase()
  let session
  if (api.isOnline()) {
    const { token, user } = await api.login(e, password)
    if (!user.apps?.includes(APP)) throw new Error('This account has no access to this console')
    session = toSession(user, token)
  } else {
    const u = FALLBACK_USERS().find((x) => x.email === e && x.password === password)
    if (!u) throw new Error('Invalid email or password')
    session = toSession({ ...u, roles: { [APP]: u.role } })
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  api.refresh()
  return session
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export const isManager = (user) => user?.role === 'manager' || user?.role === 'hr'

export const DEMO_USERS = [
  { email: 'priya@pulse.com', label: 'Priya Nair — Senior Nurse' },
  { email: 'sarah@pulse.com', label: 'Dr. Sarah Chen — Cardiologist' },
  { email: 'manager@pulse.com', label: 'Marcus Lee — Manager' },
  { email: 'hr@pulse.com', label: 'Amelia Hart — HR' },
]
