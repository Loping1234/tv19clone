import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Opinion.css';
import { getOpinion, type Article } from '../../../../services/newsService';
import { timeAgo } from '../../../../utils/timeAgo';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Opinion: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchOpinion = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getOpinion('opinion', 'in', 10);

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
        fetchOpinion();
        const interval = setInterval(fetchOpinion, 180000);
        return () => clearInterval(interval);
    }, [fetchOpinion]);



    if (loading) {
        return (
            <div className="Opinion-page">
                <div className="Opinion-loading">
                    <div className="Opinion-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Opinion-page">
            <section className="Opinion-section">
                <div className="Opinion-section__header">
                    <h3 className="Opinion-section__heading">Opinion</h3>
                    <Link to="/category/opinion" className="Opinion-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Opinion-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Opinion-hero"
                    >
                        <div className="Opinion-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Opinion-hero__placeholder" />
                            )}
                            <span className="Opinion-hero__badge">{heroArticle.source || 'OPINION'}</span>
                        </div>
                        <div className="Opinion-hero__body">
                            <span className="Opinion-hero__category">Opinion</span>
                            <h3 className="Opinion-hero__title">{heroArticle.title}</h3>
                            <p className="Opinion-hero__desc">{heroArticle.description}</p>
                            <span className="Opinion-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Opinion-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Opinion-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Opinion-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Opinion-list__thumb-placeholder" />
                                )}
                                <div className="Opinion-list__info">
                                    <h4 className="Opinion-list__title">{article.title}</h4>
                                    <span className="Opinion-list__meta">
                                        <span className="source">Opinion</span>
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

export default Opinion;
