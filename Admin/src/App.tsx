import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Pages/Dashboard'
import Configuration from './components/Pages/Site_Configuration/Configuration'
import './App.css'

export type Page = 'dashboard' | 'news' | 'categories' | 'rss-feeds' | 'trending' | 'authors' | 'comments' | 'ads' | 'subscribers' | 'settings' | 'configuration'

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'configuration': return <Configuration />
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
            <div className="admin-badge">
              <div className="admin-avatar">A</div>
              <span>Admin</span>
              <span className="caret">▾</span>
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
