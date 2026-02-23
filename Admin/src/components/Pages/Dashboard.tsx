import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:5000'

// Known RSS feed counts per category (from server/index.js)
const FEED_COUNTS: Record<string, number> = {
    top: 2, india: 3, business: 3, finance: 2, markets: 2,
    entertainment: 2, health: 3, science: 3, sports: 3,
    technology: 3, world: 3, politics: 3, environment: 3,
    lifestyle: 2, education: 2, crime: 1, astrology: 1,
    opinion: 2, arts: 2, weather: 2, 'green-future': 2,
    trending: 3, rajasthan: 2, manufacturing: 2,
}
const TOTAL_RSS_FEEDS = Object.values(FEED_COUNTS).reduce((a, b) => a + b, 0)

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
}

function isToday(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    return d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalArticles: 0, todayArticles: 0,
        totalCategories: 0, totalFeeds: TOTAL_RSS_FEEDS,
        loading: true, lastRefresh: null,
    })
    const [topArticles, setTopArticles] = useState<TopArticle[]>([])
    const [clock, setClock] = useState(new Date())
    const [error, setError] = useState<string | null>(null)

    // Live clock - every second
    useEffect(() => {
        const t = setInterval(() => setClock(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const fetchStats = useCallback(async () => {
        setStats(s => ({ ...s, loading: true }))
        setError(null)
        try {
            const [newsRes, catRes] = await Promise.all([
                fetch(`${API}/api/news?category=top&size=50`),
                fetch(`${API}/api/categories`),
            ])

            if (!newsRes.ok || !catRes.ok) throw new Error('Server error')

            const newsData = await newsRes.json() as { totalResults: number; articles: Article[] }
            const catData = await catRes.json() as { categories: string[] }

            const today = newsData.articles.filter(a => isToday(a.publishedAt)).length

            setStats({
                totalArticles: newsData.totalResults,
                todayArticles: today,
                totalCategories: catData.categories.length,
                totalFeeds: TOTAL_RSS_FEEDS,
                loading: false,
                lastRefresh: new Date(),
            })
            setTopArticles(newsData.articles.slice(0, 10))
        } catch (e) {
            setError('Could not reach the TV19 server. Make sure it is running on port 5000.')
            setStats(s => ({ ...s, loading: false }))
        }
    }, [])

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 60_000)
        return () => clearInterval(interval)
    }, [fetchStats])

    const fmt = (d: Date) =>
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const fmtDate = (d: Date) =>
        d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">DASHBOARD</h1>
                    <p className="dash-subtext">{fmtDate(clock)}</p>
                </div>
                <div className="dash-clock-block">
                    <div className="dash-clock">{fmt(clock)}</div>
                    {stats.lastRefresh && (
                        <div className="dash-refreshed">
                            Last refreshed: {stats.lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    <button className="refresh-btn" onClick={fetchStats} disabled={stats.loading}>
                        {stats.loading ? '⟳ Loading…' : '⟳ Refresh'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="stat-cards">
                <StatCard
                    icon="📰"
                    label="Total Articles"
                    value={stats.totalArticles}
                    sub="Fetched from RSS feeds"
                    gradient="orange"
                    loading={stats.loading}
                />
                <StatCard
                    icon="📅"
                    label="Today's Articles"
                    value={stats.todayArticles}
                    sub="Published today"
                    gradient="red"
                    loading={stats.loading}
                />
                <StatCard
                    icon="🗂️"
                    label="Categories"
                    value={stats.totalCategories}
                    sub="Active feed categories"
                    gradient="purple"
                    loading={stats.loading}
                />
                <StatCard
                    icon="📡"
                    label="RSS Feeds"
                    value={stats.totalFeeds}
                    sub="Total configured feeds"
                    gradient="teal"
                    loading={stats.loading}
                />
            </div>

            {/* Most Recent Articles Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">⚡ Latest Articles</h2>
                    <span className="section-badge">{topArticles.length} items</span>
                </div>
                <div className="articles-table-wrap">
                    {topArticles.length === 0 && !stats.loading ? (
                        <p className="empty-msg">No articles loaded yet. Start the backend server.</p>
                    ) : (
                        <table className="articles-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Source</th>
                                    <th>Published</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topArticles.map((a, i) => (
                                    <tr key={i}>
                                        <td className="row-num">{i + 1}</td>
                                        <td>
                                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="article-link">
                                                {a.title}
                                            </a>
                                        </td>
                                        <td><span className="source-chip">{a.source}</span></td>
                                        <td className="time-cell">{timeAgo(a.publishedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Category Feed Grid */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">📡 Feed Sources per Category</h2>
                </div>
                <div className="feed-grid">
                    {Object.entries(FEED_COUNTS).map(([cat, count]) => (
                        <div key={cat} className="feed-pill">
                            <span className="feed-cat">{cat}</span>
                            <span className="feed-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function StatCard({
    icon, label, value, sub, gradient, loading
}: {
    icon: string; label: string; value: number; sub: string; gradient: string; loading: boolean
}) {
    return (
        <div className={`stat-card grad-${gradient}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-body">
                <div className="stat-label">{label}</div>
                <div className="stat-value">
                    {loading ? <span className="skeleton-num" /> : value.toLocaleString()}
                </div>
                <div className="stat-sub">{sub}</div>
            </div>
            <div className="stat-arrow">→</div>
        </div>
    )
}
