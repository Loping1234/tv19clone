import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../../pages/css/STATE/StatePage.css';
import '../../../pages/css/topic_categories.css';
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
  
  // Infinite Scroll States
  const skipRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const fetchRegionNews = useCallback(async (region: string, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setError(null);
      setFallbackNotice(null);
      setFailedImages(new Set());
    } else {
      setLoadingMore(true);
    }

    try {
      const query = region === 'All Stories' ? 'Rajasthan' : region;
      const currentSkip = isLoadMore ? skipRef.current + 30 : 0;
      const response = await getStateNews(query, 30, currentSkip);
      const newUnique = dedupeByTitle(response.articles);

      if (isLoadMore) {
        setArticles(prev => {
          const combined = dedupeByTitle([...prev, ...newUnique]);
          return combined;
        });
        skipRef.current = currentSkip;
        if (newUnique.length < 30) {
          setHasMore(false);
        }
      } else {
        const sortedUnique = sortArticlesForCover(newUnique);
        setArticles(sortedUnique);
        skipRef.current = 0;
        setHasMore(sortedUnique.length >= 30);
        
        if (sortedUnique.length === 0) {
          setError(`No stories found for ${region}. Try another region.`);
        }
      }

    } catch (err) {
      console.error('State region fetch failed:', err);
      if (!isLoadMore) {
        setError('Could not load regional news right now. Please try again.');
        setArticles([]);
      }
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchRegionNews(activeRegion, true);
  }, [activeRegion, fetchRegionNews, hasMore, loadingMore, loading]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    fetchRegionNews(activeRegion, false);
  }, [activeRegion, fetchRegionNews]);

  // Proactive Hero Image Scrape: if the top story has no image, try to fetch it
  useEffect(() => {
    if (articles.length > 0 && !articles[0].image && articles[0].url) {
      const hero = articles[0];
      scrapeFallbackImage(hero.url, '').then(newImg => {
        if (newImg) {
          setArticles(prev => prev.map((a, idx) => idx === 0 ? { ...a, image: newImg } : a));
        }
      });
    }
  }, [articles]);

  const heroArticle = useMemo(() => articles[0], [articles]);
  const trendingArticles = useMemo(() => articles.slice(11, 16), [articles]);
  const mainListArticles = useMemo(() => articles.slice(1, 11).concat(articles.slice(16)), [articles]);

  return (
    <main className="state-region-page">
      <div className="tabs-scroll-wrap">
        <button className="tabs-arrow left" aria-label="Scroll left" onClick={() => scroll('left')}>
          <UilAngleLeft />
        </button>

        <div className="tabs-scroll" id="tabsScroll" ref={scrollRef}>
          <ul className="nav nav-tabs" id="topicTabs">
            {REGIONS.map(region => (
              <li className="nav-item" key={region}>
                <a
                  href="#0"
                  onClick={(e) => { e.preventDefault(); setActiveRegion(region); }}
                  className={`nav-link ${activeRegion === region ? 'active' : ''}`}
                >
                  {region}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <button className="tabs-arrow right" aria-label="Scroll right" onClick={() => scroll('right')}>
          <UilAngleRight />
        </button>
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
                  <Link to={`/article/${heroArticle._id}`}   className="state-hero-card">
                    <div className="state-hero-card__image-wrap" style={!heroArticle.image || failedImages.has(heroArticle.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                      {heroArticle.image && !failedImages.has(heroArticle.image) ? (
                        <img src={heroArticle.image} alt={heroArticle.title} className="state-hero-card__image" onError={() => handleImageError(heroArticle)} />
                      ) : (
                        <div className="state-hero-card__placeholder" />
                      )}
                      <div className="state-hero-card__overlay">
                        <h1 className="state-hero-card__title">{heroArticle.title}</h1>
                        {heroArticle.description && <p className="state-hero-card__desc">{heroArticle.description}</p>}
                        <div className="state-story-item__meta">
                          <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                          <span><UilEye className="meta-icon" />0 Views</span>
                          <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="state-story-list">
                  {mainListArticles.map((article, index) => (
                    <Link key={`${article.title}-${index}`} to={`/article/${article._id}`}   className="state-story-item">
                      <div className="state-story-item__thumb-wrap" style={!article.image || failedImages.has(article.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                        {article.image && !failedImages.has(article.image) ? (
                          <img src={article.image} alt={article.title} className="state-story-item__thumb" onError={() => handleImageError(article)} />
                        ) : (
                          <div className="state-story-item__thumb-placeholder" />
                        )}
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
                    </Link>
                  ))}
                </div>
                
                <div ref={observerTarget} className="infinite-scroll-loading" style={{ margin: '30px 0', textAlign: 'center' }}>
                  {loadingMore && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="state-loader__spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }} />
                      <p style={{ color: '#666', fontSize: '14px' }}>Loading more stories...</p>
                    </div>
                  )}
                  {!hasMore && articles.length > 0 && (
                    <div className="end-of-news" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                      <p style={{ color: '#888', fontStyle: 'italic' }}>You've reached the end of today's news.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {articles.length > 0 && (
            <aside className="state-sidebar">
              <section className="state-sidebar-section">
                <h3 className="state-sidebar-section__header">Trending in State</h3>
                <div className="trending-list">
                  {trendingArticles.map((article, idx) => (
                    idx === 0 ? (
                      <Link key={idx} to={`/article/${article._id}`} className="trending-item-top"  >
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
                      </Link>
                    ) : (
                      <Link key={idx} to={`/article/${article._id}`} className="trending-item-small"  >
                        <div className="trending-item-small__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                          {article.image && !failedImages.has(article.image) && (
                            <img src={article.image} className="trending-item-small__image" onError={() => handleImageError(article)} />
                          )}
                        </div>
                        <div>
                          <span className="trending-rank">#{idx + 1} Trending</span>
                          <h4 className="trending-item-small__title">{article.title}</h4>
                        </div>
                      </Link>
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
    </main>
  );
}