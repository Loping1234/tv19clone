import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Astrology.css';
import { getAstrology, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Astrology: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchAstrology = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAstrology('astrology', 'in', 10);

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
        fetchAstrology();
        const interval = setInterval(fetchAstrology, 180000);
        return () => clearInterval(interval);
    }, [fetchAstrology]);

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
            <div className="Astrology-page">
                <div className="Astrology-loading">
                    <div className="Astrology-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Astrology-page">
            <section className="Astrology-section">
                <div className="Astrology-section__header">
                    <h3 className="Astrology-section__heading">Astrology</h3>
                    <a href="#" className="Astrology-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="Astrology-grid">
                    {/* Left: Hero article */}
                    <a
                        href={heroArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="Astrology-hero"
                    >
                        <div className="Astrology-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Astrology-hero__placeholder" />
                            )}
                        </div>
                        <div className="Astrology-hero__body">
                            <span className="Astrology-hero__category">Astrology</span>
                            <h3 className="Astrology-hero__title">{heroArticle.title}</h3>
                            <p className="Astrology-hero__desc">{heroArticle.description}</p>
                            <span className="Astrology-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </a>

                    {/* Right: List with thumbnails */}
                    <div className="Astrology-list">
                        {listArticles.map((article, idx) => (
                            <a
                                key={idx}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="Astrology-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Astrology-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Astrology-list__thumb-placeholder" />
                                )}
                                <div className="Astrology-list__info">
                                    <h4 className="Astrology-list__title">{article.title}</h4>
                                    <span className="Astrology-list__meta">
                                        <span className="source">Astrology</span>
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

export default Astrology;
