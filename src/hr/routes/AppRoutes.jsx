import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import HrLayout from '../layouts/HrLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Employees from '../pages/Employees'
import Approvals from '../pages/Approvals'
import Roster from '../pages/Roster'
import Attendance from '../pages/Attendance'
import Concerns from '../pages/Concerns'
import Payroll from '../pages/Payroll'
import LeavePolicy from '../pages/LeavePolicy'
import Announcements from '../pages/Announcements'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><HrLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="roster" element={<Roster />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="concerns" element={<Concerns />} />
        <Route path="payroll" element={<ProtectedRoute roles={['hr']}><Payroll /></ProtectedRoute>} />
        <Route path="leave-policy" element={<ProtectedRoute roles={['hr']}><LeavePolicy /></ProtectedRoute>} />
        <Route path="announcements" element={<Announcements />} />
      </Route>
    </Routes>
  )
}
