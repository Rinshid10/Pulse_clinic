import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import BillingLayout from '../layouts/BillingLayout'
import Login from '../pages/Login'
import Overview from '../pages/Overview'
import Bills from '../pages/Bills'
import NewBill from '../pages/NewBill'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><BillingLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="new" element={<NewBill />} />
        <Route path="bills" element={<Bills />} />
        <Route path="*" element={<Navigate to="/billing" replace />} />
      </Route>
    </Routes>
  )
}
