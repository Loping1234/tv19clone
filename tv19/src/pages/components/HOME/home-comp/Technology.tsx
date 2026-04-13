import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Technology.css';
import { getTechnology, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Technology: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchTechnology = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTechnology('technology', 10);

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
        fetchTechnology();
        const interval = setInterval(fetchTechnology, 180000);
        return () => clearInterval(interval);
    }, [fetchTechnology]);

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
            <div className="Technology-page">
                <div className="Technology-loading">
                    <div className="Technology-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Technology-page">
            <section className="Technology-section">
                <div className="Technology-section__header">
                    <h3 className="Technology-section__heading">Technology</h3>
                    <a href="#" className="Technology-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="Technology-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Technology-hero"
                    >
                        <div className="Technology-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Technology-hero__placeholder" />
                            )}
                        </div>
                        <div className="Technology-hero__body">
                            <span className="Technology-hero__category">Technology</span>
                            <h3 className="Technology-hero__title">{heroArticle.title}</h3>
                            <p className="Technology-hero__desc">{heroArticle.description}</p>
                            <span className="Technology-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Technology-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Technology-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Technology-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Technology-list__thumb-placeholder" />
                                )}
                                <div className="Technology-list__info">
                                    <h4 className="Technology-list__title">{article.title}</h4>
                                    <span className="Technology-list__meta">
                                        <span className="source">Technology</span>
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

export default Technology;
