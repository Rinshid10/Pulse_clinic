import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from '../admin/hooks/useToast'
import AppRoutes from './routes/AppRoutes'
import '../admin/styles/admin.css'
import './styles/billing.css'

/* Billing & pharmacy desk — mounted at /billing/* by the top-level router.
   Own auth, routes and layout; reuses the admin design system. */
export default function BillingApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
