import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../css/HOME/Home.css';
import { getTopHeadlines, searchNews, type Article } from '../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Rajasthan from './home-comp/Rajasthan';
import TrendingStories from './home-comp/TrendingStories';
import Lifestyle from './home-comp/Lifestyle';
import Finance from './home-comp/Finance';
import Weather from './home-comp/Weather';
import GreenFuture from './home-comp/GreenFuture';
import India from './home-comp/India';
import World from './home-comp/World';
import Politics from './home-comp/Politics';
import Technology from './home-comp/Technology';
import Education from './home-comp/Education';
import Crime from './home-comp/Crime';
import Astrology from './home-comp/Astrology';
import Opinion from './home-comp/Opinion';
import Arts from './home-comp/Arts';
import Business from './home-comp/Business';
import Entertainment from './home-comp/Entertainment';
import Sports from './home-comp/Sports';

const Home: React.FC = () => {
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [topStories, setTopStories] = useState<Article[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      let response = await getTopHeadlines('top', 'in', 10);
      if (response.articles.length === 0) {
        response = await searchNews('latest breaking news', 10);
      }
      // Filter articles that have images for the hero carousel
      const withImages = response.articles.filter((a) => a.image);
      const unique = withImages.filter(
        (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
      );
      // Pick 5 for hero carousel
      const hero = unique.slice(0, 5);
      setHeroArticles(hero);
      // Top stories: exclude hero articles
      const heroTitles = new Set(hero.map(a => a.title));
      const topStoriesFiltered = response.articles.filter(a => !heroTitles.has(a.title));
      setTopStories(topStoriesFiltered.slice(0, 6));

    } catch (err) {
      console.error('Error fetching news for Home:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => {
      fetchNews();
    }, 180000); // 3 minutes
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (heroArticles.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroArticles.length]);

  const goToSlide = (index: number) => setActiveSlide(index);
  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
  const nextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % heroArticles.length);

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-loading">
          <div className="home-spinner" />
          <p>Loading latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-grid">
        {/* ===== Hero Carousel ===== */}
        <div className="hero-carousel">
          {heroArticles.length > 0 && (
            <>
              <div className="carousel-viewport">
                {heroArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`carousel-slide ${index === activeSlide ? 'active' : ''}`}
                  >
                    <img
                      src={article.image || ''}
                      alt={article.title}
                      className="carousel-image"
                    />
                    <div className="carousel-overlay">
                      <span className="carousel-category">{article.source}</span>
                      <h2 className="carousel-title">{article.title}</h2>
                      <span className="carousel-timestamp">
                        {article.source} &bull; {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Arrows */}
              <button className="carousel-arrow carousel-prev" onClick={prevSlide} aria-label="Previous slide">
                <i className="fas fa-chevron-left" />
              </button>
              <button className="carousel-arrow carousel-next" onClick={nextSlide} aria-label="Next slide">
                <i className="fas fa-chevron-right" />
              </button>

              {/* Dots */}
              <div className="carousel-dots">
                {heroArticles.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ===== Top Stories Sidebar ===== */}
        <div className="top-stories">
          <div className="top-stories-header">
            <h3 className="top-stories-title">TOP STORIES</h3>
            <Link to="/category/top" className="top-stories-more">
              More <i className="fas fa-arrow-right" />
            </Link>
          </div>
          <div className="top-stories-list">
            {topStories.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="story-item"
              >
                <img
                  src={article.image || 'https://via.placeholder.com/120x80?text=No+Image'}
                  alt={article.title}
                  className="story-thumb"
                />
                <div className="story-info">
                  <span className="story-category">{article.source}</span>
                  <h6 className="story-title">{article.title}</h6>
                  <span className="story-time">{timeAgo(article.publishedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== News Sections ===== */}
      <div className="home-sections">
        {/* State */}
        <Rajasthan />
        {/* Categories */}
        <TrendingStories />
        <India />
        <World />
        <Business />
        <Sports />
        <Politics />
        <Technology />
        <Lifestyle />
        <Finance />
        <Entertainment />
        <Weather />
        <Crime />
        <GreenFuture />
        <Education />
        <Astrology />
        <Opinion />
        <Arts />
      </div>
    </div>
  );
};

export default Home;