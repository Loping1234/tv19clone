import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import '../../../pages/css/DYNAMIC/DynamicSectionPage.css';
import '../../../pages/css/topic_categories.css';
import { getDynamicCategoryNews, scrapeFallbackImage, type Article } from '../../../services/newsService';
import { UilClock, UilEye, UilCommentAlt, UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons';

export const DYNAMIC_CATEGORIES_CONFIG: Record<string, { title: string, apiCategory: string, subcategories: string[] }> = {
    'art': { title: 'Art', apiCategory: 'art', subcategories: ['All Stories', 'Art & Design', 'Book Review', 'Dance', 'Movies', 'Music', 'Television', 'Theater'] },
    'astrology': { title: 'Astrology', apiCategory: 'astrology', subcategories: ['All Stories', 'Festivals', 'Horoscope', 'Pilgrimage', 'Religion', 'Spiritual', 'Temples'] },
    'breaking': { title: 'Breaking', apiCategory: 'breaking', subcategories: ['All Stories'] },
    'crime': { title: 'Crime', apiCategory: 'crime', subcategories: ['All Stories'] },
    'finance': { title: 'Finance', apiCategory: 'finance', subcategories: ['All Stories'] },
    'opinion': { title: 'Opinion', apiCategory: 'opinion', subcategories: ['All Stories', 'Cartoon', 'Columns', 'Comment', 'Editorial', 'Interview', 'Lead', 'Letters', 'Open Page', "Readers' Editor"] },
    'top': { title: 'Top', apiCategory: 'top', subcategories: ['All Stories'] },
    'trending': { title: 'Trending', apiCategory: 'trending', subcategories: ['All Stories'] },
    'weather': { title: 'Weather', apiCategory: 'weather', subcategories: ['All Stories'] },
    'green-future': { title: 'Green Future', apiCategory: 'green-future', subcategories: ['All Stories', 'Climate Innovation', 'Funding', 'Infrastructure', 'Renewable Energy'] },
};

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

interface Props {
    categoryId?: string;
}

export default function DynamicSectionPage({ categoryId: propCategoryId }: Props) {
    const { categoryId: paramCategoryId } = useParams<{ categoryId: string }>();
    const categoryId = propCategoryId || paramCategoryId;
    const config = categoryId ? DYNAMIC_CATEGORIES_CONFIG[categoryId] : null;

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

    // Reset subcategory state when switching to a completely different main category via URL
    useEffect(() => {
        setActiveRegion('All Stories');
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [categoryId]);

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
        if (!config) return;

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
            const response = await getDynamicCategoryNews(config.apiCategory, region, 30, currentSkip);
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
                    setError(`No stories found for ${region}. Try another subcategory.`);
                }
            }

        } catch (err) {
            console.error(`${config.apiCategory} subcategory fetch failed:`, err);
            if (!isLoadMore) {
                setError('Could not load news right now. Please try again.');
                setArticles([]);
            }
        } finally {
            if (!isLoadMore) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, [config]);

    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore || loading || !config) return;
        fetchRegionNews(activeRegion, true);
    }, [activeRegion, fetchRegionNews, hasMore, loadingMore, loading, config]);

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
        fetchRegionNews(activeRegion, false);
    }, [activeRegion, fetchRegionNews, categoryId]); // Fetch when region or root categoryId changes

    if (!config) {
        return <Navigate to="/" replace />;
    }

    const heroArticle = useMemo(() => articles[0], [articles]);
    const trendingArticles = useMemo(() => articles.slice(11, 16), [articles]);
    const mainListArticles = useMemo(() => articles.slice(1, 11).concat(articles.slice(16)), [articles]);

    return (
        <main className="dynamic-region-page">
            <section className="dynamic-region-shell">
                <div className="tabs-scroll-wrap">
                    <button className="tabs-arrow left" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
                    
                    <div className="tabs-scroll" id="tabsScroll" ref={scrollRef}>
                        <ul className="nav nav-tabs" id="topicTabs" aria-label={`${config.title} regions`}>
                            {config.subcategories.map((region) => (
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

                <div className="dynamic-content-grid">
                    <section className="dynamic-main-column" aria-live="polite">
                        {loading ? (
                            <div className="dynamic-loader">
                                <div className="dynamic-loader__spinner" />
                                <p>Loading {activeRegion} stories...</p>
                            </div>
                        ) : error ? (
                            <div className="dynamic-empty">{error}</div>
                        ) : articles.length === 0 ? (
                            <div className="dynamic-empty">
                                No stories found for {activeRegion}. Try another subcategory.
                            </div>
                        ) : (
                            <>
                                {fallbackNotice && (
                                    <div className="dynamic-fallback-note">{fallbackNotice}</div>
                                )}

                                {heroArticle && (
                                    <Link to={`/article/${heroArticle._id}`}   className="dynamic-hero-card">
                                        <div className="dynamic-hero-card__image-wrap" style={!heroArticle.image || failedImages.has(heroArticle.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                                            {heroArticle.image && !failedImages.has(heroArticle.image) ? (
                                                <img src={heroArticle.image} alt={heroArticle.title} className="dynamic-hero-card__image" onError={() => handleImageError(heroArticle)} />
                                            ) : (
                                                <div className="dynamic-hero-card__placeholder" />
                                            )}

                                            <div className="dynamic-hero-card__overlay">
                                                <div className={`dynamic-badge ${activeRegion.length > 12 ? 'small' : ''}`}>
                                                    {activeRegion === 'All Stories' ? config.title.toUpperCase() : activeRegion}
                                                </div>
                                                <h1 className="dynamic-hero-card__title">{heroArticle.title}</h1>
                                                {heroArticle.description && <p className="dynamic-hero-card__desc">{heroArticle.description}</p>}
                                                <div className="dynamic-story-item__meta">
                                                    <span><UilClock className="meta-icon" />{timeAgo(heroArticle.publishedAt)}</span>
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                    <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                <div className="dynamic-story-list">
                                    {mainListArticles.map((article, index) => (
                                        <Link key={`${article.title}-${index}`} to={`/article/${article._id}`}   className="dynamic-story-item">
                                            <div className="dynamic-story-item__thumb-wrap" style={!article.image || failedImages.has(article.image) ? { background: 'linear-gradient(135deg, #e8e8e8, #f0f0f0)' } : undefined}>
                                                {article.image && !failedImages.has(article.image) ? (
                                                    <img src={article.image} alt={article.title} className="dynamic-story-item__thumb" onError={() => handleImageError(article)} />
                                                ) : (
                                                    <div className="dynamic-story-item__thumb-placeholder" />
                                                )}
                                            </div>
                                            <div className="dynamic-story-item__content">
                                                <h2 className="dynamic-story-item__title">{article.title}</h2>
                                                {article.description && <p className="dynamic-story-item__desc">{article.description}</p>}
                                                <div className="dynamic-story-item__meta">
                                                    <span><UilClock className="meta-icon" />{timeAgo(article.publishedAt)}</span>
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                    <span><UilCommentAlt className="meta-icon" />0 Comments</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Infinite Scroll Load More target */}
                                <div ref={observerTarget} className="infinite-scroll-loading" style={{ margin: '30px 0', textAlign: 'center' }}>
                                    {loadingMore && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <div className="dynamic-loader__spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }} />
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
                        <aside className="dynamic-sidebar">
                            <section className="dynamic-sidebar-section">
                                <h3 className="dynamic-sidebar-section__header">Trending in {config.title}</h3>
                                <div className="dynamic-trending-list">
                                    {trendingArticles.map((article, idx) => (
                                        idx === 0 ? (
                                            <Link key={idx} to={`/article/${article._id}`} className="dynamic-trending-item-top"  >
                                                <div className="dynamic-trending-item-top__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                                                    {article.image && !failedImages.has(article.image) && (
                                                        <img src={article.image} className="dynamic-trending-item-top__image" onError={() => handleImageError(article)} />
                                                    )}
                                                </div>
                                                <span className="dynamic-trending-rank">#{idx + 1} Trending</span>
                                                <h4 className="dynamic-trending-item-top__title">{article.title}</h4>
                                                <div className="dynamic-story-item__meta">
                                                    <span><UilEye className="meta-icon" />0 Views</span>
                                                </div>
                                            </Link>
                                        ) : (
                                            <Link key={idx} to={`/article/${article._id}`} className="dynamic-trending-item-small"  >
                                                <div className="dynamic-trending-item-small__image-wrap" style={!article.image || failedImages.has(article.image) ? { background: '#f5f5f5' } : undefined}>
                                                    {article.image && !failedImages.has(article.image) && (
                                                        <img src={article.image} className="dynamic-trending-item-small__image" onError={() => handleImageError(article)} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="dynamic-trending-rank">#{idx + 1} Trending</span>
                                                    <h4 className="dynamic-trending-item-small__title">{article.title}</h4>
                                                </div>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </section>

                            <div className="dynamic-sidebar-ad">
                                <div className="dynamic-sidebar-ad__label">Advertisement</div>
                                <img src="https://placehold.co/300x300/1e2227/ffffff?text=Tonight,+I'll+be+eating...&font=montserrat" alt="Ad" className="dynamic-sidebar-ad__img" />
                            </div>
                        </aside>
                    )}
                </div>
            </section>
        </main>
    );
}
