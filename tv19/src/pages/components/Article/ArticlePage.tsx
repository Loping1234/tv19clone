import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById, recordArticleView, getRelatedArticles, type Article } from '../../../services/newsService';
import ShareButtons from '../shared/ShareButtons';
import '../../css/Article/ArticlePage.css';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      window.scrollTo(0, 0);
      
      recordArticleView(id);

      getArticleById(id)
        .then((data) => {
          setArticle(data);
          // Assuming `source` contains some category metadata, passing 'top' as fallback
          const categoryToFetch = 'top'; 
          getRelatedArticles(categoryToFetch, id).then(setRelated).catch(console.error);
        })
        .catch((error) => console.error("Error fetching article:", error))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="article-page-container"><div style={{ padding: '100px', textAlign: 'center' }}>Loading article...</div></div>;
  }

  if (!article) {
    return <div className="article-page-container"><div style={{ padding: '100px', textAlign: 'center' }}>Article not found.</div></div>;
  }

  const categoryName = article.source || 'News';
  const url = window.location.href;

  return (
    <div className="article-page-container">
      <div className="article-breadcrumb">
        <Link to="/">Home</Link> &gt; <span>{categoryName}</span>
      </div>

      <div className="article-header">
        <div className="article-category">{categoryName}</div>
        <h1 className="article-title">{article.title}</h1>
        
        <div className="article-meta">
          {article.author && (
            <div className="article-meta-item">
              <span>By</span> <strong>{article.author}</strong>
            </div>
          )}
          <div className="article-meta-item">
            <span>Published:</span> <strong>{new Date(article.publishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</strong>
          </div>
          <div className="article-meta-item">
            <span>Views:</span> <strong>{article.views || 1}</strong>
          </div>
        </div>

        <ShareButtons url={url} title={article.title} />
      </div>

      <div className="article-layout">
        <main className="article-main">
          {article.image && (
            <img src={article.image} alt={article.title} className="article-hero-image" />
          )}
          
          <div className="article-content">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p>{article.description}</p>
            )}
            {!article.content && !article.description && (
              <p>No content available for this article.</p>
            )}
          </div>
        </main>

        <aside className="article-sidebar">
          <h3 className="sidebar-title">Trending in {categoryName}</h3>
          <div className="related-articles-list">
            {related.length > 0 ? (
              related.map((relArticle) => (
                <Link to={`/article/${relArticle._id}`} key={relArticle._id} className="related-article-card">
                  {relArticle.image && (
                    <img src={relArticle.image} alt={relArticle.title} className="related-image" />
                  )}
                  <div className="related-info">
                    <h4 className="related-title">{relArticle.title}</h4>
                    <span className="related-date">{new Date(relArticle.publishedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p style={{ color: '#777', fontSize: '14px' }}>No related articles found.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticlePage;
