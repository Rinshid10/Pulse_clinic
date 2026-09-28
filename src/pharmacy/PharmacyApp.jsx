import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from '../admin/hooks/useToast'
import AppRoutes from './routes/AppRoutes'
import { useWebsiteTheme } from '../hooks/useWebsiteTheme'
import '../admin/styles/admin.css'
import './styles/pharmacy.css'

/* Pharmacy desk — mounted at /pharmacy/* by the top-level router.
   Own auth, routes and layout; reuses the admin design system. */
export default function PharmacyApp() {
  useWebsiteTheme()
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
