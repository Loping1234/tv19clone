import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Education.css';
import { getEducation, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Education: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchEducation = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getEducation('education', 10);

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
        fetchEducation();
        const interval = setInterval(fetchEducation, 180000);
        return () => clearInterval(interval);
    }, [fetchEducation]);

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
            <div className="Education-page">
                <div className="Education-loading">
                    <div className="Education-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Education-page">
            <section className="Education-section">
                <div className="Education-section__header">
                    <h3 className="Education-section__heading">Education</h3>
                    <a href="#" className="Education-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="Education-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}
                        
                        
                        className="Education-hero"
                    >
                        <div className="Education-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="Education-hero__placeholder" />
                            )}
                        </div>
                        <div className="Education-hero__body">
                            <span className="Education-hero__category">Education</span>
                            <h3 className="Education-hero__title">{heroArticle.title}</h3>
                            <p className="Education-hero__desc">{heroArticle.description}</p>
                            <span className="Education-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Education-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}
                                
                                
                                className="Education-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="Education-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="Education-list__thumb-placeholder" />
                                )}
                                <div className="Education-list__info">
                                    <h4 className="Education-list__title">{article.title}</h4>
                                    <span className="Education-list__meta">
                                        <span className="source">Education</span>
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

export default Education;
