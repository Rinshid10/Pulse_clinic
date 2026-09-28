import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from '../admin/hooks/useToast'
import AppRoutes from './routes/AppRoutes'
import '../admin/styles/admin.css'
import './styles/staff.css'

/* Staff portal root — mounted at /staff/* by the top-level router.
   Reuses the admin design system (admin.css + generic components)
   with its own auth, routes, layout and data. */
export default function StaffApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
