/* Staff auth — users come from the staff store (email + password on the record).
   Session is plain JSON in localStorage, same as the admin console. */
import { KEYS, getStaff } from '../../services/staffStore'
import { STAFF_ROLES } from '../../data/staff'

export const ROLE_LABEL = STAFF_ROLES

export function login({ email, password }) {
  const user = getStaff().find((u) => u.email === email.trim().toLowerCase() && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  if (user.active === false) throw new Error('This account has been deactivated. Contact HR.')
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color, doctorId: user.doctorId || null }
  localStorage.setItem(KEYS.session, JSON.stringify(session))
  return session
}

export function logout() {
  localStorage.removeItem(KEYS.session)
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.session))
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
