import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Rajasthan.css';
import { getStateNews, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Rajasthan: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRajasthan = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getStateNews('Rajasthan', 10);
            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );
            // 1 hero + up to 5 mid + up to 4 right = 10
            setArticles(unique.slice(0, 10));
        } catch (err) {
            console.error('Error fetching state stories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRajasthan();
        const interval = setInterval(fetchRajasthan, 180000);
        return () => clearInterval(interval);
    }, [fetchRajasthan]);

    const timeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return '1d ago';
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="raj-page">
                <div className="raj-loading">
                    <div className="raj-spinner" />
                    <p>Loading state stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    // Gracefully handle partial data
    const heroArticle = articles[0];
    const midArticles = articles.slice(1, 6);   // up to 5 text items in middle
    const rightArticles = articles.slice(6, 10); // up to 4 items on right (some with thumb)

    // Derive a short location label from source or fallback
    const getLocationLabel = (article: Article) => {
        let label = article.source || 'RAJASTHAN';
        if (label.toLowerCase() === 'google news') return 'RAJASTHAN';
        if (label.length > 20) return label.substring(0, 17) + '...';
        return label.toUpperCase();
    };

    return (
        <div className="raj-page">
            <section className="raj-section">
                {/* ── Section header ── */}
                <div className="raj-header">
                    <h3 className="raj-heading">STATE</h3>
                    <a href="#" className="raj-more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="raj-grid">
                    {/* ── Left: Big Hero ── */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="raj-hero"
                    >
                        <div className="raj-hero__img">
                            {heroArticle.image ? (
                                <img
                                    src={heroArticle.image}
                                    alt={heroArticle.title}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            'https://placehold.co/500x320/cccccc/555555?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="raj-hero__placeholder" />
                            )}
                            {/* Source badge overlaid on image */}
                            <span className="raj-hero__badge">{getLocationLabel(heroArticle)}</span>
                        </div>
                        <div className="raj-hero__body">
                            <h2 className="raj-hero__title">{heroArticle.title}</h2>
                            {heroArticle.description && (
                                <p className="raj-hero__desc">{heroArticle.description}</p>
                            )}
                            <span className="raj-hero__meta">
                                STATE • {timeAgo(heroArticle.publishedAt)}
                            </span>
                        </div>
                    </Link>

                    {/* ── Middle: Text-list articles with location tags ── */}
                    {midArticles.length > 0 && (
                        <div className="raj-mid">
                            {midArticles.map((article, idx) => (
                                <Link key={idx} to={`/article/${article._id}`}
                                    className="raj-mid__item"
                                >
                                    <span className="raj-mid__location">{getLocationLabel(article)}</span>
                                    <h4 className="raj-mid__title">{article.title}</h4>
                                    <span className="raj-mid__time">{timeAgo(article.publishedAt)}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* ── Right: Mix of thumb+text articles ── */}
                    {rightArticles.length > 0 && (
                        <div className="raj-right">
                            {rightArticles.map((article, idx) => (
                                <Link key={idx} to={`/article/${article._id}`}
                                    className="raj-right__item"
                                >
                                    {/* Show thumbnail for even-indexed items */}
                                    {article.image && idx % 2 === 1 ? (
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="raj-right__thumb"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : null}
                                    <div className="raj-right__info">
                                        <h4 className="raj-right__title">{article.title}</h4>
                                        <span className="raj-right__time">{timeAgo(article.publishedAt)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Rajasthan;
