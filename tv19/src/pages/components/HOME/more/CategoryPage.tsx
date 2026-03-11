import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../../css/HOME/CategoryPage.css';
import { getNews, getCategoryCounts, type Article, type NewsCategory } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

/* ── All available categories for the sidebar ── */
const ALL_CATEGORIES: { label: string; slug: NewsCategory }[] = [
    { label: 'Arts', slug: 'arts' },
    { label: 'Astrology', slug: 'astrology' },
    { label: 'Business', slug: 'business' },
    { label: 'Crime', slug: 'crime' },
    { label: 'Education', slug: 'education' },
    { label: 'Entertainment', slug: 'entertainment' },
    { label: 'Finance', slug: 'finance' },
    { label: 'Green Future', slug: 'green-future' },
    { label: 'India', slug: 'india' },
    { label: 'Lifestyle', slug: 'lifestyle' },
    { label: 'Opinion', slug: 'opinion' },
    { label: 'Politics', slug: 'politics' },
    { label: 'Sports', slug: 'sports' },
    { label: 'State', slug: 'rajasthan' },
    { label: 'Technology', slug: 'technology' },
    { label: 'Weather', slug: 'weather' },
    { label: 'World', slug: 'world' },
];

/* ── Quick nav bar categories ── */
const MENU_CATEGORIES: { label: string; slug: string }[] = [
    { label: 'Home', slug: '' },
    { label: 'State', slug: 'rajasthan' },
    { label: 'India', slug: 'india' },
    { label: 'World', slug: 'world' },
    { label: 'Highlights', slug: 'trending' },
    { label: 'Sports', slug: 'sports' },
    { label: 'Politics', slug: 'politics' },
    { label: 'Business', slug: 'business' },
    { label: 'Astrology', slug: 'astrology' },
    { label: 'Entertainment', slug: 'entertainment' },
    { label: 'Technology', slug: 'technology' },
    { label: 'Lifestyle', slug: 'lifestyle' },
    { label: 'Education', slug: 'education' },
    { label: 'Arts', slug: 'arts' },
];

/* ── Popular search tags ── */
const POPULAR_TAGS = ['Astrology', 'World', 'India', 'Politics'];

const CategoryPage: React.FC = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const observerTarget = useRef<HTMLDivElement>(null);
    const currentSlug = (categorySlug || 'top') as NewsCategory;

    /* ── Label for the current category ── */
    const getCategoryLabel = (slug: string): string => {
        if (slug === 'top') return 'Top Stories';
        if (slug === 'trending') return 'Highlights';
        const cat = ALL_CATEGORIES.find((c) => c.slug === slug);
        return cat ? cat.label : slug.charAt(0).toUpperCase() + slug.slice(1);
    };

    /* ── Fetch news for this category ── */
    const fetchCategoryNews = useCallback(async (pageNum: number) => {
        try {
            if (pageNum === 0) setLoading(true);
            else setLoadingMore(true);

            // Fetch in chunks of 20
            const response = await getNews(currentSlug, 20, false, pageNum * 20);
            
            if (response.articles.length < 20) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (pageNum === 0) {
                setArticles(response.articles);
            } else {
                setArticles(prev => {
                    const combined = [...prev, ...response.articles];
                    // Deduplicate by URL
                    return combined.filter((a, i, arr) => 
                        arr.findIndex((b) => b.url === a.url) === i
                    );
                });
            }
        } catch (err) {
            console.error('Error fetching category news:', err);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [currentSlug]);

    /* ── Fetch counts for every category in sidebar ── */
    const fetchCategoryCounts = useCallback(async () => {
        try {
            const res = await getCategoryCounts();
            setCategoryCounts(res.categoryCounts);
        } catch (err) {
            console.error('Error fetching category counts:', err);
        }
    }, []);

    // Initial load and category change
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchCategoryNews(0);
        fetchCategoryCounts();
    }, [currentSlug, fetchCategoryNews, fetchCategoryCounts]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchCategoryNews(nextPage);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, fetchCategoryNews]);

    /* ── Scroll to top on category change ── */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentSlug]);

    /* ── Time ago helper ── */
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

    /* ── Format date ── */
    const formatDate = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    /* ── Total count across all categories ── */
    const totalArticles = Object.values(categoryCounts).reduce(
        (sum, c) => sum + c,
        0
    );

    return (
        <div className="category-page">
            <div className="category-breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">
                    <i className="fas fa-chevron-right"></i>
                </span>
                <span>{getCategoryLabel(currentSlug)}</span>
            </div>

            <div className="category-layout">
                <div className="category-feed">
                    <div className="category-feed-header">
                        <h1 className="category-feed-title">
                            {getCategoryLabel(currentSlug)}
                        </h1>
                        {!loading && (
                            <span className="category-feed-count">
                                {articles.length} article{articles.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="category-menu-bar">
                        {MENU_CATEGORIES.map((item) =>
                            item.slug === '' ? (
                                <Link
                                    key={item.label}
                                    to="/"
                                    className={currentSlug === 'top' ? 'active' : ''}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <Link
                                    key={item.label}
                                    to={`/category/${item.slug}`}
                                    className={currentSlug === item.slug ? 'active' : ''}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                    </div>

                    {loading ? (
                        <div className="category-loading">
                            <div className="category-spinner" />
                            <p>Loading {getCategoryLabel(currentSlug)} news…</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="category-empty">
                            <i className="fas fa-newspaper"></i>
                            <p>No articles found for this category.</p>
                        </div>
                    ) : (
                        <>
                            {articles.map((article, index) => (
                                <a
                                    key={index}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="category-article"
                                >
                                    <div className="category-article-thumb">
                                        <img
                                            src={
                                                article.image ||
                                                'https://via.placeholder.com/220x140?text=TV19'
                                            }
                                            alt={article.title}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://via.placeholder.com/220x140?text=TV19';
                                            }}
                                        />
                                    </div>
                                    <div className="category-article-body">
                                        <div className="category-article-badge">
                                            <span className="badge-tag">
                                                {article.source || getCategoryLabel(currentSlug)}
                                            </span>
                                            <span className="badge-time">
                                                {timeAgo(article.publishedAt)}
                                            </span>
                                        </div>
                                        <h2 className="category-article-title">{article.title}</h2>
                                        {article.description && (
                                            <p className="category-article-desc">
                                                {article.description}
                                            </p>
                                        )}
                                        <div className="category-article-meta">
                                            <span className="meta-source">{article.source}</span>
                                            <span className="meta-dot">•</span>
                                            <span>{formatDate(article.publishedAt)}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                            
                            {/* Infinite Scroll Load More target */}
                            <div ref={observerTarget} className="infinite-scroll-loading">
                                {loadingMore && (
                                    <div className="category-loading row-loading">
                                        <div className="category-spinner small" />
                                        <p>Loading more stories…</p>
                                    </div>
                                )}
                                {!hasMore && articles.length > 0 && (
                                    <div className="end-of-news">
                                        <div className="divider" />
                                        <p>You've reached the end of today's news.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <aside className="category-sidebar">
                    <div className="sidebar-categories">
                        <div className="sidebar-categories-header">
                            <h4>
                                <i className="fas fa-check-circle"></i> All Categories
                            </h4>
                            <span className="cat-total">{totalArticles || '…'}</span>
                        </div>
                        <ul className="sidebar-categories-list">
                            {ALL_CATEGORIES.map((cat) => (
                                <li key={cat.slug}>
                                    <Link
                                        to={`/category/${cat.slug}`}
                                        className={`sidebar-cat-link ${currentSlug === cat.slug ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-caret-right cat-icon"></i>
                                        <span className="cat-name">{cat.label}</span>
                                        <span className="cat-count">
                                            {categoryCounts[cat.slug] ?? '…'}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-popular">
                        <h4>
                            <i className="fas fa-fire"></i> Popular Searches
                        </h4>
                        <div className="popular-tags">
                            {POPULAR_TAGS.map((tag) => {
                                const matchedCat = ALL_CATEGORIES.find(
                                    (c) => c.label.toLowerCase() === tag.toLowerCase()
                                );
                                return matchedCat ? (
                                    <Link
                                        key={tag}
                                        to={`/category/${matchedCat.slug}`}
                                        className="popular-tag"
                                    >
                                        {tag}
                                    </Link>
                                ) : (
                                    <span key={tag} className="popular-tag">
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CategoryPage;
