import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../../pages/css/SPORTS/SportsPage.css';
import '../../../pages/css/topic_categories.css';
import { getSports, type Article } from '../../../services/newsService';
import NewsImage from '../common/NewsImage';
import { UilClock, UilEye, UilCommentAlt, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons';

const REGIONS = [
  'All Stories',
  'Athletics',
  'Chess',
  'Cricket',
  'Football',
  'Hockey',
  'ICC',
  'IPL',
  'Tennis'
] as const;

const RELATED_SECTIONS = [
  { name: 'Arts', count: '102' },
  { name: 'Astrology', count: '275' },
  { name: 'Breaking', count: '47' },
  { name: 'Business', count: '509' },
  { name: 'Crime', count: '16' },
  { name: 'Education', count: '195' },
  { name: 'Finance', count: '548' },
  { name: 'Green Future', count: '44' },
  { name: 'India', count: '1095' },
  { name: 'Lifestyle', count: '2907' },
  { name: 'Opinion', count: '19' },
  { name: 'Politics', count: '19' },
  { name: 'Sports', count: '1091' },
  { name: 'State', count: '4758' },
  { name: 'Technology', count: '106' },
  { name: 'Top', count: '10' },
  { name: 'Trending', count: '10' },
  { name: 'Weather', count: '55' },
  { name: 'World', count: '1169' }
];

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

export default function SportsPage() {
  const [activeRegion, setActiveRegion] = useState<string>('All Stories');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Infinite Scroll state
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


  const fetchRegionNews = useCallback(async (region: string, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setError(null);
      setFallbackNotice(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const query = region === 'All Stories' ? 'sports' : region;
      const currentSkip = isLoadMore ? skipRef.current + 20 : 0;
      
      const response = await getSports(query as any, undefined, 20, false, currentSkip);
      const newUnique = dedupeByTitle(response.articles);

      if (isLoadMore) {
        setArticles(prev => {
          const combined = dedupeByTitle([...prev, ...newUnique]);
          return combined;
        });
        skipRef.current = currentSkip;
        if (newUnique.length < 20) {
          setHasMore(false);
        }
      } else {
        const sortedUnique = sortArticlesForCover(newUnique);
        setArticles(sortedUnique);
        skipRef.current = 0;
        setHasMore(sortedUnique.length >= 20);
        
        if (sortedUnique.length === 0) {
          setError(`No stories found for ${region}. Try another category.`);
        }
      }

    } catch (err) {
      console.error('sports region fetch failed:', err);
      if (!isLoadMore) {
        setError('Could not load sports news right now. Please try again.');
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
    const interval = setInterval(() => fetchRegionNews(activeRegion, false), 1800000); // 30 minutes
    return () => clearInterval(interval);
  }, [activeRegion, fetchRegionNews]);

  const heroArticle = useMemo(() => articles[0], [articles]);
  const trendingArticles = useMemo(() => articles.slice(1, 6), [articles]);
  const mainListArticles = useMemo(() => articles.slice(6), [articles]);

  return (
    <main className="sports-region-page">
      <section className="sports-region-shell">
        <div className="tabs-scroll-wrap">
            <button className="tabs-arrow left" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
            <div className="tabs-scroll" id="tabsScroll" ref={scrollRef}>
                <ul className="nav nav-tabs" id="topicTabs" aria-label="Sports regions">
                    {REGIONS.map((region) => (
                        <li className="nav-item" key={region}>
                            <a
                                href="#0"
                                role="tab"
                                aria-selected={activeRegion === region}
                                className={`nav-link ${activeRegion === region ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); setActiveRegion(region); }}
                            >
                                {region}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="tabs-arrow right" aria-label="Scroll right" onClick={() => scroll('right')}><UilAngleRight /></button>
        </div>


        <div className="sports-content-grid">
          <section className="sports-main-column" aria-live="polite">
            {loading ? (
              <div className="sports-loader">
                <div className="sports-loader__spinner" />
                <p>Loading {activeRegion} stories...</p>
              </div>
            ) : error ? (
              <div className="sports-empty">{error}</div>
            ) : articles.length === 0 ? (
              <div className="sports-empty">
                No stories found for {activeRegion}. Try another section.
              </div>
            ) : (
              <>
                {fallbackNotice && (
                  <div className="sports-fallback-note">{fallbackNotice}</div>
                )}

                {heroArticle && (
                  <a href={heroArticle.url} target="_blank" rel="noopener noreferrer" className="sports-hero-card">
                    <div className="sports-hero-card__image-wrap">
                      <NewsImage 
                        src={heroArticle.image} 
                        alt={heroArticle.title} 
                        category="sports"
                        articleUrl={heroArticle.url}
                        className="sports-hero-card__image"
                      />
                      
                      <div className="sports-hero-card__overlay">
                        <h1 className="sports-hero-card__title">{heroArticle.title}</h1>
                        {heroArticle.description && <p className="sports-hero-card__desc">{heroArticle.description}</p>}
                        <div className="sports-story-item__meta">
                          <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                          <span><UilEye className="meta-icon" />0 Views</span>
                          <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                <div className="sports-story-list">
                  {mainListArticles.map((article, index) => (
                    <a key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="sports-story-item">
                      <div className="sports-story-item__thumb-wrap">
                        <NewsImage 
                          src={article.image} 
                          alt={article.title} 
                          category="sports"
                          articleUrl={article.url}
                          className="sports-story-item__thumb"
                        />
                      </div>
                      <div className="sports-story-item__content">
                        <h2 className="sports-story-item__title">{article.title}</h2>
                        {article.description && <p className="sports-story-item__desc">{article.description}</p>}
                        <div className="sports-story-item__meta">
                          <span><UilClock className="meta-icon" />{timeAgo(article.publishedAt)}</span>
                          <span><UilEye className="meta-icon" />0 Views</span>
                          <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* Infinite Scroll Load More target */}
                <div ref={observerTarget} className="infinite-scroll-loading" style={{ margin: '30px 0', textAlign: 'center' }}>
                  {loadingMore && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="sports-loader__spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }} />
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
            <aside className="sports-sidebar">
              <section className="sports-sidebar-section">
                <h3 className="sports-sidebar-section__header">Trending in Sports</h3>
                <div className="trending-list">
                  {trendingArticles.map((article, idx) => (
                    idx === 0 ? (
                      <a key={`trend-top-${idx}`} href={article.url} className="trending-item-top" target="_blank" rel="noopener noreferrer">
                        <div className="trending-item-top__image-wrap">
                          <NewsImage 
                            src={article.image} 
                            alt={article.title} 
                            category="sports"
                            articleUrl={article.url}
                            className="trending-item-top__image"
                          />
                        </div>
                        <span className="trending-rank">#{idx + 1} Trending</span>
                        <h4 className="trending-item-top__title">{article.title}</h4>
                        <div className="sports-story-item__meta">
                          <span><UilEye className="meta-icon" />0 Views</span>
                        </div>
                      </a>
                    ) : (
                      <a key={`trend-sm-${idx}`} href={article.url} className="trending-item-small" target="_blank" rel="noopener noreferrer">
                        <div className="trending-item-small__image-wrap">
                          <NewsImage 
                            src={article.image} 
                            alt={article.title} 
                            category="sports"
                            articleUrl={article.url}
                            className="trending-item-small__image"
                          />
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
                <img src="https://placehold.co/300x250/fff8e1/e65100?text=ADVERTISEMENT&font=montserrat" alt="Ad" className="sidebar-ad__img" style={{border: '1px solid #e0e0e0'}} />
              </div>

              <section className="sports-sidebar-section">
                <h3 className="sports-sidebar-section__header">Related Sections</h3>
                <div className="related-sections-list">
                  {RELATED_SECTIONS.map((sec) => (
                    <a key={sec.name} href={`#${sec.name.toLowerCase()}`} className="related-section-link">
                      <span>{sec.name}</span>
                      <span className="related-count-badge">{sec.count}</span>
                    </a>
                  ))}
                </div>
              </section>
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}
