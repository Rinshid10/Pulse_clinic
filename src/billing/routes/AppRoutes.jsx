import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import BillingLayout from '../layouts/BillingLayout'
import Login from '../pages/Login'
import Overview from '../pages/Overview'
import Bills from '../pages/Bills'
import Pharmacy from '../pages/Pharmacy'
import MedicineBills from '../pages/MedicineBills'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><BillingLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="bills" element={<ProtectedRoute roles={['admin', 'cashier']}><Bills /></ProtectedRoute>} />
        <Route path="medicine-bills" element={<MedicineBills />} />
        <Route path="pharmacy" element={<ProtectedRoute roles={['admin', 'pharmacist']}><Pharmacy /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
