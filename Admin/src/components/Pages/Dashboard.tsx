import { useState, useEffect, useCallback } from 'react'
import { FiUsers, FiFileText, FiMessageCircle, FiLayers, FiShield, FiSpeaker } from 'react-icons/fi'
import { BsArrowRightCircleFill } from 'react-icons/bs'

const API = 'http://localhost:5000'

interface Article {
    title: string
    source: string
    url: string
    publishedAt: string
    image?: string
}

interface Stats {
    totalArticles: number
    todayArticles: number
    totalCategories: number
    totalFeeds: number
    loading: boolean
    lastRefresh: Date | null
}



interface TopArticle {
    title: string
    source: string
    url: string
    publishedAt: string
    image?: string
    urlToImage?: string
}



export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalArticles: 0, todayArticles: 0,
        totalCategories: 0, totalFeeds: 0,
        loading: true, lastRefresh: null,
    })
    const [topArticles, setTopArticles] = useState<TopArticle[]>([])

    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setStats(s => ({ ...s, loading: true }))
        setError(null)
        try {
            const [newsRes, catRes, countsRes] = await Promise.all([
                fetch(`${API}/api/news?category=top&size=50`),
                fetch(`${API}/api/news/categories`),
                fetch(`${API}/api/counts/categories`),
            ])

            if (!newsRes.ok || !catRes.ok || !countsRes.ok) throw new Error('Server error')

            const newsData = await newsRes.json() as { totalResults: number; articles: Article[] }
            const catData = await catRes.json() as { categories: string[] }
            const countsData = await countsRes.json() as { categoryCounts: Record<string, number>; totalArticles: number }

            setStats({
                totalArticles: countsData.totalArticles,
                todayArticles: 0,
                totalCategories: catData.categories.length,
                totalFeeds: Object.keys(countsData.categoryCounts).length,
                loading: false,
                lastRefresh: new Date(),
            })
            setTopArticles(newsData.articles.slice(0, 10))
        } catch {
            setError('Could not reach the TV19 server. Make sure it is running on port 5000.')
            setStats(s => ({ ...s, loading: false }))
        }
    }, [])

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 60_000)
        return () => clearInterval(interval)
    }, [fetchStats])

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dash-header">
                <h1 className="dash-title">DASHBOARD</h1>
                <div className="breadcrumb">
                    <span>Dashboard</span>
                    <span className="bc-sep">›</span>
                    <span className="bc-active">Dashboard</span>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}

            {/* Stat Cards - New Design */}
            <div className="stat-cards top-grid">
                <div className="top-card card-large">
                    <div className="card-left">
                        <FiUsers className="card-icon" />
                    </div>
                    <div className="card-right">
                        <div className="card-title">Users</div>
                        <div className="card-value red-text">12</div>

                        <div className="user-stats">
                            <div className="u-stat">
                                <div className="u-label">Today</div>
                                <div className="u-val">0</div>
                            </div>
                            <div className="u-stat">
                                <div className="u-label">This Week</div>
                                <div className="u-val">0</div>
                            </div>
                            <div className="u-stat">
                                <div className="u-label">Total</div>
                                <div className="u-val">12</div>
                            </div>
                        </div>

                        <a href="#" className="card-arrow-link">
                            <BsArrowRightCircleFill className="card-arrow" />
                        </a>
                    </div>
                </div>

                <TopCard
                    title="News"
                    value={stats.loading ? 0 : stats.totalArticles}
                    icon={<FiFileText />}
                    link="#"
                />
                <TopCard
                    title="Comments"
                    value={17}
                    icon={<FiMessageCircle />}
                    link="#"
                />
                <TopCard
                    title="Subheadings"
                    value={stats.loading ? 0 : stats.totalCategories}
                    icon={<FiFileText />}
                    link="#"
                />
                <TopCard
                    title="Categories"
                    value={17}
                    icon={<FiLayers />}
                    link="#"
                />
                <TopCard
                    title="Author"
                    value={5}
                    icon={<FiShield />}
                    link="#"
                />
                <TopCard
                    title="Ads"
                    value={10}
                    icon={<FiSpeaker />}
                    link="#"
                />
            </div>

            {/* Most Read Articles List */}
            <div className="bottom-section">
                <h2 className="section-title-alt">MOST READ ARTICLES</h2>
                <div className="articles-vertical-list">
                    {topArticles.length === 0 && !stats.loading ? (
                        <p className="empty-msg">No articles loaded yet. Start the backend server.</p>
                    ) : (
                        topArticles.slice(0, 10).map((a, i) => {
                            // Mocking views and clicks based on the requested screenshot
                            const views = Math.floor(Math.random() * 8) + 2;
                            const clicks = Math.floor(views * (Math.random() * 0.6 + 0.2));
                            const imageUrl = a.image || a.urlToImage;
                            
                            return (
                                <a href={a.url} target="_blank" rel="noopener noreferrer" className="article-row-card" key={i}>
                                    <div className="article-row-img-wrap">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="" className="article-row-img" />
                                        ) : (
                                            <div className="article-row-img placeholder-img"></div>
                                        )}
                                    </div>
                                    <div className="article-row-content">
                                        <div className="article-row-title">{a.title}</div>
                                        <div className="article-row-meta">
                                            Views: <span className="meta-highlight">{views}</span> | Clicks: <span className="meta-highlight">{clicks}</span>
                                        </div>
                                    </div>
                                </a>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

function TopCard({
    title, value, icon, link
}: {
    title: string; value: number; icon: React.ReactNode; link: string
}) {
    return (
        <div className="top-card">
            <div className="card-left">
                <div className="card-icon">{icon}</div>
            </div>
            <div className="card-right">
                <div className="card-title">{title}</div>
                <div className="card-value red-text">{value.toLocaleString()}</div>
                <a href={link || '#'} className="card-arrow-link">
                    <BsArrowRightCircleFill className="card-arrow" />
                </a>
            </div>
        </div>
    )
}