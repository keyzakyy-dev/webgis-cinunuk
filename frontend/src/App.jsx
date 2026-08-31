import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import LocationDetail from './pages/LocationDetail'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/peta" element={<MapPage />} />
          <Route path="/lokasi/:id" element={<LocationDetail />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
