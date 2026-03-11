import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Pages/Dashboard'
import Configuration from './components/Pages/Site_Configuration/Configuration'
import Social from './components/Pages/Site_Configuration/Social'
import News from './components/Pages/News'
import RssFeeds from './components/Pages/RssFeeds'
import Profile from './components/Pages/Profile'
import Login from './components/Pages/Login'
import Categories from './components/Pages/Categories'
import ResetPassword from './components/Pages/ResetPassword'
import EmailTemplates from './components/Pages/EmailTemplates'
import StaticPages from './components/Pages/StaticPages'
import './App.css'

export type Page = 'dashboard' | 'news' | 'categories' | 'email-templates' | 'pages' | 'rss-feeds' | 'trending' | 'authors' | 'comments' | 'ads' | 'subscribers' | 'settings' | 'configuration' | 'social' | 'profile' | 'reset-password'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'))
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [adminName, setAdminName] = useState('Admin')
  const [adminImage, setAdminImage] = useState('')

  const API_BASE = 'http://localhost:5000'

  // Handle login — store token
  const handleLogin = (newToken: string) => {
    localStorage.setItem('adminToken', newToken)
    setToken(newToken)
  }

  // Handle logout — clear token
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setAdminName('Admin')
    setAdminImage('')
    setActivePage('dashboard')
  }

  // Verify token and fetch admin profile on mount / page change
  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE}/api/admin/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid — log out
          handleLogout()
          return null
        }
        return res.ok ? res.json() : null
      })
      .then(data => {
        if (data) {
          setAdminName(data.name || 'Admin')
          setAdminImage(data.imageUrl || '')
        }
      })
      .catch(err => console.error('Failed to verify admin:', err))
  }, [token, activePage])

  // If not authenticated, show login page
  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'configuration': return <Configuration />
      case 'social': return <Social />
      case 'news': return <News />
      case 'categories': return <Categories />
      case 'email-templates': return <EmailTemplates />
      case 'pages': return <StaticPages />
      case 'rss-feeds': return <RssFeeds />
      case 'profile': return <Profile />
      case 'reset-password': return <ResetPassword />
      default: return (
        <div className="coming-soon">
          <div className="coming-soon-icon">🚧</div>
          <h2>{activePage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          <p>This section is under construction.</p>
        </div>
      )
    }
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="main-area">
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="toggle-btn" onClick={() => setSidebarCollapsed(p => !p)} aria-label="Toggle sidebar">
              <span /><span /><span />
            </button>
            <nav className="breadcrumb">
              <span>Dashboard</span>
              <span className="bc-sep">›</span>
              <span className="bc-active">{activePage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </nav>
          </div>
          <div className="top-bar-right">
            <div className="admin-badge-container">
              <div className="admin-badge" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="admin-avatar">
                  {adminImage ? (
                    <img src={`${API_BASE}${adminImage}`} alt="Admin" />
                  ) : (
                    <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg" alt="Admin" />
                  )}
                </div>
                <span>{adminName}</span>
                <span className={`caret ${dropdownOpen ? 'rotated' : ''}`}>▾</span>
              </div>

              {dropdownOpen && (
                <div className="profile-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
                  <button className="dropdown-item" onClick={() => { setActivePage('profile'); setDropdownOpen(false) }}>
                    <span className="dropdown-icon">👤</span> Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { setActivePage('reset-password'); setDropdownOpen(false) }}>
                    <span className="dropdown-icon">🔒</span> Reset Password
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-text" onClick={handleLogout}>
                    <span className="dropdown-icon logout-icon">↪️</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default App
