import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/pharmacy/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/pharmacy" replace />
  return children
}
