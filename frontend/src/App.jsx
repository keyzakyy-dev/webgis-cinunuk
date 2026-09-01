import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './components/Layout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import LocationDetail from './pages/LocationDetail'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLayers from './pages/admin/AdminLayers'
import AdminLayerEdit from './pages/admin/AdminLayerEdit'
import AdminFeatures from './pages/admin/AdminFeatures'
import AdminFeatureEdit from './pages/admin/AdminFeatureEdit'
import AdminImport from './pages/admin/AdminImport'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="layers" element={<AdminLayers />} />
            <Route path="layers/new" element={<AdminLayerEdit />} />
            <Route path="layers/:id" element={<AdminLayerEdit />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="features/new" element={<AdminFeatureEdit />} />
            <Route path="features/:id" element={<AdminFeatureEdit />} />
            <Route path="import" element={<AdminImport />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/peta" element={<MapPage />} />
            <Route path="/lokasi/:id" element={<LocationDetail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
