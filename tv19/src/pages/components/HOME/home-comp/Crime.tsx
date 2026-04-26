import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Crime.css';
import { getCrime, type Article } from '../../../../services/newsService';
import { timeAgo } from '../../../../utils/timeAgo';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Crime: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCrimeNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCrime('crime', 'in', 10);

            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // 1 hero + up to 5 list items = 6
            setArticles(unique.slice(0, 6));
        } catch (err) {
            console.error('Error fetching Crime news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCrimeNews();
        const interval = setInterval(fetchCrimeNews, 180000);
        return () => clearInterval(interval);
    }, [fetchCrimeNews]);



    if (loading) {
        return (
            <div className="Crime-page">
                <div className="Crime-loading">
                    <div className="Crime-spinner" />
                    <p>Loading Crime news...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Crime-page">
            <section className="Crime-section">
                <div className="Crime-section__header">
                    <h3 className="Crime-section__heading">Crime</h3>
                    <Link to="/category/crime" className="Crime-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Crime-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Crime-hero"
                    >
                        <div className="Crime-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Crime-hero__placeholder" />
                            )}
                            <span className="Crime-hero__badge">{heroArticle.source || 'CRIME'}</span>
                        </div>
                        <div className="Crime-hero__body">
                            <span className="Crime-hero__category">Crime</span>
                            <h3 className="Crime-hero__title">{heroArticle.title}</h3>
                            <p className="Crime-hero__desc">{heroArticle.description}</p>
                            <span className="Crime-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Crime-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Crime-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Crime-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Crime-list__thumb-placeholder" />
                                )}
                                <div className="Crime-list__info">
                                    <h4 className="Crime-list__title">{article.title}</h4>
                                    <span className="Crime-list__meta">
                                        <span className="source">Crime</span>
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

export default Crime;
