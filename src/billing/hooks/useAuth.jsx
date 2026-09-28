import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.currentUser())

  const login = (creds) => {
    const u = authService.login(creds)
    setUser(u)
    return u
  }
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
