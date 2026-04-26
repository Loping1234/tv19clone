import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../css/HOME/home-comp/Arts.css';
import { getArts, type Article, scrapeFallbackImage } from '../../../../services/newsService';
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

const Arts: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchArts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getArts('arts', 'in', 10);

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
        fetchArts();
        const interval = setInterval(fetchArts, 180000);
        return () => clearInterval(interval);
    }, [fetchArts]);



    if (loading) {
        return (
            <div className="Arts-page">
                <div className="Arts-loading">
                    <div className="Arts-spinner" />
                    <p>Loading trending stories...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) return null;

    const heroArticle = articles[0];
    const listArticles = articles.slice(1);

    return (
        <div className="Arts-page">
            <section className="Arts-section">
                <div className="Arts-section__header">
                    <h3 className="Arts-section__heading">Arts</h3>
                    <Link to="/category/arts" className="Arts-section__more">
                        MORE <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                <div className="Arts-grid">
                    {/* Left: Hero article */}
                    <Link to={`/article/${heroArticle._id}`}


                        className="Arts-hero"
                    >
                        <div className="Arts-hero__img">
                            <ArticleImage article={heroArticle} className="Arts-hero__image" />
                            <span className="Arts-hero__badge">{heroArticle.source || 'ARTS'}</span>
                        </div>
                        <div className="Arts-hero__body">
                            <span className="Arts-hero__category">Arts</span>
                            <h3 className="Arts-hero__title">{heroArticle.title}</h3>
                            <p className="Arts-hero__desc">{heroArticle.description}</p>
                            <span className="Arts-hero__time">{timeAgo(heroArticle.publishedAt)}</span>
                        </div>
                    </Link>

                    {/* Right: List with thumbnails */}
                    <div className="Arts-list">
                        {listArticles.map((article, idx) => (
                            <Link key={idx} to={`/article/${article._id}`}


                                className="Arts-list__item"
                            >
                                <ArticleImage article={article} className="Arts-list__thumb" thumb />
                                <div className="Arts-list__info">
                                    <h4 className="Arts-list__title">{article.title}</h4>
                                    <span className="Arts-list__meta">
                                        <span className="source">Arts</span>
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

export default Arts;
