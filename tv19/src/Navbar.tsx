import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'
import './BreakingNews.css';
import { getTopHeadlines, searchNews, type Article } from './services/newsService';
import { useState, useEffect, useRef, useCallback } from "react";
import { getWeatherByCity, type WeatherResponse } from "./services/weatherService";
import { getSiteConfig, applySiteConfig, type SiteConfig } from './services/siteConfigService';
import { UilSearch } from '@iconscout/react-unicons';
import '@fortawesome/fontawesome-free/css/all.min.css';
import logoImg from './assets/Image_Logo.png';

interface BreakingNewsProps {
  category?: 'top' | 'entertainment' | 'sports' | 'technology' | 'business' | 'health' | 'science';
  country?: string;
  refreshInterval?: number;
}

const DEFAULT_CITY = "Jodhpur, Rajasthan";

const Navbar: React.FC<BreakingNewsProps> = ({
  category = 'top',
  country = 'in',
  refreshInterval = 300000 // 5 minutes
}) => {
  // Weather state
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Breaking news state
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Site config state
  const [, setSiteConfig] = useState<SiteConfig | null>(null);

  // Live date/time
  const [now, setNow] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Detect scroll to shrink navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep a live CSS offset for the fixed navbar height (handles zoom/resize/scroll shrink)
  useEffect(() => {
    if (!containerRef.current) return;

    const updateOffset = () => {
      if (!containerRef.current) return;
      const height = containerRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-offset', `${height}px`);
      // Also set the dark navbar-only height for sticky subnavbars
      if (navbarRef.current) {
        const navbarHeight = navbarRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    
    // Smoothly update offset when navbar shrinks/grows during scroll
    const resizeObserver = new ResizeObserver(() => {
      updateOffset();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateOffset);
      resizeObserver.disconnect();
    };
  }, []);

  // Fetch breaking news with fallback to keyword search
  const fetchBreakingNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      let response = await getTopHeadlines(category, country, 10);

      // Fallback: if no headlines found, search by keyword instead
      if (response.articles.length === 0) {
        response = await searchNews('India latest news', 10);
      }

      setArticles(response.articles);
      setNewsError(null);
    } catch (err) {
      setNewsError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('Error fetching breaking news:', err);
    } finally {
      setNewsLoading(false);
    }
  }, [category, country]);

  // Fetch weather
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await getWeatherByCity(DEFAULT_CITY);
      setData(result);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setData(null);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to fetch weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh for breaking news
  useEffect(() => {
    fetchBreakingNews();
    const intervalId = setInterval(fetchBreakingNews, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchBreakingNews, refreshInterval]);

  // Fetch weather on mount
  useEffect(() => {
    fetchWeather();
  }, []);

  // Fetch site config on mount and on window focus (for live updates from Admin)
  useEffect(() => {
    const fetchConfig = () => {
      getSiteConfig()
        .then((config) => {
          setSiteConfig(config);
          applySiteConfig(config);
        })
        .catch((err) => console.warn('Could not load site config:', err));
    };

    fetchConfig();

    // Auto-refresh config when switching tabs back to the main site
    window.addEventListener('focus', fetchConfig);
    return () => window.removeEventListener('focus', fetchConfig);
  }, []);

  // Calculate animation duration based on content width
  useEffect(() => {
    if (tickerRef.current && articles.length > 0) {
      const contentWidth = tickerRef.current.scrollWidth;
      const duration = contentWidth / 170; // 50px per second
      tickerRef.current.style.setProperty('--ticker-duration', `${duration}s`);
    }
  }, [articles]);

  // Format date/time like: Thu, Feb 19, 11:13 PM
  const formatDateTime = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate();
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${day}, ${month} ${dateNum}, ${hours}:${mins} ${ampm}`;
  };

  const navItems = [
    { label: 'Home', to: '/', isLink: true },
    { label: 'State', to: '/state', isLink: true },
    { label: 'India', to: '/india', isLink: true },
    { label: 'World', to: '/world', isLink: true },
    { label: 'Entertainment', to: '/entertainment', isLink: true },
    { label: 'Sports', to: '/sports', isLink: true },
    { label: 'Politics', to: '/politics', isLink: true },
    { label: 'Technology', to: '/technology', isLink: true },
    { label: 'Lifestyle', to: '/lifestyle', isLink: true },
    { label: 'Business', to: '/business', isLink: true },
    { label: 'Education', to: '/education', isLink: true },
  ];

  return (
    <div ref={containerRef} className={`container ${scrolled ? 'scrolled' : ''}`}>
      <header className='main-header'>
        {/* Logo */}
        <div className="logo-block">
          <img src={logoImg} alt="TV19 News" className="logo-img" />
        </div>

        {/* Location + Date/Time + Weather */}
        <div className="weather-block">
          <i className="fas fa-cloud-sun weather-fa-icon"></i>
          <div className="weather-info">
            <div className="weather-city">
              <span className="weather-city-name">{DEFAULT_CITY}</span>
            </div>
            <div className="weather-detail">
              <span className="weather-datetime">{formatDateTime(now)}</span>
              {loading && <span className="weather-temp"> · Loading...</span>}
              {errorMessage && <span className="weather-temp"> · {errorMessage}</span>}
              {data && (
                <span className="weather-temp"> · {data.main.temp}°C</span>
              )}
            </div>
          </div>
        </div>

        {/* Right-side links + social + search */}
        <div className='header-right'>
          <Link to='/about' className='header-link'>ABOUT US</Link>
          <Link to='/contact' className='header-link'>CONTACT US</Link>
          <Link to='/career' className='header-link'>CAREER</Link>
          <div className="header-divider"></div>
          <div className="social-icons">
            <a href="#facebook" className="social-icon-box"><i className="fab fa-facebook-f"></i></a>
            <a href="#twitter" className="social-icon-box"><i className="fab fa-twitter"></i></a>
            <a href="#youtube" className="social-icon-box"><i className="fab fa-youtube"></i></a>
            <a href="#instagram" className="social-icon-box"><i className="fab fa-instagram"></i></a>
          </div>
          <button className="search-btn" aria-label="Search"><UilSearch size={18} /></button>
        </div>
      </header>

      <nav ref={navbarRef} className='navbar'>
        <ul className='navbar-list'>
          {navItems.map((item) => {
            const isActive = item.isLink
              ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to!))
              : false;
            return (
              <li key={item.label}>
                {item.isLink ? (
                  <Link to={item.to!} className={`navbar-link ${isActive ? 'active' : ''}`}>
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className='navbar-link'>{item.label}</a>
                )}
              </li>
            );
          })}
          <li className="dropdown">
            <a href="#more" className="navbar-link dropdown-toggle">More ▾</a>
            <ul className="dropdown-menu">
              <li><a href="#arts" className="navbar-link">Arts</a></li>
              <li><a href="#astrology" className="navbar-link">Astrology</a></li>
              <li><a href="#crime" className="navbar-link">Crime</a></li>
              <li><a href="#finance" className="navbar-link">Finance</a></li>
              <li><a href="#opinion" className="navbar-link">Opinion</a></li>
              <li><a href="#weather" className="navbar-link">Weather</a></li>
              <li><a href="#green-future" className="navbar-link">Green Future</a></li>
            </ul>
          </li>
        </ul>

        {/* Login / Sign Up buttons */}
        <div className="navbar-auth">
          <a href="#login" className="btn-login">
            LOGIN
          </a>
          <a href="#signup" className="btn-signup">
            SIGN UP
          </a>
        </div>
      </nav>

      {/* Breaking News Cards — Scrolling */}
      <div className='breaking-news-container'>
        <div className="breaking-news-track-wrapper">
          {newsLoading && articles.length === 0 ? (
            <div className="breaking-loading">Loading latest news...</div>
          ) : newsError ? (
            <div className="breaking-error">{newsError}</div>
          ) : (
            <div className="breaking-news-track">
              {articles.slice(0, 8).map((article, index) => (
                <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="breaking-card">
                  <div className="breaking-card-image-wrap">
                    {article.image ? (
                      <img src={article.image} alt="" className="breaking-card-image" />
                    ) : (
                      <div className="breaking-card-placeholder" />
                    )}
                  </div>
                  <div className="breaking-card-body">
                    <span className="breaking-badge">BREAKING</span>
                    <h4 className="breaking-card-title">{article.title}</h4>
                  </div>
                </a>
              ))}
              {/* Duplicate for seamless loop */}
              {articles.slice(0, 8).map((article, index) => (
                <a key={`dup-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="breaking-card">
                  <div className="breaking-card-image-wrap">
                    {article.image ? (
                      <img src={article.image} alt="" className="breaking-card-image" />
                    ) : (
                      <div className="breaking-card-placeholder" />
                    )}
                  </div>
                  <div className="breaking-card-body">
                    <span className="breaking-badge">BREAKING</span>
                    <h4 className="breaking-card-title">{article.title}</h4>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;