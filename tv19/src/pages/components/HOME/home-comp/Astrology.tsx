import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Astrology.css';
import { getAstrology, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
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
        const interval = setInterval(fetchAstrology, 1800000); // 30 minutes
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
                    <Link to="/astrology" className="Astrology-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Astrology-grid">
                    {/* Left: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'astrology'}/${slugify(heroArticle.title)}`}
                        className="Astrology-hero"
                    >
                        <div className="Astrology-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="astrology"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="Astrology-hero__body">
                            
                            <h3 className="Astrology-hero__title">{heroArticle.title}</h3>
                            <p className="Astrology-hero__desc">{heroArticle.description}</p>
                            <span className="Astrology-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Astrology-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'astrology'}/${slugify(article.title)}`}
                                className="Astrology-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="astrology"
                                    articleUrl={article.url}
                                    className="Astrology-list__thumb"
                                />
                                <div className="Astrology-list__info">
                                    <h4 className="Astrology-list__title">{article.title}</h4>
                                    <span className="Astrology-list__meta">
                                        <span className="source">Astrology</span>
                                        • {timeAgo(article.publishedAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Astrology;
