import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Politics.css';
import { getPolitics, type Article } from '../../../../services/newsService';
import { timeAgo } from '../../../../utils/timeAgo';
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
        const interval = setInterval(fetchPolitics, 180000);
        return () => clearInterval(interval);
    }, [fetchPolitics]);



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
                    <Link to="/category/politics" className="Politics-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Politics-grid">             
                    {/* Left: List with thumbnails */}
                    <div className="Politics-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Politics-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Politics-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Politics-list__thumb-placeholder" />
                                )}
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
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Politics-hero"
                    >
                        <div className="Politics-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Politics-hero__placeholder" />
                            )}
                            <span className="Politics-hero__badge">{heroArticle.source || 'POLITICS'}</span>
                        </div>
                        <div className="Politics-hero__body">
                            <span className="Politics-hero__category">Politics</span>
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
