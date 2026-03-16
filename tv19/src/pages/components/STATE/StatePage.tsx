import { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../pages/css/STATE/StatePage.css';
import { getStateNews, type Article } from '../../../services/newsService';

const REGIONS = [
  'All Stories',
  'Ajmer',
  'Alwar',
  'Bagru',
  'Banswara',
  'Barmer',
  'Bassi',
  'Beawer',
  'Bharatpur',
  'Bhilwara',
  'Bhiwadi',
  'Bikaner',
  'Chittorgarh',
  'Churu',
  'Dausa',
  'Dholpur',
  'Dungarpur',
  'Hanumangarh',
  'Jaipur',
  'Jaisalmer',
  'Jalore',
  'Jhalawar',
  'Jhunjhunu',
  'Jhunjunu',
  'Jodhpur',
  'Karauli',
  'Kishangarh',
  'Kota',
  'Nagaur',
  'Pali',
  'Pratapgarh',
  'Rajsamand',
  'Sawai Madhopur',
  'Sikar',
  'Sirohi',
  'Sri Ganganagar',
  'Tonk',
  'Udaipur',
] as const;

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

function dedupeByTitle(items: Article[]) {
  return items.filter((article, index, arr) => arr.findIndex((a) => a.title === article.title) === index);
}

export default function StatePage() {
  const [activeRegion, setActiveRegion] = useState<string>('All Stories');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const fetchRegionNews = useCallback(async (region: string) => {
    setLoading(true);
    setError(null);
    setFallbackNotice(null);

    try {
      const query = region === 'All Stories' ? 'Rajasthan' : region;
      const response = await getStateNews(query, 30);
      const unique = dedupeByTitle(response.articles);

      if (region === 'All Stories' || unique.length > 0) {
        setArticles(unique);
        return;
      }

      const fallbackResponse = await getStateNews('Rajasthan', 30);
      const fallbackUnique = dedupeByTitle(fallbackResponse.articles);
      const regionToken = region.toLowerCase();

      const prioritized = fallbackUnique.filter((article) =>
        [article.title, article.description, article.content, article.source]
          .filter(Boolean)
          .some((text) => text!.toLowerCase().includes(regionToken))
      );

      const merged = [...prioritized, ...fallbackUnique.filter((item) => !prioritized.includes(item))];
      setArticles(merged);
      setFallbackNotice(`Showing Rajasthan feed with prioritized ${region} matches.`);
    } catch (err) {
      console.error('State region fetch failed:', err);
      setError('Could not load regional news right now. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    fetchRegionNews(activeRegion);
  }, [activeRegion, fetchRegionNews]);

  const heroArticle = useMemo(() => articles[0], [articles]);
  const listArticles = useMemo(() => articles.slice(1), [articles]);

  return (
    <main className="state-region-page">
      <section className="state-region-shell">
        <div className="state-subnav" role="tablist" aria-label="Rajasthan regions">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              role="tab"
              aria-selected={activeRegion === region}
              className={`state-subnav__item ${activeRegion === region ? 'active' : ''}`}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="state-content-grid">
          <section className="state-main-column" aria-live="polite">
            {loading ? (
              <div className="state-loader">
                <div className="state-loader__spinner" />
                <p>Loading {activeRegion} stories...</p>
              </div>
            ) : error ? (
              <div className="state-empty">{error}</div>
            ) : articles.length === 0 ? (
              <div className="state-empty">
                No stories found for {activeRegion}. Try another region.
              </div>
            ) : (
              <>
                {fallbackNotice && (
                  <div className="state-fallback-note">{fallbackNotice}</div>
                )}

                {heroArticle && (
                  <a
                    href={heroArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="state-hero-card"
                  >
                    <div className="state-hero-card__image-wrap">
                      {heroArticle.image ? (
                        <img
                          src={heroArticle.image}
                          alt={heroArticle.title}
                          className="state-hero-card__image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/860x420/e4e7ee/667085?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="state-hero-card__placeholder" />
                      )}
                      <span className="state-hero-card__badge">
                        {activeRegion === 'All Stories' ? 'RAJASTHAN' : activeRegion.toUpperCase()}
                      </span>
                    </div>

                    <div className="state-hero-card__body">
                      <h1 className="state-hero-card__title">{heroArticle.title}</h1>
                      {heroArticle.description && (
                        <p className="state-hero-card__desc">{heroArticle.description}</p>
                      )}
                      <div className="state-hero-card__meta">{timeAgo(heroArticle.publishedAt)} • 0 Views • 0 Comments</div>
                    </div>
                  </a>
                )}

                <div className="state-story-list">
                  {listArticles.map((article, index) => (
                    <a
                      key={`${article.title}-${index}`}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="state-story-item"
                    >
                      <div className="state-story-item__thumb-wrap">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="state-story-item__thumb"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/240x140/e4e7ee/667085?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="state-story-item__thumb-placeholder" />
                        )}
                      </div>

                      <div className="state-story-item__content">
                        <span className="state-story-item__region">
                          {activeRegion === 'All Stories' ? (article.source || 'Rajasthan').toUpperCase() : activeRegion.toUpperCase()}
                        </span>
                        <h2 className="state-story-item__title">{article.title}</h2>
                        {article.description && (
                          <p className="state-story-item__desc">{article.description}</p>
                        )}
                        <div className="state-story-item__meta">{timeAgo(article.publishedAt)} • 0 Views • 0 Comments</div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="state-right-column">
            <div className="state-right-column__box">
              <h3>Regional Sidebar</h3>
              <p>Latest state widgets can be added here.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}