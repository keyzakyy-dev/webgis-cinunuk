import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Marquee from './Marquee'
import './Layout.css'

export default function Layout({ children }) {
  const location = useLocation()
  const isMap = location.pathname === '/peta'

  useEffect(() => {
    if (location.pathname !== '/peta') window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="layout">
      <div className="layout__top">
        {!isMap && <Marquee />}
        <Header />
      </div>
      <main className="layout__main">
        <div key={location.pathname} className="page-enter">
          {children}
        </div>
      </main>
        {!isMap && <Footer />}
    </div>
  )
}
