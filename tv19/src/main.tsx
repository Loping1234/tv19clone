import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './Navbar.tsx'
import Home from './pages/components/HOME/Home.tsx'
import CategoryPage from './pages/components/HOME/more/CategoryPage.tsx'
import ContactUs from './pages/components/ContactUs/ContactUs.tsx'
import Footer from './pages/components/Footer/Footer.tsx'
import AboutUs from './pages/components/AboutUs/AboutUs.tsx'
import Disclaimer from './pages/components/Disclaimer/Disclaimer.tsx'
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
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
