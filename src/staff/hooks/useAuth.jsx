import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'
import { useStore } from '../../admin/hooks/useStore'
import { getStaffMember } from '../../services/staffStore'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.currentUser())
  // Full, live staff record (profile edits, salary changes) for the logged-in user.
  const [me] = useStore(() => (user ? getStaffMember(user.id) : null), [user?.id])

  const login = async (creds) => {
    const u = await authService.login(creds)
    setUser(u)
    return u
  }
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isManager = authService.isManager(user)
  return <AuthCtx.Provider value={{ user, me, isManager, login, logout }}>{children}</AuthCtx.Provider>
}
