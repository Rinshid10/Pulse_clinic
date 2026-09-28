import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Doctors from '../pages/Doctors'
import Availability from '../pages/Availability'
import Appointments from '../pages/Appointments'
import Patients from '../pages/Patients'
import Staff from '../pages/Staff'
import Analytics from '../pages/Analytics'
import ThemeSettings from '../pages/ThemeSettings'
import ContentSettings from '../pages/ContentSettings'
import Notifications from '../pages/Notifications'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="doctors" element={<ProtectedRoute roles={['admin', 'manager']}><Doctors /></ProtectedRoute>} />
        <Route path="availability" element={<Availability />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="staff" element={<ProtectedRoute roles={['admin', 'manager']}><Staff /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute roles={['admin', 'manager']}><Analytics /></ProtectedRoute>} />
        <Route path="theme" element={<ProtectedRoute roles={['admin']}><ThemeSettings /></ProtectedRoute>} />
        <Route path="content" element={<ProtectedRoute roles={['admin']}><ContentSettings /></ProtectedRoute>} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}
