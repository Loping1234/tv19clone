import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Pages/Dashboard'
import Configuration from './components/Pages/Site_Configuration/Configuration'
import Social from './components/Pages/Site_Configuration/Social'
import News from './components/Pages/News'
import RssFeeds from './components/Pages/RssFeeds'
import Profile from './components/Pages/Profile'
import './App.css'

export type Page = 'dashboard' | 'news' | 'categories' | 'rss-feeds' | 'trending' | 'authors' | 'comments' | 'ads' | 'subscribers' | 'settings' | 'configuration' | 'social' | 'profile' | 'reset-password'

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'configuration': return <Configuration />
      case 'social': return <Social />
      case 'news': return <News />
      case 'rss-feeds': return <RssFeeds />
      case 'profile': return <Profile />
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
                  <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg" alt="Admin" />
                </div>
                <span>Admin</span>
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
                  <button className="dropdown-item logout-text" onClick={() => console.log('logout')}>
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
