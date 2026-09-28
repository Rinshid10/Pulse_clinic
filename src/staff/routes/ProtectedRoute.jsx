import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/staff/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/staff" replace />
  return children
}
