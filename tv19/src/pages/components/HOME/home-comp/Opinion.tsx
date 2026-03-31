import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Opinion.css';
import { getOpinion, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
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
        const interval = setInterval(fetchOpinion, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchOpinion]);

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
                    <Link to="/opinion" className="Opinion-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Opinion-grid">
                    {/* Left: Hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'opinion'}/${slugify(heroArticle.title)}`}
                        className="Opinion-hero"
                    >
                        <div className="Opinion-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="opinion"
                                articleUrl={heroArticle.url}
                            />
                        </div>
                        <div className="Opinion-hero__body">
                            
                            <h3 className="Opinion-hero__title">{heroArticle.title}</h3>
                            <p className="Opinion-hero__desc">{heroArticle.description}</p>
                            <span className="Opinion-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Opinion-list">
                        {listArticles.map((article, idx) => (
                            <Link
                                key={idx}
                                to={`/article/${article.category || 'opinion'}/${slugify(article.title)}`}
                                className="Opinion-list__item"
                            >
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="opinion"
                                    articleUrl={article.url}
                                    className="Opinion-list__thumb"
                                />
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
