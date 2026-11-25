import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/Sidebar.css'

function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { member, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  async function onLogout() {
    await signOut()
    navigate('/auth')
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: 'bi-house',
      path: '/home',
      isActive: location.pathname === '/home'
    },
    {
      name: 'Employees',
      icon: 'bi-person-badge',
      path: '/employees',
      isActive: location.pathname.startsWith('/employees')
    },
    {
      name: 'Projects',
      icon: 'bi-folder',
      path: '/projects',
      isActive: location.pathname.startsWith('/projects')
    },
    {
      name: 'Team',
      icon: 'bi-people',
      path: '/team',
      isActive: location.pathname === '/team'
    },
    {
      name: 'Settings',
      icon: 'bi-gear',
      path: '/settings',
      isActive: location.pathname === '/settings'
    },
    {
      name: 'Onboarding',
      icon: 'bi-clipboard-check',
      path: '/onboarding-monitor',
      isActive: location.pathname === '/onboarding-monitor'
    },
    {
      name: 'Compliance Alerts',
      icon: 'bi-bell',
      path: '/alerts',
      isActive: location.pathname === '/alerts'
    },
    {
      name: 'Compliance',
      icon: 'bi-shield-check',
      path: '/compliance-dashboard',
      isActive: location.pathname === '/compliance-dashboard'
    }
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="bi bi-hexagon-fill"></i>
          {!collapsed && <span>Hackathon</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <button
                className={`sidebar-nav-item ${item.isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.name : ''}
              >
                <i className={`bi ${item.icon}`}></i>
                {!collapsed && <span>{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="sidebar-user" ref={userMenuRef}>
        <button
          className={`sidebar-user-btn ${userMenuOpen ? 'active' : ''}`}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          title={collapsed ? member?.name || 'User menu' : ''}
        >
          <div className="sidebar-user-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{member?.name || '--'}</div>
              <div className="sidebar-user-email">{member?.email || '--'}</div>
            </div>
          )}
          {!collapsed && <i className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'}`}></i>}
        </button>

        {userMenuOpen && !collapsed && (
          <div className="sidebar-user-menu">
            <button className="sidebar-user-menu-item" onClick={() => navigate('/profile')}>
              <i className="bi bi-person"></i>
              <span>Profile</span>
            </button>
            <button className="sidebar-user-menu-item" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar