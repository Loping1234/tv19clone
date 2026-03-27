import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../../pages/css/INDIA/IndiaPage.css';
import '../../../pages/css/topic_categories.css';
import { getIndia, type Article } from '../../../services/newsService';
import NewsImage from '../common/NewsImage';
import { UilClock, UilEye, UilCommentAlt, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons';

const REGIONS = [
    'All Stories',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'East',
    'Gujarat',
    'Haryana',
    'Himachal',
    'Jharkhand',
    'Madhya Pradesh',
    'Maharashtra',
    'Mumbai',
    'New Delhi',
    'Patna',
    'Punjab',
    'South',
    'Uttar Pradesh'
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

export default function IndiaPage() {
    const [activeRegion, setActiveRegion] = useState<string>('All Stories');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Infinite Scroll worlds
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
            const currentSkip = isLoadMore ? skipRef.current + 30 : 0;
            const response = await getIndia(region, 30, currentSkip);
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

                // Show notice only if no articles found
                if (sortedUnique.length === 0) {
                    setError(`No stories found for ${region}. Try another region.`);
                }
            }

        } catch (err) {
            console.error('india region fetch failed:', err);
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
        const interval = setInterval(() => fetchRegionNews(activeRegion, false), 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [activeRegion, fetchRegionNews]);

    const heroArticle = useMemo(() => articles[0], [articles]);
    const trendingArticles = useMemo(() => articles.slice(11, 16), [articles]);
    const mainListArticles = useMemo(() => articles.slice(1, 11).concat(articles.slice(16)), [articles]);

    return (
        <main className="india-region-page">
            <section className="india-region-shell">
                <div className="tabs-scroll-wrap">
                    <button className="tabs-arrow left" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
                    <div className="tabs-scroll" id="tabsScroll" ref={scrollRef}>
                        <ul className="nav nav-tabs" id="topicTabs" aria-label="India regions">
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

                <div className="india-content-grid">
                    <section className="india-main-column" aria-live="polite">
                        {loading ? (
                            <div className="india-loader">
                                <div className="india-loader__spinner" />
                                <p>Loading {activeRegion} stories...</p>
                            </div>
                        ) : error ? (
                            <div className="india-empty">{error}</div>
                        ) : articles.length === 0 ? (
                            <div className="india-empty">
                                No stories found for {activeRegion}. Try another region.
                            </div>
                        ) : (
                            <>
                                {fallbackNotice && (
                                    <div className="india-fallback-note">{fallbackNotice}</div>
                                )}

                                {heroArticle && (
                                    <a href={heroArticle.url} target="_blank" rel="noopener noreferrer" className="india-hero-card">
                                        <div className="india-hero-card__image-wrap">
                                            <NewsImage 
                                                src={heroArticle.image} 
                                                alt={heroArticle.title} 
                                                category="general"
                                                articleUrl={heroArticle.url}
                                                className="india-hero-card__image"
                                            />

                                            <div className="india-hero-card__overlay">
                                                <div className={`india-badge ${activeRegion.length > 12 ? 'small' : ''}`}>
                                                    {activeRegion === 'All Stories' ? 'INDIA' : activeRegion}
                                                </div>
                                                <h1 className="india-hero-card__title">{heroArticle.title}</h1>
                                                {heroArticle.description && <p className="india-hero-card__desc">{heroArticle.description}</p>}
                                                <div className="india-story-item__meta">
                                                    <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                    <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                <div className="india-story-list">
                                    {mainListArticles.map((article, index) => (
                                        <a key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="india-story-item">
                                            <div className="india-story-item__thumb-wrap">
                                                <NewsImage 
                                                    src={article.image} 
                                                    alt={article.title} 
                                                    category="general"
                                                    articleUrl={article.url}
                                                    className="india-story-item__thumb"
                                                />
                                            </div>
                                            <div className="india-story-item__content">
                                                <h2 className="india-story-item__title">{article.title}</h2>
                                                {article.description && <p className="india-story-item__desc">{article.description}</p>}
                                                <div className="india-story-item__meta">
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
                                            <div className="india-loader__spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }} />
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
                        <aside className="india-sidebar">
                            <section className="india-sidebar-section">
                                <h3 className="india-sidebar-section__header">Trending in India</h3>
                                <div className="india-trending-list">
                                    {trendingArticles.map((article, idx) => (
                                        idx === 0 ? (
                                            <a key={idx} href={article.url} className="india-trending-item-top" target="_blank" rel="noopener noreferrer">
                                                <div className="india-trending-item-top__image-wrap">
                                                    <NewsImage 
                                                        src={article.image} 
                                                        alt={article.title} 
                                                        category="general"
                                                        articleUrl={article.url}
                                                        className="india-trending-item-top__image"
                                                    />
                                                </div>
                                                <span className="india-trending-rank">#{idx + 1} Trending</span>
                                                <h4 className="india-trending-item-top__title">{article.title}</h4>
                                                <div className="india-story-item__meta">
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                </div>
                                            </a>
                                        ) : (
                                            <a key={idx} href={article.url} className="india-trending-item-small" target="_blank" rel="noopener noreferrer">
                                                <div className="india-trending-item-small__image-wrap">
                                                    <NewsImage 
                                                        src={article.image} 
                                                        alt={article.title} 
                                                        category="general"
                                                        articleUrl={article.url}
                                                        className="india-trending-item-small__image"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="india-trending-rank">#{idx + 1} Trending</span>
                                                    <h4 className="india-trending-item-small__title">{article.title}</h4>
                                                </div>
                                            </a>
                                        )
                                    ))}
                                </div>
                            </section>

                            <div className="india-sidebar-ad">
                                <div className="india-sidebar-ad__label">Advertisement</div>
                                <img src="https://placehold.co/300x300/1e2227/ffffff?text=Tonight,+I'll+be+eating...&font=montserrat" alt="Ad" className="india-sidebar-ad__img" />
                            </div>
                        </aside>
                    )}
                </div>
            </section>
        </main>
    );
}
