import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import StaffLayout from '../layouts/StaffLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Leave from '../pages/Leave'
import Roster from '../pages/Roster'
import Overtime from '../pages/Overtime'
import Salary from '../pages/Salary'
import Concerns from '../pages/Concerns'
import Profile from '../pages/Profile'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><StaffLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="leave" element={<Leave />} />
        <Route path="roster" element={<Roster />} />
        <Route path="overtime" element={<Overtime />} />
        <Route path="salary" element={<Salary />} />
        <Route path="concerns" element={<Concerns />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Route>
    </Routes>
  )
}
