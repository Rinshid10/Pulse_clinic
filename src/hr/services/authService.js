/* hr console auth — POST /api/auth/login, session kept in localStorage.
   If the API is unreachable the seeded demo accounts below still work offline. */
import { api } from '../../services/api'
import { getStaff } from '../../services/staffStore'
import { STAFF_ROLES } from '../../data/staff'
export const HR_ROLES = ['hr', 'manager']
const SESSION_KEY = 'pulse-hr-session'
const APP = 'hr'

export const ROLE_LABEL = { ...STAFF_ROLES, hr: 'HR', manager: 'Manager' }

const FALLBACK_USERS = () => [{ id: 'u1', email: 'admin@pulse.com', password: 'admin123', name: 'Amelia Hart', role: 'hr', color: '#4f6cf7', designation: 'Administrator' }, ...getStaff().filter((s) => HR_ROLES.includes(s.role))]

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

export const DEMO_USERS = [
  { email: 'hr@pulse.com', password: 'staff123', label: 'Amelia Hart — HR Lead' },
  { email: 'manager@pulse.com', password: 'staff123', label: 'Marcus Lee — Operations Manager' },
]
