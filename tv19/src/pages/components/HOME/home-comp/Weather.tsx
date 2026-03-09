import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Weather.css';
import { getTopHeadlines, type Article } from '../../../../services/newsService';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Weather: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWeatherNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTopHeadlines('weather', 'in', 10);

            const unique = response.articles.filter(
                (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
            );

            // 1 hero + up to 5 list items = 6
            setArticles(unique.slice(0, 6));
        } catch (err) {
            console.error('Error fetching weather news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeatherNews();
        const interval = setInterval(fetchWeatherNews, 180000);
        return () => clearInterval(interval);
    }, [fetchWeatherNews]);

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
            <div className="weather-page">
                <div className="weather-loading">
                    <div className="weather-spinner" />
                    <p>Loading weather news...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="weather-page">
            <section className="weather-section">
                <div className="weather-section__header">
                    <h3 className="weather-section__heading">WEATHER</h3>
                    <a href="#" className="weather-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div className="weather-grid">
                    {/* Left: Hero article */}
                    <a
                        href={heroArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="weather-hero"
                    >
                        <div className="weather-hero__img">
                            {heroArticle.image ? (
                                <img src={heroArticle.image} alt={heroArticle.title} />
                            ) : (
                                <div className="weather-hero__placeholder" />
                            )}
                        </div>
                        <div className="weather-hero__body">
                            <span className="weather-hero__category">WEATHER</span>
                            <h3 className="weather-hero__title">{heroArticle.title}</h3>
                            <p className="weather-hero__desc">{heroArticle.description}</p>
                            <span className="weather-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </a>

                    {/* Right: List with thumbnails */}
                    <div className="weather-list">
                        {listArticles.map((article, idx) => (
                            <a
                                key={idx}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="weather-list__item"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="weather-list__thumb"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="weather-list__thumb-placeholder" />
                                )}
                                <div className="weather-list__info">
                                    <h4 className="weather-list__title">{article.title}</h4>
                                    <span className="weather-list__meta">
                                        <span className="source">WEATHER</span>
                                        • {timeAgo(article.publishedAt)}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Weather;
