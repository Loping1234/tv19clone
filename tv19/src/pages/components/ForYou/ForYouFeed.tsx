import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import { getPersonalizedFeed, getPreferences } from '../../../services/userService';
import { timeAgo } from '../../../utils/timeAgo';
import '../../css/ForYou/ForYouFeed.css';

interface FeedArticle {
  _id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  category: string;
  publishedAt: string;
  views: number;
}

const ForYouFeed: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFeed();
    getPreferences()
      .then(data => setCategories(data.categories || []))
      .catch(console.error);
  }, [token]);

  const fetchFeed = async (skip = 0) => {
    try {
      const data = await getPersonalizedFeed(30, skip);
      if (skip === 0) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      setHasMore(data.articles.length === 30);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    fetchFeed(articles.length);
  };

  if (loading) {
    return (
      <div className="foryou-page">
        <div className="foryou-loading">
          <div className="foryou-spinner"></div>
          <p>Building your personalized feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="foryou-page">
      <div className="foryou-header">
        <h1><i className="fas fa-sparkles"></i> For You</h1>
        <p>
          {categories.length > 0
            ? `Personalized news from ${categories.length} categories`
            : 'Set your preferences to get personalized news'}
        </p>
        {categories.length > 0 && (
          <div className="foryou-tags">
            {categories.map(cat => (
              <span key={cat} className="foryou-tag">{cat}</span>
            ))}
          </div>
        )}
      </div>

      {categories.length === 0 && (
        <div className="foryou-setup">
          <i className="fas fa-sliders-h"></i>
          <h2>Set up your preferences</h2>
          <p>Click the preferences icon in your profile menu to select your favourite news categories and get a personalized feed.</p>
        </div>
      )}

      {articles.length > 0 ? (
        <>
          <div className="foryou-grid">
            {articles.map((article, index) => (
              <Link key={article._id} to={`/article/${article._id}`} className={`foryou-card ${index === 0 ? 'featured' : ''}`}>
                {article.image ? (
                  <img src={article.image} alt={article.title} className="foryou-card-image" />
                ) : (
                  <div className="foryou-card-placeholder">
                    <i className="far fa-newspaper"></i>
                  </div>
                )}
                <div className="foryou-card-body">
                  <span className="foryou-card-category">{article.source || article.category}</span>
                  <h3 className="foryou-card-title">{article.title}</h3>
                  {index === 0 && article.description && (
                    <p className="foryou-card-desc">{article.description.slice(0, 150)}...</p>
                  )}
                  <div className="foryou-card-meta">
                    <span>{timeAgo(article.publishedAt)}</span>
                    <span>{article.views || 0} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="foryou-load-more">
              <button onClick={loadMore} disabled={loadingMore} className="foryou-load-btn">
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : categories.length > 0 ? (
        <div className="foryou-empty">
          <i className="far fa-newspaper"></i>
          <h2>No articles found</h2>
          <p>We couldn't find articles matching your preferences right now. Check back later!</p>
        </div>
      ) : null}
    </div>
  );
};

export default ForYouFeed;
