import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'

// Admin panel and staff portal are code-split: the customer site never downloads them.
const AdminApp = lazy(() => import('./admin/AdminApp'))
const StaffApp = lazy(() => import('./staff/StaffApp'))
const BillingApp = lazy(() => import('./billing/BillingApp'))
const HrApp = lazy(() => import('./hr/HrApp'))

const Loader = ({ color = '#4f6cf7' }) => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#f4f6fb' }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e7ecf5', borderTopColor: color, animation: 'adspin .8s linear infinite' }} />
    <style>{'@keyframes adspin{to{transform:rotate(360deg)}}'}</style>
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<Loader />}><AdminApp /></Suspense>} />
        <Route path="/staff/*" element={<Suspense fallback={<Loader />}><StaffApp /></Suspense>} />
        <Route path="/billing/*" element={<Suspense fallback={<Loader />}><BillingApp /></Suspense>} />
        <Route path="/hr/*" element={<Suspense fallback={<Loader />}><HrApp /></Suspense>} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
