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
import Career from './pages/components/Career/career.tsx'
import StatePage from './pages/components/STATE/StatePage.tsx'
import WorldPage from './pages/components/WORLD/WorldPage.tsx'
import EntertainmentPage from './pages/components/ENTERTAINMENT/EntertainmentPage.tsx'
import SportsPage from './pages/components/SPORTS/SportsPage.tsx'
import IndiaPage from './pages/components/INDIA/IndiaPage.tsx'
import PoliticsPage from './pages/components/POLITICS/PoliticsPage.tsx'
import TechnologyPage from './pages/components/TECHNOLOGY/TechnologyPage.tsx'
import LifestylePage from './pages/components/LIFESTYLE/LifestylePage.tsx'
import BusinessPage from './pages/components/BUSINESS/BusinessPage.tsx'
import EducationPage from './pages/components/EDUCATION/EducationPage.tsx'

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
        <Route path="/state" element={<StatePage />} />
        <Route path="/india" element={<IndiaPage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/entertainment" element={<EntertainmentPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/career" element={<Career />} />
        <Route path="/politics" element={<PoliticsPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/lifestyle" element={<LifestylePage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/education" element={<EducationPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)