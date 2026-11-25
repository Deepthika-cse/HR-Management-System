import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import '../styles/Layout.css'

function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout