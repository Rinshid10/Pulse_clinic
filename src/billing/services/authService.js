/* Billing desk auth — separate session from the admin console and staff portal. */
const SESSION_KEY = 'pulse-billing-session'

const USERS = [
  { id: 'bu1', email: 'admin@pulse.com',    password: 'admin123', name: 'Amelia Hart', role: 'admin',      color: '#4f6cf7' },
  { id: 'bu2', email: 'cashier@pulse.com',  password: 'admin123', name: 'Sofia Reyes', role: 'cashier',    color: '#f59e0b' },
  { id: 'bu3', email: 'pharmacy@pulse.com', password: 'admin123', name: 'Aisha Khan',  role: 'pharmacist', color: '#a855f7' },
]

export const ROLE_LABEL = { admin: 'Administrator', cashier: 'Billing desk', pharmacist: 'Pharmacist' }

export function login({ email, password }) {
  const user = USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color }
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

export const DEMO_USERS = USERS.map(({ email, role }) => ({ email, label: ROLE_LABEL[role] }))
