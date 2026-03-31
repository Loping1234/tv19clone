import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/World.css';
import { getWorld, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const World: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchWorld = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getWorld('world', 'in', 10);

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
        fetchWorld();
        const interval = setInterval(fetchWorld, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchWorld]);

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
            <div className="World-page">
                <div className="World-loading">
                    <div className="World-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="World-page">
            <section className="World-section">
                <div className="World-section__header">
                    <h3 className="World-section__heading">World</h3>
                    <Link to="/world" className="World-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="World-grid">             
                    {/* Left: List with thumbnails */}
                    <div className="World-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'world'}/${slugify(article.title)}`}
                                className="World-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="world"
                                    articleUrl={article.url}
                                    className="World-list__thumb"
                                />
                                <div className="World-list__info">
                                    <h4 className="World-list__title">{article.title}</h4>
                                    <span className="World-list__meta">
                                        <span className="source">World</span>
                                        • {timeAgo(article.publishedAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {/* Right: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'world'}/${slugify(heroArticle.title)}`}
                        className="World-hero"
                    >
                        <div className="World-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="world"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="World-hero__body">
                            
                            <h3 className="World-hero__title">{heroArticle.title}</h3>
                            <p className="World-hero__desc">{heroArticle.description}</p>
                            <span className="World-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default World;
