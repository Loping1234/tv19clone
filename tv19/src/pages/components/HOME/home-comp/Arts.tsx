import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Arts.css';
import { getArts, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Arts: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchArts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getArts('arts', 'in', 10);

            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // 1 hero + up to 5 list items = 6
            setArticles(unique.slice(0, 6));
        } catch (err) {
            console.error('Error fetching trending stories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArts();
        const interval = setInterval(fetchArts, 180000);
        return () => clearInterval(interval);
    }, [fetchArts]);

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
            <div className="Arts-page">
                <div className="Arts-loading">
                    <div className="Arts-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Arts-page">
            <section className="Arts-section">
                <div className="Arts-section__header">
                    <h3 className="Arts-section__heading">Arts</h3>
                    <a href="#" className="Arts-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="Arts-grid">
                    {/* Left: Hero article */}
                    <a
                        href={heroArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="Arts-hero"
                    >
                        <div className="Arts-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Arts-hero__placeholder" />
                            )}
                        </div>
                        <div className="Arts-hero__body">
                            <span className="Arts-hero__category">Arts</span>
                            <h3 className="Arts-hero__title">{heroArticle.title}</h3>
                            <p className="Arts-hero__desc">{heroArticle.description}</p>
                            <span className="Arts-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </a>

                    {/* Right: List with thumbnails */}
                    <div className="Arts-list">
                        {listArticles.map((article, idx) => (
                            <a
                                key={idx}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="Arts-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Arts-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Arts-list__thumb-placeholder" />
                                )}
                                <div className="Arts-list__info">
                                    <h4 className="Arts-list__title">{article.title}</h4>
                                    <span className="Arts-list__meta">
                                        <span className="source">Arts</span>
                                        • {timeAgo(article.publishedAt)}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Arts;
