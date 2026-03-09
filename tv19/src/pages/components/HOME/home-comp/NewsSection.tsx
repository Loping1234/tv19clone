import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/NewsSection.css';
import { getTopHeadlines, searchNews, type Article, type NewsCategory } from '../../../../services/newsService';

interface NewsSectionProps {
    title: string;
    category?: NewsCategory;
    searchQuery?: string;
    count?: number;
    viewMoreLink?: string;
}

const NewsSection: React.FC<NewsSectionProps> = ({
    title,
    category,
    searchQuery,
    count = 4,
    viewMoreLink = '#'
}) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSectionNews = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            // If direct category is provided
            if (category) {
                response = await getTopHeadlines(category, 'in', count + 2); // Fetch a few extra to filter
            }
            // Fallback to search if query provided
            else if (searchQuery) {
                response = await searchNews(searchQuery, count + 2);
            } else {
                return;
            }

            // Filter articles with images preferred, and deduplicate
            const validArticles = response.articles.filter(a => a.image && a.title);
            // Fallback if not enough images
            const finalArticles = validArticles.length >= count
                ? validArticles.slice(0, count)
                : response.articles.slice(0, count);

            setArticles(finalArticles);
        } catch (err) {
            console.error(`Error fetching news for section ${title}:`, err);
        } finally {
            setLoading(false);
        }
    }, [category, searchQuery, count, title]);

    useEffect(() => {
        fetchSectionNews();
    }, [fetchSectionNews]);

    const timeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} mins ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    if (loading) {
        return (
            <div className="news-section-container">
                <div className="news-section-header">
                    <h2 className="news-section-heading">{title}</h2>
                </div>
                <div className="news-section-grid">
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="news-card" style={{ opacity: 0.6 }}>
                            <div className="news-card-image-wrapper" style={{ backgroundColor: '#e0e0e0' }} />
                            <div className="news-card-content">
                                <div style={{ height: '1em', width: '80%', backgroundColor: '#e0e0e0', marginBottom: '5px' }} />
                                <div style={{ height: '1em', width: '60%', backgroundColor: '#e0e0e0' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    return (
        <div className="news-section-container">
            <div className="news-section-header">
                <h2 className="news-section-heading">{title}</h2>
                <a href={viewMoreLink} className="news-section-more">
                    More <i className="fas fa-arrow-right"></i>
                </a>
            </div>
            <div className="news-section-grid">
                {articles.map((article, index) => (
                    <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-card"
                    >
                        <div className="news-card-image-wrapper">
                            <img
                                src={article.image || 'https://via.placeholder.com/300x200?text=News'}
                                alt={article.title}
                                className="news-card-image"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=TV19';
                                }}
                            />
                            <span className="news-card-badge">{article.source || 'News'}</span>
                        </div>
                        <div className="news-card-content">
                            <h3 className="news-card-title">{article.title}</h3>
                            <span className="news-card-time">{timeAgo(article.publishedAt)}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsSection;
