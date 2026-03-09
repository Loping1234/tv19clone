import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './Navbar.tsx'
import Home from './pages/components/HOME/Home.tsx'
import CategoryPage from './pages/components/HOME/more/CategoryPage.tsx'
import { getSiteConfig, applySiteConfig } from './services/siteConfigService'

// Fetch site config and apply favicon + title on startup
getSiteConfig()
  .then((config) => applySiteConfig(config))
  .catch((err) => console.warn('Could not load site config:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categorySlug" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
