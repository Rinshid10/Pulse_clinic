import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'

// Admin panel is code-split: the customer site never downloads admin/charts code.
const AdminApp = lazy(() => import('./admin/AdminApp'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#f4f6fb' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e7ecf5', borderTopColor: '#4f6cf7', animation: 'adspin .8s linear infinite' }} />
                  <style>{'@keyframes adspin{to{transform:rotate(360deg)}}'}</style>
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
