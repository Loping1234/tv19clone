import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Weather.css';
import { getWeather, type Article, scrapeFallbackImage } from '../../../../services/newsService';
import { timeAgo } from '../../../../utils/timeAgo';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Image component with fallback handling
interface ArticleImageProps {
    article: Article;
    className: string;
    thumb?: boolean;
}

const ArticleImage: React.FC<ArticleImageProps> = ({ article, className }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(article.image);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setImgSrc(article.image);
        setHasError(false);
        setIsLoading(true);
    }, [article.image, article._id]);

    const handleError = async () => {
        if (hasError) return; // Prevent infinite loop
        setHasError(true);

        // Try to scrape a fallback image from the article URL
        if (article.url && article.image) {
            try {
                const fallbackUrl = await scrapeFallbackImage(article.url, article.image);
                if (fallbackUrl) {
                    setImgSrc(fallbackUrl);
                    setHasError(false);
                    return;
                }
            } catch {
                // Fallback failed, will show placeholder
            }
        }

        setImgSrc(null);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    if (!imgSrc) {
        return (
            <div className={`${className} image-fallback`}>
                <i className="fas fa-image"></i>
            </div>
        );
    }

    return (
        <>
            {isLoading && <div className={`${className} image-skeleton`} />}
            <img
                src={imgSrc}
                alt={article.title}
                className={className}
                onError={handleError}
                onLoad={handleLoad}
                style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
            />
        </>
    );
};

const Weather: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWeatherNews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getWeather('weather', 'in', 10);

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
                    <Link to="/category/weather" className="weather-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="weather-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}


                        className="weather-hero"
                    >
                        <div className="weather-hero__img">
                            <ArticleImage article={heroArticle} className="weather-hero__image" />
                            <span className="weather-hero__badge">{heroArticle.source || 'WEATHER'}</span>
                        </div>
                        <div className="weather-hero__body">
                            <span className="weather-hero__category">WEATHER</span>
                            <h3 className="weather-hero__title">{heroArticle.title}</h3>
                            <p className="weather-hero__desc">{heroArticle.description}</p>
                            <span className="weather-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="weather-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}


                                className="weather-list__item"
                            >
                                <ArticleImage article={article} className="weather-list__thumb" thumb />
                                <div className="weather-list__info">
                                    <h4 className="weather-list__title">{article.title}</h4>
                                    <span className="weather-list__meta">
                                        <span className="source">WEATHER</span>
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

export default Weather;
