import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Business.css';
import { getBusiness, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Business: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBusinessNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getBusiness('business', 25);
            const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
            const fresh = response.articles
                .filter(a => new Date(a.publishedAt).getTime() > twoDaysAgo)
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            const pool = fresh.filter(a => a.image).length >= 7 ? fresh.filter(a => a.image) : fresh;
            const unique = pool.filter((a, i, arr) => arr.findIndex((b) => b.title === a.title) === i);
            setArticles(unique.slice(0, 9));
        } catch (err) {
            console.error('Error fetching Business news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBusinessNews();
        const interval = setInterval(fetchBusinessNews, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchBusinessNews]);

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
            <div className="Business-page">
                <div className="Business-loading">
                    <div className="Business-spinner" />
                    <p>Loading Business news...</p>
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
            to={`/article/${article.category || 'business'}/${slugify(article.title)}`}
            className="Business-side-item"
        >
            <NewsImage 
                src={article.image} 
                alt={article.title} 
                category="business"
                articleUrl={article.url}
                className="Business-side-thumb"
            />
            <div className="Business-side-info">
                <h4 className="Business-side-title">{article.title}</h4>
                <span className="Business-side-meta">
                    <span className="source">{article.source}</span>
                    • {timeAgo(article.publishedAt)}
                </span>
            </div>
        </Link>
    );

    return (
        <div className="Business-page">
            <section className="Business-section">
                <div className="Business-section__header">
                    <h3 className="Business-section__heading">Business</h3>
                    <Link to="/business" className="Business-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Business-grid">
                    {/* Left column: list with thumbnails */}
                    <div className="Business-side-list">
                        {leftArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    

                    {/* Center column: list with thumbnails */}
                    <div className="Business-side-list">
                        {rightArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    {/* Right column: hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'business'}/${slugify(heroArticle.title)}`}
                        className="Business-hero"
                    >
                        <div className="Business-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="business"
                                articleUrl={heroArticle.url}
                            />
                            
                        </div>
                        <div className="Business-hero__body">
                            <div>
                                
                                <h3 className="Business-hero__title">{heroArticle.title}</h3>
                            </div>
                            <span className="Business-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Business;
