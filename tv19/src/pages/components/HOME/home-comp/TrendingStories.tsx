import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/HOME/home-comp/topheadlines.css';
import { getTopHeadlines, slugify, type Article } from '../../../../services/newsService';
import NewsImage from '../../common/NewsImage';
import '@fortawesome/fontawesome-free/css/all.min.css';

const TrendingStories: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchTrendingStories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTopHeadlines('top', 'in', 10);
            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );
            setArticles(unique.slice(0, 4));
        } catch (err) {
            console.error('Error fetching trending stories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrendingStories();
        const interval = setInterval(fetchTrendingStories, 1800000); // 30 minutes
        return () => clearInterval(interval);
    }, [fetchTrendingStories]);

    if (loading) {
        return (
            <div className="ts-page">
                <div className="ts-loading">
                    <div className="ts-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    return (
        <div className="ts-page">
            <section className="ts-section">
                {/* Section header */}
                <div className="ts-header">
                    <h3 className="ts-heading">TRENDING STORIES</h3>
                    <Link to="/trending" className="ts-more">MORE <i className="fas fa-arrow-right"></i></Link>
                </div>

                {/* 4-column card row */}
                <div className="ts-grid">
                    {articles.map((article, idx) => (
                        <Link
                            key={idx}
                            to={`/article/${article.category || 'top'}/${slugify(article.title)}`}
                            className="ts-card"
                        >
                            <div className="ts-card__img">
                                <NewsImage 
                                    src={article.image} 
                                    alt={article.title} 
                                    category="top"
                                    articleUrl={article.url}
                                />
                            </div>

                            <div className="ts-card__body">
                                <h4 className="ts-card__title">{article.title}</h4>
                                <span className="ts-card__views">
                                    <i className="far fa-eye"></i> {article.views || 0} VIEWS
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TrendingStories;
