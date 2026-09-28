import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from '../admin/hooks/useToast'
import AppRoutes from './routes/AppRoutes'
import { useWebsiteTheme } from '../hooks/useWebsiteTheme'
import '../admin/styles/admin.css'
import '../staff/styles/staff.css'
import './styles/hr.css'

/* HR console — mounted at /hr/* by the top-level router.
   Own auth, routes and layout; shares the staff store with /staff and /admin. */
export default function HrApp() {
  useWebsiteTheme()
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
