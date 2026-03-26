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
import PrivacyPolicy from './pages/components/PrivacyPolicy/PrivacyPolicy.tsx'
import Advertise from './pages/components/Advertise/Advertise.tsx'
import Career from './pages/components/Career/career.tsx'
import Login from './pages/components/Login/Login.tsx'
import Signup from './pages/components/Signup/Signup.tsx'
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
import DynamicSectionPage from './pages/components/DYNAMIC/DynamicSectionPage.tsx'

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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        
        {/* 10 Dynamic More Sections */}
        <Route path="/art" element={<DynamicSectionPage categoryId="art" />} />
        <Route path="/astrology" element={<DynamicSectionPage categoryId="astrology" />} />
        <Route path="/breaking" element={<DynamicSectionPage categoryId="breaking" />} />
        <Route path="/crime" element={<DynamicSectionPage categoryId="crime" />} />
        <Route path="/finance" element={<DynamicSectionPage categoryId="finance" />} />
        <Route path="/opinion" element={<DynamicSectionPage categoryId="opinion" />} />
        <Route path="/top" element={<DynamicSectionPage categoryId="top" />} />
        <Route path="/trending" element={<DynamicSectionPage categoryId="trending" />} />
        <Route path="/weather" element={<DynamicSectionPage categoryId="weather" />} />
        <Route path="/green-future" element={<DynamicSectionPage categoryId="green-future" />} />
        <Route path="/footer-preview" element={<div style={{ paddingTop: '100px', background: '#f8f9fa' }}><Footer /></div>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)