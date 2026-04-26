import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import { getBookmarks, removeBookmark } from '../../../services/userService';
import { timeAgo } from '../../../utils/timeAgo';
import '../../css/SavedArticles/SavedArticles.css';

interface SavedArticle {
  _id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  category: string;
  publishedAt: string;
  views: number;
}

const SavedArticles: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    try {
      const data = await getBookmarks();
      setArticles(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (articleId: string) => {
    setRemoving(articleId);
    try {
      await removeBookmark(articleId);
      setArticles(prev => prev.filter(a => a._id !== articleId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="saved-page">
        <div className="saved-loading">
          <div className="saved-spinner"></div>
          <p>Loading your saved articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-header">
        <h1><i className="fas fa-bookmark"></i> Saved Articles</h1>
        <p>{articles.length} article{articles.length !== 1 ? 's' : ''} saved</p>
      </div>

      {articles.length > 0 ? (
        <div className="saved-grid">
          {articles.map(article => (
            <div key={article._id} className="saved-card">
              <Link to={`/article/${article._id}`} className="saved-card-link">
                {article.image ? (
                  <img src={article.image} alt={article.title} className="saved-card-image" />
                ) : (
                  <div className="saved-card-placeholder">
                    <i className="far fa-newspaper"></i>
                  </div>
                )}
                <div className="saved-card-body">
                  <span className="saved-card-category">{article.source || article.category}</span>
                  <h3 className="saved-card-title">{article.title}</h3>
                  {article.description && (
                    <p className="saved-card-desc">{article.description.slice(0, 120)}...</p>
                  )}
                  <div className="saved-card-meta">
                    <span>{timeAgo(article.publishedAt)}</span>
                    <span>{article.views || 0} views</span>
                  </div>
                </div>
              </Link>
              <button
                className="saved-remove-btn"
                onClick={() => handleRemove(article._id)}
                disabled={removing === article._id}
                title="Remove from saved"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="saved-empty">
          <i className="far fa-bookmark"></i>
          <h2>No saved articles yet</h2>
          <p>Articles you save while reading will appear here. Start exploring and bookmark articles you want to read later!</p>
          <Link to="/" className="saved-browse-btn">
            Browse Articles <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedArticles;
