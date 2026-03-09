import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/topheadlines.css';
import { getTopHeadlines, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const categoryLabels = ['INDUSTRY', 'JODHPUR', 'TENNIS', 'MOVIES', 'SPORTS', 'WORLD'];

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
        const interval = setInterval(fetchTrendingStories, 180000);
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
                    <a href="#" className="ts-more">MORE <i className="fas fa-arrow-right"></i></a>
                </div>

                {/* 4-column card row */}
                <div className="ts-grid">
                    {articles.map((article, idx) => (
                        <a
                            key={idx}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ts-card"
                        >
                            {/* Thumbnail */}
                            <div className="ts-card__img">
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://placehold.co/300x180/cccccc/555555?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="ts-card__img-placeholder" />
                                )}
                            </div>

                            {/* Body */}
                            <div className="ts-card__body">
                                {/* Numbered category badge */}
                                <span className="ts-card__badge">
                                    #{idx + 1} {categoryLabels[idx] || article.source?.toUpperCase() || 'NEWS'}
                                </span>
                                <h4 className="ts-card__title">{article.title}</h4>
                                <span className="ts-card__views">
                                    <i className="far fa-eye"></i> 1 VIEWS
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TrendingStories;
