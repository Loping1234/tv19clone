import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Sports.css';
import { getSports, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Sports: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSportsNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getSports('sports', 'in', 15);

            // Deduplicate by title
            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // We need: 4 left + 1 hero + 4 right = 9 articles
            setArticles(unique.slice(0, 9));
        } catch (err) {
            console.error('Error fetching Sports news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSportsNews();
        const interval = setInterval(fetchSportsNews, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchSportsNews]);

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
            <div className="Sports-page">
                <div className="Sports-loading">
                    <div className="Sports-spinner" />
                    <p>Loading Sports news...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    // Split articles into: left list (0-3), hero (4), right list (5-8)
    const leftArticles = articles.slice(0, 4);
    const heroArticle = articles[4] || articles[0]; // fallback
    const rightArticles = articles.slice(5, 9);

    const renderSideItem = (article: Article, idx: number) => (
        <Link
            key={idx}
            to={`/article/${article.category || 'sports'}/${slugify(article.title)}`}
            className="Sports-side-item"
        >
            <NewsImage 
                src={article.image} 
                alt={article.title} 
                category="sports"
                articleUrl={article.url}
                className="Sports-side-thumb"
            />
            <div className="Sports-side-info">
                <h4 className="Sports-side-title">{article.title}</h4>
                <span className="Sports-side-meta">
                    <span className="source">{article.source}</span>
                    • {timeAgo(article.publishedAt)}
                </span>
            </div>
        </Link>
    );

    return (
        <div className="Sports-page">
            <section className="Sports-section">
                <div className="Sports-section__header">
                    <h3 className="Sports-section__heading">Sports</h3>
                    <Link to="/sports" className="Sports-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Sports-grid">
                    {/* Right column: hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'sports'}/${slugify(heroArticle.title)}`}
                        className="Sports-hero"
                    >
                        <div className="Sports-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="sports"
                                articleUrl={heroArticle.url}
                            />
                            <span className="Sports-hero__badge">{heroArticle.source}</span>
                        </div>
                        <div className="Sports-hero__body">
                            <div>
                                <span className="Sports-hero__category">Sports</span>
                                <h3 className="Sports-hero__title">{heroArticle.title}</h3>
                            </div>
                            <span className="Sports-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>
                    {/* Left column: list with thumbnails */}
                    <div className="Sports-side-list">
                        {leftArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    

                    {/* Center column: list with thumbnails */}
                    <div className="Sports-side-list">
                        {rightArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    
                </div>
            </section>
        </div>
    );
};

export default Sports;
