import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Politics.css';
import { getPolitics, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Politics: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchPolitics = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPolitics('politics', 10);

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
        fetchPolitics();
        const interval = setInterval(fetchPolitics, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchPolitics]);

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
            <div className="Politics-page">
                <div className="Politics-loading">
                    <div className="Politics-spinner" />
                    <p>Loading Politics News...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Politics-page">
            <section className="Politics-section">
                <div className="Politics-section__header">
                    <h3 className="Politics-section__heading">Politics</h3>
                    <Link to="/politics" className="Politics-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Politics-grid">             
                    {/* Left: List with thumbnails */}
                    <div className="Politics-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'politics'}/${slugify(article.title)}`}
                                className="Politics-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="politics"
                                    articleUrl={article.url}
                                    className="Politics-list__thumb"
                                />
                                <div className="Politics-list__info">
                                    <h4 className="Politics-list__title">{article.title}</h4>
                                    <span className="Politics-list__meta">
                                        <span className="source">Politics</span>
                                        • {timeAgo(article.publishedAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {/* Right: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'politics'}/${slugify(heroArticle.title)}`}
                        className="Politics-hero"
                    >
                        <div className="Politics-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="politics"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="Politics-hero__body">
                            
                            <h3 className="Politics-hero__title">{heroArticle.title}</h3>
                            <p className="Politics-hero__desc">{heroArticle.description}</p>
                            <span className="Politics-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Politics;
