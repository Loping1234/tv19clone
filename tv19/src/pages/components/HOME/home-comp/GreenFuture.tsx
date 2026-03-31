import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/GreenFuture.css';
import { getTopHeadlines, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const GreenFuture: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGreenFuture = useCallback(async () => {
        try {
            setLoading(true);
            // Use 'environment' category for Green Future
            const response = await getTopHeadlines('environment', 'in', 10);

            const unique = response.articles.filter(
                (a: Article, i: number, arr: Article[]) => arr.findIndex((b: Article) => b.title === a.title) === i
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
        fetchGreenFuture();
        const interval = setInterval(fetchGreenFuture, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchGreenFuture]);

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
            <div className="Green-Future-page">
                <div className="Green-Future-loading">
                    <div className="Green-Future-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Green-Future-page">
            <section className="Green-Future-section">
                <div className="Green-Future-section__header">
                    <h3 className="Green-Future-section__heading">TRENDING STORIES</h3>
                    <Link to="/green-future" className="Green-Future-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Green-Future-grid">
                    {/* Left: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'environment'}/${slugify(heroArticle.title)}`}
                        className="Green-Future-hero"
                    >
                        <div className="Green-Future-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="general"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="Green-Future-hero__body">
                            
                            <h3 className="Green-Future-hero__title">{heroArticle.title}</h3>
                            <p className="Green-Future-hero__desc">{heroArticle.description}</p>
                            <span className="Green-Future-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Green-Future-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'environment'}/${slugify(article.title)}`}
                                className="Green-Future-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="general"
                                    articleUrl={article.url}
                                    className="Green-Future-list__thumb"
                                />
                                <div className="Green-Future-list__info">
                                    <h4 className="Green-Future-list__title">{article.title}</h4>
                                    <span className="Green-Future-list__meta">
                                        <span className="source">TRENDING</span>
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

export default GreenFuture;
