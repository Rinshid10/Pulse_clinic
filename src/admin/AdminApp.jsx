import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import AppRoutes from './routes/AppRoutes'
import './styles/admin.css'

/* Admin panel root — mounted at /admin/* by the top-level router.
   Fully self-contained: own providers, routes, layout and styles. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
