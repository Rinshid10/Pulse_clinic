import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/billing/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/billing" replace />
  return children
}
