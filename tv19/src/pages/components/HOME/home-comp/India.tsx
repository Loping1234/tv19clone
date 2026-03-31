import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/India.css';
import { getIndia, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const India: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchIndia = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getIndia('india', 10);

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
        fetchIndia();
        const interval = setInterval(fetchIndia, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchIndia]);

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
            <div className="India-page">
                <div className="India-loading">
                    <div className="India-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="India-page">
            <section className="India-section">
                <div className="India-section__header">
                    <h3 className="India-section__heading">INDIA</h3>
                    <Link to="/india" className="India-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="India-grid">
                    {/* Left: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'india'}/${slugify(heroArticle.title)}`}
                        className="India-hero"
                    >
                        <div className="India-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="india"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="India-hero__body">
                            
                            <h3 className="India-hero__title">{heroArticle.title}</h3>
                            <p className="India-hero__desc">{heroArticle.description}</p>
                            <span className="India-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="India-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'india'}/${slugify(article.title)}`}
                                className="India-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="india"
                                    articleUrl={article.url}
                                    className="India-list__thumb"
                                />
                                <div className="India-list__info">
                                    <h4 className="India-list__title">{article.title}</h4>
                                    <span className="India-list__meta">
                                        <span className="source">INDIA</span>
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

export default India;
