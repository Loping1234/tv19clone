import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Lifestyle.css';
import { getLifestyle, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Lifestyle: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchLifestyle = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getLifestyle('lifestyle', 10);

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
        fetchLifestyle();
        const interval = setInterval(fetchLifestyle, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchLifestyle]);

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
            <div className="Lifestyle-page">
                <div className="Lifestyle-loading">
                    <div className="Lifestyle-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Lifestyle-page">
            <section className="Lifestyle-section">
                <div className="Lifestyle-section__header">
                    <h3 className="Lifestyle-section__heading">Lifestyle</h3>
                    <Link to="/lifestyle" className="Lifestyle-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Lifestyle-grid">
                    {/* Left: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'lifestyle'}/${slugify(heroArticle.title)}`}
                        className="Lifestyle-hero"
                    >
                        <div className="Lifestyle-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="lifestyle"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="Lifestyle-hero__body">
                            <span className="Lifestyle-hero__category">Lifestyle</span>
                            <h3 className="Lifestyle-hero__title">{heroArticle.title}</h3>
                            <p className="Lifestyle-hero__desc">{heroArticle.description}</p>
                            <span className="Lifestyle-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Lifestyle-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'lifestyle'}/${slugify(article.title)}`}
                                className="Lifestyle-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="lifestyle"
                                    articleUrl={article.url}
                                    className="Lifestyle-list__thumb"
                                />
                                <div className="Lifestyle-list__info">
                                    <h4 className="Lifestyle-list__title">{article.title}</h4>
                                    <span className="Lifestyle-list__meta">
                                        <span className="source">Lifestyle</span>
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

export default Lifestyle;
