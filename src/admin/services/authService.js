/* Mock auth service. Replace with real API/JWT later.
   Three demo roles with different access levels. */

const SESSION_KEY = 'pulse-admin-session'

const USERS = [
  { id: 'u1', email: 'admin@pulse.com',        password: 'admin123', name: 'Amelia Hart',   role: 'admin',        color: '#4f6cf7' },
  { id: 'u2', email: 'manager@pulse.com',      password: 'admin123', name: 'Marcus Lee',    role: 'manager',      color: '#10c8a3' },
  { id: 'u3', email: 'reception@pulse.com',    password: 'admin123', name: 'Sofia Reyes',   role: 'receptionist', color: '#f59e0b' },
]

export const ROLE_LABEL = { admin: 'Administrator', manager: 'Manager', receptionist: 'Receptionist' }

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

export const DEMO_USERS = USERS.map(({ email, role }) => ({ email, role }))
