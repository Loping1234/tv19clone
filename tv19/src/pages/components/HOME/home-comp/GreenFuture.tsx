import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/GreenFuture.css';
import { getGreenFuture, type Article } from '../../../../services/newsService';
import { timeAgo } from '../../../../utils/timeAgo';
import '@fortawesome/fontawesome-free/css/all.min.css';

const GreenFuture: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGreenFuture = useCallback(async () => {
        try {
            setLoading(true);
            // Use 'environment' category for Green Future
            const response = await getGreenFuture('environment', 'in', 10);

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
        const interval = setInterval(fetchGreenFuture, 180000);
        return () => clearInterval(interval);
    }, [fetchGreenFuture]);



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
                    <h3 className="Green-Future-section__heading">GREEN FUTURE</h3>
                    <Link to="/category/green-future" className="Green-Future-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Green-Future-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Green-Future-hero"
                    >
                        <div className="Green-Future-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Green-Future-hero__placeholder" />
                            )}
                            <span className="Green-Future-hero__badge">{heroArticle.source || 'GREEN FUTURE'}</span>
                        </div>
                        <div className="Green-Future-hero__body">
                            <span className="Green-Future-hero__category">GREEN FUTURE</span>
                            <h3 className="Green-Future-hero__title">{heroArticle.title}</h3>
                            <p className="Green-Future-hero__desc">{heroArticle.description}</p>
                            <span className="Green-Future-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Green-Future-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Green-Future-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Green-Future-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Green-Future-list__thumb-placeholder" />
                                )}
                                <div className="Green-Future-list__info">
                                    <h4 className="Green-Future-list__title">{article.title}</h4>
                                    <span className="Green-Future-list__meta">
                                        <span className="source">GREEN FUTURE</span>
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
