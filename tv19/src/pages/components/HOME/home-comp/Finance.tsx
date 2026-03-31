import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Finance.css';
import { getTopHeadlines, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Finance: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFinanceNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTopHeadlines('finance', 'in', 15);

            // Deduplicate by title
            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // We need: 4 left + 1 hero + 4 right = 9 articles
            setArticles(unique.slice(0, 9));
        } catch (err) {
            console.error('Error fetching finance news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceNews();
        const interval = setInterval(fetchFinanceNews, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchFinanceNews]);

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
            <div className="finance-page">
                <div className="finance-loading">
                    <div className="finance-spinner" />
                    <p>Loading finance news...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    // Split articles: left list (0-3), hero (4), right list (5-8)
    const leftArticles = articles.slice(0, 4);
    const heroArticle = articles[4] || articles[0];
    const rightArticles = articles.slice(5, 9);

    const renderSideItem = (article: Article, idx: number) => (
        <Link
            key={idx}
            to={`/article/${article.category || 'finance'}/${slugify(article.title)}`}
            className="finance-side-item"
        >
            <NewsImage 
                src={article.image} 
                alt={article.title} 
                category="finance"
                articleUrl={article.url}
                className="finance-side-thumb"
            />
            <div className="finance-side-info">
                <h4 className="finance-side-title">{article.title}</h4>
                <span className="finance-side-meta">
                    <span className="source">{article.source}</span>
                    • {timeAgo(article.publishedAt)}
                </span>
            </div>
        </Link>
    );

    return (
        <div className="finance-page">
            <section className="finance-section">
                <div className="finance-section__header">
                    <h3 className="finance-section__heading">FINANCE</h3>
                    <Link to="/finance" className="finance-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="finance-grid">
                    {/* Left column: list with thumbnails */}
                    <div className="finance-side-list">
                        {leftArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    {/* Center column: hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'finance'}/${slugify(heroArticle.title)}`}
                        className="finance-hero"
                    >
                        <div className="finance-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="finance"
                                articleUrl={heroArticle.url}
                            />
                            
                        </div>
                        <div className="finance-hero__body">
                            <div>
                                
                                <h3 className="finance-hero__title">{heroArticle.title}</h3>
                            </div>
                            <span className="finance-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right column: list with thumbnails */}
                    <div className="finance-side-list">
                        {rightArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Finance;
