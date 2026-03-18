import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../../pages/css/STATE/StatePage.css';
import { getStateNews, scrapeFallbackImage, type Article } from '../../../services/newsService';
import { UilClock, UilEye, UilCommentAlt, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons';

const REGIONS = [
  'All Stories',
  'Ajmer',
  'Alwar',
  'Bagru',
  'Banswara',
  'Barmer',
  'Bassi',
  'Beawer',
  'Bharatpur',
  'Bhilwara',
  'Bhiwadi',
  'Bikaner',
  'Chittorgarh',
  'Churu',
  'Dausa',
  'Dholpur',
  'Dungarpur',
  'Hanumangarh',
  'Jaipur',
  'Jaisalmer',
  'Jalore',
  'Jhalawar',
  'Jhunjhunu',
  'Jhunjunu',
  'Jodhpur',
  'Karauli',
  'Kishangarh',
  'Kota',
  'Nagaur',
  'Pali',
  'Pratapgarh',
  'Rajsamand',
  'Sawai Madhopur',
  'Sikar',
  'Sirohi',
  'Sri Ganganagar',
  'Tonk',
  'Udaipur',
] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function dedupeByTitle(items: Article[]) {
  return items.filter((article, index, arr) => arr.findIndex((a) => a.title === article.title) === index);
}

function sortArticlesForCover(items: Article[]) {
  return [...items].sort((left, right) => {
    const leftHasImage = Boolean(left.image);
    const rightHasImage = Boolean(right.image);

    if (leftHasImage !== rightHasImage) {
      return Number(rightHasImage) - Number(leftHasImage);
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

export default function StatePage() {
  const [activeRegion, setActiveRegion] = useState<string>('All Stories');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleImageError = useCallback(async (article: Article) => {
    if (!article.image) return;
    
    // Immediately display the placeholder visually
    setFailedImages((prev) => new Set(prev).add(article.image!));

    // Attempt to scrape a working fallback image from the article website
    const fallbackImage = await scrapeFallbackImage(article.url, article.image);
    if (fallbackImage) {
      setArticles((prev) =>
        prev.map((a) => (a.url === article.url ? { ...a, image: fallbackImage } : a))
      );
    }
  }, []);

  const fetchRegionNews = useCallback(async (region: string) => {
  setLoading(true);
  setError(null);
  setFallbackNotice(null);
  setFailedImages(new Set());

  try {
    const query = region === 'All Stories' ? 'Rajasthan' : region;
    const response = await getStateNews(query, 30);
    const unique = sortArticlesForCover(dedupeByTitle(response.articles));
    setArticles(unique);

    // Show notice only if no articles found
    if (unique.length === 0) {
      setError(`No stories found for ${region}. Try another region.`);
    }

  } catch (err) {
    console.error('State region fetch failed:', err);
    setError('Could not load regional news right now. Please try again.');
    setArticles([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    fetchRegionNews(activeRegion);
  }, [activeRegion, fetchRegionNews]);

  const heroArticle = useMemo(() => articles[0], [articles]);
  const listArticles = useMemo(() => articles.slice(1), [articles]);

  return (
    <main className="state-region-page">
      <section className="state-region-shell">
        <div className="state-subnav-wrapper">
          <button className="state-nav-btn prev" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
          <div className="state-subnav" role="tablist" aria-label="Rajasthan regions" ref={scrollRef}>
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                role="tab"
                aria-selected={activeRegion === region}
                className={`state-subnav__item ${activeRegion === region ? 'active' : ''}`}
                onClick={() => setActiveRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
          <button className="state-nav-btn next" aria-label="Scroll right" onClick={() => scroll('right')}><UilAngleRight /></button>
        </div>

        <div className="state-content-grid">
          <section className="state-main-column" aria-live="polite">
            {loading ? (
              <div className="state-loader">
                <div className="state-loader__spinner" />
                <p>Loading {activeRegion} stories...</p>
              </div>
            ) : error ? (
              <div className="state-empty">{error}</div>
            ) : articles.length === 0 ? (
              <div className="state-empty">
                No stories found for {activeRegion}. Try another region.
              </div>
            ) : (
              <>
                {fallbackNotice && (
                  <div className="state-fallback-note">{fallbackNotice}</div>
                )}

                {heroArticle && (
                  <a href={heroArticle.url} target="_blank" rel="noopener noreferrer" className="state-hero-card">
                    <div className="state-hero-card__image-wrap" style={!heroArticle.image || failedImages.has(heroArticle.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                      {heroArticle.image && !failedImages.has(heroArticle.image) ? (
                        <img src={heroArticle.image} alt={heroArticle.title} className="state-hero-card__image" onError={() => handleImageError(heroArticle)} />
                      ) : (
                        <div className="state-hero-card__placeholder" />
                      )}
                      
                      <div className="state-hero-card__overlay">
                        <span className="state-badge">{activeRegion === 'All Stories' ? (heroArticle.source || 'Rajasthan') : activeRegion}</span>
                        <h1 className="state-hero-card__title">{heroArticle.title}</h1>
                        {heroArticle.description && <p className="state-hero-card__desc">{heroArticle.description}</p>}
                        <div className="state-story-item__meta">
                          <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                          <span><UilEye className="meta-icon" />0 Views</span>
                          <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                <div className="state-story-list">
                  {listArticles.slice(0, 10).map((article, index) => (
                    <a key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="state-story-item">
                      <div className="state-story-item__thumb-wrap" style={!article.image || failedImages.has(article.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                        {article.image && !failedImages.has(article.image) ? (
                          <img src={article.image} alt={article.title} className="state-story-item__thumb" onError={() => handleImageError(article)} />
                        ) : (
                          <div className="state-story-item__thumb-placeholder" />
                        )}
                        <span className="state-badge small">{activeRegion === 'All Stories' ? (article.source || 'Rajasthan') : activeRegion}</span>
                      </div>
                      <div className="state-story-item__content">
                        <h2 className="state-story-item__title">{article.title}</h2>
                        {article.description && <p className="state-story-item__desc">{article.description}</p>}
                        <div className="state-story-item__meta">
                          <span><UilClock className="meta-icon" />{timeAgo(article.publishedAt)}</span>
                          <span><UilEye className="meta-icon" />0 Views</span>
                          <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </section>

          {articles.length > 0 && (
            <aside className="state-sidebar">
              <section className="state-sidebar-section">
                <h3 className="state-sidebar-section__header">Trending in State</h3>
                <div className="trending-list">
                  {listArticles.slice(10, 15).map((article, idx) => (
                    idx === 0 ? (
                      <a key={idx} href={article.url} className="trending-item-top" target="_blank" rel="noopener noreferrer">
                        <div className="trending-item-top__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                          {article.image && !failedImages.has(article.image) && (
                            <img src={article.image} className="trending-item-top__image" onError={() => handleImageError(article)} />
                          )}
                        </div>
                        <span className="trending-rank">#{idx + 1} Trending</span>
                        <h4 className="trending-item-top__title">{article.title}</h4>
                        <div className="state-story-item__meta">
                          <span><UilEye className="meta-icon" />0 Views</span>
                        </div>
                      </a>
                    ) : (
                      <a key={idx} href={article.url} className="trending-item-small" target="_blank" rel="noopener noreferrer">
                        <div className="trending-item-small__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                          {article.image && !failedImages.has(article.image) && (
                            <img src={article.image} className="trending-item-small__image" onError={() => handleImageError(article)} />
                          )}
                        </div>
                        <div>
                          <span className="trending-rank">#{idx + 1} Trending</span>
                          <h4 className="trending-item-small__title">{article.title}</h4>
                        </div>
                      </a>
                    )
                  ))}
                </div>
              </section>

              <div className="sidebar-ad">
                <div className="sidebar-ad__label">Advertisement</div>
                <img src="https://placehold.co/300x300/1e2227/ffffff?text=Tonight,+I'll+be+eating...&font=montserrat" alt="Ad" className="sidebar-ad__img" />
              </div>

              <section className="state-sidebar-section">
                <h3 className="state-sidebar-section__header">Related Sections</h3>
                <div className="state-story-item__meta">Coming soon...</div>
              </section>
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}