import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug, incrementViewCount, slugify, type Article } from '../../../services/newsService';
import { 
  UilClock, UilEye, UilCopy, 
  UilFacebook, UilTwitter, UilWhatsapp, UilLinkedin,
  UilAngleRight, UilBookmark, UilShieldCheck
} from '@iconscout/react-unicons';
import '../../css/ARTICLE/ArticlePage.css';
import NewsImage from '../common/NewsImage';

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

export default function ArticlePage() {
    const { category, slug } = useParams<{ category: string; slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [related, setRelated] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchArticleData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const data = await getArticleBySlug(slug, category);
                setArticle(data.article);
                setRelated(data.related);
                
                // Increment view count if we have an ID
                if (data.article._id) {
                    incrementViewCount(data.article._id);
                }
            } catch (err) {
                console.error('Failed to load article:', err);
                setError('Could not find the requested article.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticleData();
        window.scrollTo(0, 0);
    }, [slug, category]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = window.location.href;
    const shareTitle = article?.title || 'TV19 News';

    if (loading) {
        return (
            <div className="article-loader-container">
                <div className="article-loader" />
                <p>Loading story...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="article-error-container">
                <h1>Oops!</h1>
                <p>{error || 'Article not found.'}</p>
                <Link to="/" className="back-home-btn">Back to Homepage</Link>
            </div>
        );
    }

    return (
        <main className="article-page">
            <div className="article-container">
                <nav className="breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <UilAngleRight className="breadcrumb-icon" size={16} />
                    <Link to={`/${article.category}`}>{article.category.toUpperCase()}</Link>
                    <UilAngleRight className="breadcrumb-icon" size={16} />
                    <span className="breadcrumb-current">{article.title.substring(0, 30)}...</span>
                </nav>

                <div className="article-layout">
                    <article className="article-main">
                        <header className="article-header">
                            <span className="article-category-badge">{article.category.toUpperCase()}</span>
                            <h1 className="article-title">{article.title}</h1>
                            <div className="article-meta">
                                <div className="meta-left">
                                    <span className="meta-item"><UilClock size={16} /> {timeAgo(article.publishedAt)}</span>
                                    <span className="meta-item"><UilEye size={16} /> {article.views || 0} Views</span>
                                </div>
                                <div className="article-actions">
                                    <button className="action-btn" title="Save to Collection"><UilBookmark size={20} /></button>
                                    <button 
                                        className={`action-btn ${copied ? 'copied' : ''}`} 
                                        onClick={handleCopyLink}
                                        title={copied ? 'Link Copied!' : 'Copy Link'}
                                    >
                                        {copied ? <UilShieldCheck size={20} /> : <UilCopy size={20} />}
                                    </button>
                                </div>
                            </div>
                        </header>

                        <figure className="article-featured-image">
                            <NewsImage 
                                src={article.image} 
                                alt={article.title} 
                                category={article.category}
                                articleUrl={article.url}
                            />
                        </figure>

                        <div className="article-share-bar">
                            <span>SHARE:</span>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-link fb"><UilFacebook size={20} /></a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-link tw"><UilTwitter size={20} /></a>
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-link wa"><UilWhatsapp size={20} /></a>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-link li"><UilLinkedin size={20} /></a>
                        </div>

                        <div className="article-body">
                            {article.content ? (
                                article.content.split('\n').map((para, i) => (
                                    para.trim() && <p key={i}>{para}</p>
                                ))
                            ) : (
                                <p>{article.description}</p>
                            )}
                            <div className="read-more-original">
                                <p>Continue reading on the original site:</p>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="external-link-btn">
                                    Read full article at {article.source || 'Original Source'}
                                </a>
                            </div>
                        </div>
                    </article>

                    <aside className="article-sidebar">
                        <section className="sidebar-section">
                            <h3 className="sidebar-title">Trending in {article.category}</h3>
                            <div className="related-stories">
                                {related.map((item, idx) => (
                                    <Link key={idx} to={`/article/${item.category}/${slugify(item.title)}`} className="related-item">
                                        <div className="related-thumb">
                                            <NewsImage 
                                                src={item.image} 
                                                alt={item.title} 
                                                category={item.category}
                                                articleUrl={item.url}
                                            />
                                        </div>
                                        <div className="related-info">
                                            <h4 className="related-title">{item.title}</h4>
                                            <span className="related-time">{timeAgo(item.publishedAt)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <div className="article-sidebar-ad">
                            <div className="ad-label">ADVERTISEMENT</div>
                            <img src="https://placehold.co/300x300/1e2227/ffffff?text=Tonight,+I'll+be+eating...&font=montserrat" alt="Ad" />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
