/* HR console auth — HR and managers from the staff directory, plus the clinic admin. */
import { getStaff } from '../../services/staffStore'
import { STAFF_ROLES } from '../../data/staff'

const SESSION_KEY = 'pulse-hr-session'
const ADMIN = { id: 'hr-admin', email: 'admin@pulse.com', password: 'admin123', name: 'Amelia Hart', role: 'hr', color: '#4f6cf7', designation: 'Administrator' }

export const ROLE_LABEL = { ...STAFF_ROLES, hr: 'HR', manager: 'Manager' }
export const HR_ROLES = ['hr', 'manager']

const users = () => [ADMIN, ...getStaff().filter((s) => HR_ROLES.includes(s.role))]

export function login({ email, password }) {
  const user = users().find((u) => u.email === email.trim().toLowerCase() && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  if (user.active === false) throw new Error('This account has been deactivated.')
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color, designation: user.designation }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
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
