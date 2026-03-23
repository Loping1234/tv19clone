import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../../pages/css/BUSINESS/BusinessPage.css';
import { getBusiness, scrapeFallbackImage, type Article } from '../../../services/newsService';
import { UilClock, UilEye, UilCommentAlt, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons';

const REGIONS = [
    'All Stories',
    'Agri-Business',
    'Auto',
    'Budget',
    'Economy',
    'Industry',
    'Manufacturing',
    'Markets'
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

export default function BusinessPage() {
    const [activeRegion, setActiveRegion] = useState<string>('All Stories');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
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
            const currentSkip = isLoadMore ? skipRef.current + 30 : 0;
            const response = await getBusiness(region, 30, currentSkip);
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
            console.error('business region fetch failed:', err);
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

    const heroArticle = useMemo(() => articles[0], [articles]);
    const trendingArticles = useMemo(() => articles.slice(11, 16), [articles]);
    const mainListArticles = useMemo(() => articles.slice(1, 11).concat(articles.slice(16)), [articles]);

    return (
        <main className="business-region-page">
            <section className="business-region-shell">
                <div className="business-subnav-wrapper">
                    <button className="business-nav-btn prev" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
                    <div className="business-subnav" role="tablist" aria-label="Business regions" ref={scrollRef}>
                        {REGIONS.map((region) => (
                            <button
                                key={region}
                                type="button"
                                role="tab"
                                aria-selected={activeRegion === region}
                                className={`business-subnav__item ${activeRegion === region ? 'active' : ''}`}
                                onClick={() => setActiveRegion(region)}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                    <button className="business-nav-btn next" aria-label="Scroll right" onClick={() => scroll('right')}><UilAngleRight /></button>
                </div>

                <div className="business-content-grid">
                    <section className="business-main-column" aria-live="polite">
                        {loading ? (
                            <div className="business-loader">
                                <div className="business-loader__spinner" />
                                <p>Loading {activeRegion} stories...</p>
                            </div>
                        ) : error ? (
                            <div className="business-empty">{error}</div>
                        ) : articles.length === 0 ? (
                            <div className="business-empty">
                                No stories found for {activeRegion}. Try another region.
                            </div>
                        ) : (
                            <>
                                {fallbackNotice && (
                                    <div className="business-fallback-note">{fallbackNotice}</div>
                                )}

                                {heroArticle && (
                                    <a href={heroArticle.url} target="_blank" rel="noopener noreferrer" className="business-hero-card">
                                        <div className="business-hero-card__image-wrap" style={!heroArticle.image || failedImages.has(heroArticle.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                                            {heroArticle.image && !failedImages.has(heroArticle.image) ? (
                                                <img src={heroArticle.image} alt={heroArticle.title} className="business-hero-card__image" onError={() => handleImageError(heroArticle)} />
                                            ) : (
                                                <div className="business-hero-card__placeholder" />
                                            )}

                                            <div className="business-hero-card__overlay">
                                                <div className={`business-badge ${activeRegion.length > 12 ? 'small' : ''}`}>
                                                    {activeRegion === 'All Stories' ? 'BUSINESS' : activeRegion}
                                                </div>
                                                <h1 className="business-hero-card__title">{heroArticle.title}</h1>
                                                {heroArticle.description && <p className="business-hero-card__desc">{heroArticle.description}</p>}
                                                <div className="business-story-item__meta">
                                                    <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                    <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                <div className="business-story-list">
                                    {mainListArticles.map((article, index) => (
                                        <a key={`${article.title}-${index}`} href={article.url} target="_blank" rel="noopener noreferrer" className="business-story-item">
                                            <div className="business-story-item__thumb-wrap" style={!article.image || failedImages.has(article.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                                                {article.image && !failedImages.has(article.image) ? (
                                                    <img src={article.image} alt={article.title} className="business-story-item__thumb" onError={() => handleImageError(article)} />
                                                ) : (
                                                    <div className="business-story-item__thumb-placeholder" />
                                                )}
                                            </div>
                                            <div className="business-story-item__content">
                                                <h2 className="business-story-item__title">{article.title}</h2>
                                                {article.description && <p className="business-story-item__desc">{article.description}</p>}
                                                <div className="business-story-item__meta">
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
                                            <div className="business-loader__spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }} />
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
                        <aside className="business-sidebar">
                            <section className="business-sidebar-section">
                                <h3 className="business-sidebar-section__header">Trending in Business</h3>
                                <div className="business-trending-list">
                                    {trendingArticles.map((article, idx) => (
                                        idx === 0 ? (
                                            <a key={idx} href={article.url} className="business-trending-item-top" target="_blank" rel="noopener noreferrer">
                                                <div className="business-trending-item-top__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                                                    {article.image && !failedImages.has(article.image) && (
                                                        <img src={article.image} className="business-trending-item-top__image" onError={() => handleImageError(article)} />
                                                    )}
                                                </div>
                                                <span className="business-trending-rank">#{idx + 1} Trending</span>
                                                <h4 className="business-trending-item-top__title">{article.title}</h4>
                                                <div className="business-story-item__meta">
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                </div>
                                            </a>
                                        ) : (
                                            <a key={idx} href={article.url} className="business-trending-item-small" target="_blank" rel="noopener noreferrer">
                                                <div className="business-trending-item-small__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                                                    {article.image && !failedImages.has(article.image) && (
                                                        <img src={article.image} className="business-trending-item-small__image" onError={() => handleImageError(article)} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="business-trending-rank">#{idx + 1} Trending</span>
                                                    <h4 className="business-trending-item-small__title">{article.title}</h4>
                                                </div>
                                            </a>
                                        )
                                    ))}
                                </div>
                            </section>

                            <div className="business-sidebar-ad">
                                <div className="business-sidebar-ad__label">Advertisement</div>
                                <img src="https://placehold.co/300x300/1e2227/ffffff?text=Tonight,+I'll+be+eating...&font=montserrat" alt="Ad" className="business-sidebar-ad__img" />
                            </div>
                        </aside>
                    )}
                </div>
            </section>
        </main>
    );
}
