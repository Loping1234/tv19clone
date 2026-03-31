import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Rajasthan.css';
import { getStateNews, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Rajasthan: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRajasthan = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getStateNews('Rajasthan', 20);
            const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
            const fresh = response.articles
                .filter(a => new Date(a.publishedAt).getTime() > twoDaysAgo)
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            const withImages = fresh.filter(a => a.image);
            const pool = withImages.length >= 6 ? withImages : fresh;
            const unique = pool.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );
            setArticles(unique.slice(0, 10));
        } catch (err) {
            console.error('Error fetching state stories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRajasthan();
        const interval = setInterval(fetchRajasthan, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchRajasthan]);

    const timeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
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

    const heroArticle = articles[0];
    const midArticles = articles.slice(1, 6);   // 5 text items in middle
    const rightArticles = articles.slice(6, 10); // 4 items on right (some with thumb)

    return (
        <div className="raj-page">
            <section className="raj-section">
                {/* ── Section header ── */}
                <div className="raj-header">
                    <h3 className="raj-heading">STATE</h3>
                    <Link to="/state" className="raj-more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="raj-grid">
                    {/* ── Left: Big Hero ── */}
                    <Link
                        to={`/article/${heroArticle.category || 'rajasthan'}/${slugify(heroArticle.title)}`}
                        className="raj-hero"
                    >
                        <div className="raj-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="rajasthan"
                                articleUrl={heroArticle.url}
                            />
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
                    <div className="raj-mid">
                        {midArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'rajasthan'}/${slugify(article.title)}`}
                                className="raj-mid__item"
                            >
                                <h4 className="raj-mid__title">{article.title}</h4>
                                <span className="raj-mid__time">{timeAgo(article.publishedAt)}</span>
                            </Link>
                        ))}
                    </div>

                    {/* ── Right: Mix of thumb+text articles ── */}
                    <div className="raj-right">
                        {rightArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'rajasthan'}/${slugify(article.title)}`}
                                className="raj-right__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="rajasthan"
                                    articleUrl={article.url}
                                    className="raj-right__thumb"
                                />
                                <div className="raj-right__info">
                                    <h4 className="raj-right__title">{article.title}</h4>
                                    <span className="raj-right__time">{timeAgo(article.publishedAt)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Rajasthan;
