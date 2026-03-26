import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:5000'

function getToken() {
    return localStorage.getItem('adminToken') || ''
}

interface RssFeed {
    _id: string
    category: string
    url: string
    subheading?: string
    status?: boolean
    publishDate?: string
    lastFetched?: string
}

export default function RssFeeds() {
    const [feeds, setFeeds] = useState<RssFeed[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [entriesPerPage, setEntriesPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [selectedFeeds, setSelectedFeeds] = useState<string[]>([])
    const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null)
    const [cachedArticleCount, setCachedArticleCount] = useState<number | null>(null)

    const fetchFeeds = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [feedsRes, catRes] = await Promise.all([
                fetch(`${API}/api/rss-feeds`),
                fetch(`${API}/api/news/categories`)
            ])
            if (!feedsRes.ok || !catRes.ok) throw new Error('Server error')

            const feedsData = await feedsRes.json() as { totalFeeds: number; feeds: RssFeed[] }
            setFeeds(feedsData.feeds)

            const catData = await catRes.json() as { categories: string[] }
            setCategories(catData.categories)
        } catch {
            setError('Could not reach the TV19 server. Make sure it is running on port 5000.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchFeeds()
        fetchMeta()
    }, [fetchFeeds])

    // Fetch last fetched time and cached article count
    const fetchMeta = async () => {
        try {
            const [configRes, countsRes] = await Promise.all([
                fetch(`${API}/api/config`),
                fetch(`${API}/api/counts/categories`)
            ])
            if (configRes.ok) {
                const configData = await configRes.json()
                setLastFetchedAt(configData.lastRssFetchAt || null)
            }
            if (countsRes.ok) {
                const countsData = await countsRes.json()
                setCachedArticleCount(countsData.totalArticles || 0)
            }
        } catch {
            // Non-critical, just skip
        }
    }


    // Filter feeds by search term
    const filtered = feeds.filter(f =>
        f.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filtered.length / entriesPerPage)
    const startIdx = (currentPage - 1) * entriesPerPage
    const paginated = filtered.slice(startIdx, startIdx + entriesPerPage)

    // Reset to page 1 when search or entries change
    useEffect(() => { setCurrentPage(1) }, [searchTerm, entriesPerPage])

    const capitalize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingFeed) return

        try {
            const url = isAdding ? `${API}/api/rss-feeds` : `${API}/api/rss-feeds/${editingFeed._id}`
            const method = isAdding ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(editingFeed)
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || (isAdding ? 'Add failed' : 'Update failed'))
            }

            setEditingFeed(null)
            setIsAdding(false)
            fetchFeeds() // Refresh list
        } catch (error) {
            const err = error as Error;
            alert(err.message || 'Failed to update feed')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this feed?')) return

        try {
            const res = await fetch(`${API}/api/rss-feeds/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error('Delete failed')
            fetchFeeds()
        } catch {
            alert('Failed to delete feed')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedFeeds.length === 0) {
            alert('Please select feeds to delete')
            return
        }
        if (!window.confirm(`Are you sure you want to delete ${selectedFeeds.length} feeds?`)) return

        try {
            await Promise.all(selectedFeeds.map(id =>
                fetch(`${API}/api/rss-feeds/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                })
            ))
            setSelectedFeeds([])
            fetchFeeds()
        } catch {
            alert('Failed to delete some or all selected feeds')
        }
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedFeeds(paginated.map(f => f._id))
        } else {
            setSelectedFeeds([])
        }
    }

    const openAddForm = () => {
        setIsAdding(true)
        setEditingFeed({ _id: '', url: '', category: '', status: true, subheading: '' })
    }

    const closeForm = () => {
        setEditingFeed(null)
        setIsAdding(false)
    }

    return (
        <div className="rss-page">
            {editingFeed ? (
                <>
                    <div className="rss-page-header">
                        <h1 className="rss-page-title">{isAdding ? 'ADD RSS FEED' : 'EDIT RSS FEED'}</h1>
                        <nav className="rss-breadcrumb">
                            <span className="rss-bc-item">RSS Feeds</span>
                            <span className="rss-bc-sep">›</span>
                            <span className="rss-bc-active">{isAdding ? 'Add RSS Feed' : 'Edit RSS Feed'}</span>
                        </nav>
                    </div>

                    <div className="rss-edit-card">
                        <form onSubmit={handleUpdate} className="rss-edit-form">
                            <div className="rss-form-group">
                                <label className="rss-form-label">Feed Link (URL)</label>
                                <input
                                    type="url"
                                    required
                                    className="rss-form-input"
                                    placeholder="Enter feed URL"
                                    value={editingFeed.url || ''}
                                    onChange={e => setEditingFeed(prev => prev ? { ...prev, url: e.target.value } : null)}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Category</label>
                                <select
                                    className="rss-form-select"
                                    value={editingFeed.category || ''}
                                    onChange={e => setEditingFeed(prev => prev ? { ...prev, category: e.target.value } : null)}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{capitalize(c)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Subheading</label>
                                <select
                                    className="rss-form-select"
                                    value={editingFeed.subheading || ''}
                                    onChange={e => setEditingFeed(prev => prev ? { ...prev, subheading: e.target.value } : null)}
                                >
                                    <option value="" disabled>Select Subheading</option>
                                    <option value="top-stories">Top Stories</option>
                                    <option value="featured">Featured</option>
                                </select>
                            </div>

                            <div className="rss-form-group">
                                <label className="rss-form-label">Status</label>
                                <div className="rss-radio-group">
                                    <label className="rss-radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={editingFeed.status !== false}
                                            onChange={() => setEditingFeed(prev => prev ? { ...prev, status: true } : null)}
                                        />
                                        <span className="rss-radio-custom orange"></span>
                                        Active
                                    </label>
                                    <label className="rss-radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={editingFeed.status === false}
                                            onChange={() => setEditingFeed(prev => prev ? { ...prev, status: false } : null)}
                                        />
                                        <span className="rss-radio-custom grey"></span>
                                        Inactive
                                    </label>
                                </div>
                            </div>

                            <div className="rss-form-actions-centered">
                                <button type="submit" className="rss-btn-submit-gradient">
                                    {isAdding ? 'Add RSS Feed' : 'Update RSS Feed'}
                                </button>
                                <button type="button" className="rss-btn-back-link" onClick={closeForm}>
                                    Back
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <>
                    {/* Header */}
                    <div className="rss-page-header">
                        <h1 className="rss-page-title">RSS FEED LIST</h1>
                        <nav className="rss-breadcrumb">
                            <span>RSS Feeds</span>
                            <span className="rss-bc-sep">›</span>
                            <span className="rss-bc-active">RSS Feed List</span>
                        </nav>
                    </div>

                    {error && (
                        <div className="rss-error-banner">⚠️ {error}</div>
                    )}

                    {/* Action buttons */}
                    <div className="rss-actions-final">
                        <button className="rss-btn-delete-final" onClick={handleBulkDelete}>
                            <span className="rss-btn-icon-v2">🗑️</span> Delete Feed
                        </button>
                        <button className="rss-btn-add-final" onClick={openAddForm}>
                            <span className="rss-btn-icon-v2">⊕</span> Add Feed
                        </button>
                    </div>

                    {/* RSS Cache Status */}
                    <div className="rss-info-bar">
                        <div className="rss-info-item">
                            📁 Cached Articles: <strong>{cachedArticleCount !== null ? cachedArticleCount : '—'}</strong>
                        </div>
                        <div className="rss-info-item">
                            🕒 Last Fetched: <strong>{lastFetchedAt ? new Date(lastFetchedAt).toLocaleString() : 'Never'}</strong>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="rss-controls">
                        <div className="rss-entries-control">
                            Show
                            <select
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                className="rss-select"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            entries
                        </div>
                        <div className="rss-search-control">
                            Search:
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rss-search-input"
                                placeholder="Search feeds..."
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rss-table-wrap">
                        <table className="rss-table">
                            <thead>
                                <tr>
                                    <th className="rss-th-num"># S No.</th>
                                    <th className="rss-th-check">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={paginated.length > 0 && selectedFeeds.length === paginated.length}
                                        />
                                    </th>
                                    <th className="rss-th-link">🔗 Feed Link</th>
                                    <th className="rss-th-date">📅 Publish Date <span className="sort-icon">⇅</span></th>
                                    <th className="rss-th-cat">📁 Category</th>
                                    <th className="rss-th-sub">💬 Subheading</th>
                                    <th className="rss-th-fetched">🕒 Last Fetched <span className="sort-icon">⇅</span></th>
                                    <th className="rss-th-status">⚡ Status</th>
                                    <th className="rss-th-action">⚙️ Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="rss-loading-cell">
                                            <div className="rss-spinner" />
                                            Loading feeds...
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="rss-empty-cell">
                                            No feeds found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((feed, idx) => (
                                        <tr key={feed._id || idx} className="rss-row">
                                            <td className="rss-cell-num">
                                                {startIdx + idx + 1}
                                            </td>
                                            <td className="rss-cell-check">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFeeds.includes(feed._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedFeeds(p => [...p, feed._id])
                                                        else setSelectedFeeds(p => p.filter(id => id !== feed._id))
                                                    }}
                                                />
                                            </td>
                                            <td className="rss-cell-link">
                                                <a
                                                    href={feed.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rss-feed-url"
                                                >
                                                    {feed.url}
                                                </a>
                                            </td>
                                            <td className="rss-cell-date">
                                                Mar 24, 2026 05:40 PM
                                            </td>
                                            <td className="rss-cell-cat">
                                                <span className="rss-cat-badge">{capitalize(feed.category)}</span>
                                            </td>
                                            <td className="rss-cell-sub">
                                                {feed.subheading || '—'}
                                            </td>
                                            <td className="rss-cell-fetched">
                                                Mar 25, 2026 04:08 PM
                                            </td>
                                            <td className="rss-cell-status">
                                                <div 
                                                    className={`rss-toggle ${feed.status !== false ? 'active' : ''}`}
                                                    onClick={() => {
                                                        // Toggle logic would go here
                                                        console.log('Toggle status for', feed._id);
                                                    }}
                                                >
                                                    <div className="rss-toggle-label">{feed.status !== false ? 'On' : 'Off'}</div>
                                                    <div className="rss-toggle-handle"></div>
                                                </div>
                                            </td>
                                            <td className="rss-cell-action">
                                                <div className="rss-action-btns">
                                                    <button
                                                        className="rss-edit-btn-new"
                                                        title="Edit"
                                                        onClick={() => setEditingFeed(feed)}
                                                    >
                                                        📝
                                                    </button>
                                                    <button
                                                        className="rss-delete-btn-new"
                                                        title="Delete"
                                                        onClick={() => handleDelete(feed._id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filtered.length > 0 && (
                        <div className="rss-pagination">
                            <span className="rss-page-info">
                                Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, filtered.length)} of {filtered.length} entries
                            </span>
                            <div className="rss-page-btns">
                                <button
                                    className="rss-page-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum: number
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`rss-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                                <button
                                    className="rss-page-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )
            }
        </div >
    )
}
