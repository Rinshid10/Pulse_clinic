import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PharmacyLayout from '../layouts/PharmacyLayout'
import Login from '../pages/Login'
import Overview from '../pages/Overview'
import Sell from '../pages/Sell'
import MedicineBills from '../pages/MedicineBills'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><PharmacyLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="sell" element={<Sell />} />
        <Route path="medicine-bills" element={<MedicineBills />} />
        <Route path="*" element={<Navigate to="/pharmacy" replace />} />
      </Route>
    </Routes>
  )
}
