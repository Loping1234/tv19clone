import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/Entertainment.css';
import { getEntertainment, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Entertainment: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEntertainmentNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getEntertainment('entertainment', 'in', 15);

            // Deduplicate by title
            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // We need: 4 left + 1 hero + 4 right = 9 articles
            setArticles(unique.slice(0, 9));
        } catch (err) {
            console.error('Error fetching Entertainment news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntertainmentNews();
        const interval = setInterval(fetchEntertainmentNews, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchEntertainmentNews]);

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
            <div className="Entertainment-page">
                <div className="Entertainment-loading">
                    <div className="Entertainment-spinner" />
                    <p>Loading Entertainment news...</p>
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
            to={`/article/${article.category || 'entertainment'}/${slugify(article.title)}`}
            className="Entertainment-side-item"
        >
            <NewsImage 
                src={article.image} 
                alt={article.title} 
                category="entertainment"
                articleUrl={article.url}
                className="Entertainment-side-thumb"
            />
            <div className="Entertainment-side-info">
                <h4 className="Entertainment-side-title">{article.title}</h4>
                <span className="Entertainment-side-meta">
                    <span className="source">{article.source}</span>
                    • {timeAgo(article.publishedAt)}
                </span>
            </div>
        </Link>
    );

    return (
        <div className="Entertainment-page">
            <section className="Entertainment-section">
                <div className="Entertainment-section__header">
                    <h3 className="Entertainment-section__heading">Entertainment</h3>
                    <Link to="/entertainment" className="Entertainment-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Entertainment-grid">
                    {/* Left column: list with thumbnails */}
                    <div className="Entertainment-side-list">
                        {leftArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    

                    {/* Center column: list with thumbnails */}
                    <div className="Entertainment-side-list">
                        {rightArticles.map((article, idx) => renderSideItem(article, idx))}
                    </div>

                    {/* Right column: hero article */}
                    <Link
                        to={`/article/${heroArticle.category || 'entertainment'}/${slugify(heroArticle.title)}`}
                        className="Entertainment-hero"
                    >
                        <div className="Entertainment-hero__img">
                            <NewsImage 
                                src={heroArticle.image} 
                                alt={heroArticle.title} 
                                category="entertainment"
                                articleUrl={heroArticle.url}
                            />
                            
                        </div>
                        <div className="Entertainment-hero__body">
                            <div>
                                
                                <h3 className="Entertainment-hero__title">{heroArticle.title}</h3>
                            </div>
                            <span className="Entertainment-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Entertainment;
