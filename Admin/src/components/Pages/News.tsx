import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Eye, Edit } from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface NewsArticle {
    _id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    category: string;
    publishedAt: string;
    content: string;
    source: string;
    status: boolean;
    featured: boolean;
    trending: boolean;
    top: boolean;
    breaking: boolean;
}

export default function News() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [viewingNews, setViewingNews] = useState<NewsArticle | null>(null);
    const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const page = 1;
            const limit = 1000; // Fetch first 1000 for admin panel
            const res = await fetch(`${API_BASE}/api/admin/news?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNews(data.news || []);
            }
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNews = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNews) return;

        // Optimistically update or add
        if (editingNews._id === '') {
            // It's a new article
            const newArticle = { ...editingNews, _id: Date.now().toString() };
            setNews(prev => [newArticle, ...prev]);
            setEditingNews(null);

            // Mock API POST
            try {
                await fetch(`${API_BASE}/api/admin/news`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(newArticle)
                });
            } catch (error) {
                console.error('Failed to add news via API', error);
            }
        } else {
            // It's an edit
            setNews(prev => prev.map(item => item._id === editingNews._id ? editingNews : item));
            setEditingNews(null);

            // Later this will sync to backend API via PUT request
            try {
                await fetch(`${API_BASE}/api/admin/news/${editingNews._id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(editingNews)
                });
            } catch (error) {
                console.error('Failed to update news via API', error);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedRows.size === 0) {
            alert('Please select at least one news article to delete.');
            return;
        }

        if (window.confirm('Are you sure you want to delete the selected news articles? This action is irreversible.')) {
            // Optimistically update UI
            const idsToDelete = Array.from(selectedRows);
            setNews(prev => prev.filter(item => !idsToDelete.includes(item._id)));
            setSelectedRows(new Set()); // clear selection

            // Mock API DELETE calls
            try {
                await Promise.all(idsToDelete.map(id =>
                    fetch(`${API_BASE}/api/admin/news/${id}`, { 
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    })
                ));
            } catch (error) {
                console.error('Failed to delete some news articles', error);
            }
        }
    };

    const toggleSelectRow = (id: string) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(new Set(filteredNews.map(item => item._id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleAddNewsClick = () => {
        setEditingNews({
            _id: '',
            title: '',
            description: '',
            url: '',
            image: '',
            category: 'education', // default
            publishedAt: new Date().toISOString(),
            content: '',
            source: 'TV19 News',
            status: true,
            featured: false,
            trending: false,
            top: false,
            breaking: false
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!editingNews) return;
        const target = e.target;
        const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
        const name = target.name;

        setEditingNews({ ...editingNews, [name]: value });
    };

    const handleToggle = async (id: string, field: keyof NewsArticle, currentValue: boolean) => {
        // Optimistically update UI
        setNews(prevNews => prevNews.map(item =>
            item._id === id ? { ...item, [field]: !currentValue } : item
        ));

        // Let's create an endpoint in the next step to handle updates, but we'll mock the call here
        try {
            await fetch(`${API_BASE}/api/admin/news/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ [field]: !currentValue })
            });
        } catch (error) {
            console.error('Failed to update toggle', error);
            // Revert on failure
            setNews(prevNews => prevNews.map(item =>
                item._id === id ? { ...item, [field]: currentValue } : item
            ));
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, searchQuery, entries]);

    const filteredNews = news.filter(item => {
        if (categoryFilter && item.category !== categoryFilter) return false;
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredNews.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginatedNews = filteredNews.slice(startIdx, startIdx + entries);

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <div className={`custom-toggle ${checked ? 'active' : ''}`} onClick={onChange}>
            <div className="toggle-inner">
                <div className="toggle-on">On</div>
                <div className="toggle-off">Off</div>
            </div>
            <div className="toggle-handle"></div>
        </div>
    );

    return (
        <div className="rss-page">
            {/* Header & Breadcrumb */}
            <div className="rss-page-header">
                <h1 className="rss-page-title">{editingNews ? (editingNews._id ? 'EDIT NEWS' : 'ADD NEWS') : viewingNews ? 'NEWS INFORMATION' : 'NEWS LIST'}</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">News</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">{editingNews ? (editingNews._id ? 'Edit News' : 'Add News') : viewingNews ? 'News Information' : 'News List'}</span>
                </nav>
            </div>
                {editingNews ? (
                    <div className="news-edit-container">
                        <form className="news-edit-form" onSubmit={handleUpdateNews}>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Language <span className="req">*</span></label>
                                    <select className="form-control" name="language" defaultValue="english">
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi</option>
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Category <span className="req">*</span></label>
                                    <select className="form-control" name="category" value={editingNews.category} onChange={handleFormChange}>
                                        <option value="education">Education</option>
                                        <option value="state">State</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="india">India</option>
                                        <option value="politics">Politics</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Sub Category</label>
                                    <select className="form-control" name="subCategory" defaultValue="">
                                        <option value="">Select Subcategory</option>
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Title <span className="req">*</span></label>
                                    <input type="text" className="form-control" name="title" value={editingNews.title} onChange={handleFormChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Slug <span className="req">*</span></label>
                                <input type="text" className="form-control" name="slug" defaultValue={editingNews.title.toLowerCase().replace(/\s+/g, '-')} />
                            </div>

                            <div className="form-group">
                                <label>Short Description <span className="req">*</span></label>
                                <textarea className="form-control" name="description" rows={3} value={editingNews.description} onChange={handleFormChange} required />
                            </div>

                            <div className="form-group">
                                <label>Content <span className="req">*</span></label>
                                {/* Mocking Rich Text Editor with a Textarea and Toolbar style class */}
                                <div className="mock-rich-editor">
                                    <div className="editor-toolbar">
                                        <span>B</span><span>I</span><span>U</span><span><s>S</s></span>
                                        <span className="sep">|</span>
                                        <span>🔗</span><span>🖼</span><span>🖹</span>
                                    </div>
                                    <textarea className="form-control rich-textarea" name="content" rows={10} value={editingNews.content || editingNews.description} onChange={handleFormChange} required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group fourth">
                                    <label>Image(optional) (Ratio: 800X500)</label>
                                    <input type="file" className="form-control file-input" accept="image/*" />
                                </div>
                                <div className="form-group fourth">
                                    <label>Image Credit</label>
                                    <input type="text" className="form-control" name="imageCredit" />
                                </div>
                                <div className="form-group fourth">
                                    <label>Image Title</label>
                                    <input type="text" className="form-control" name="imageTitle" />
                                </div>
                                <div className="form-group fourth">
                                    <label>Alter Tag</label>
                                    <input type="text" className="form-control" name="alterTag" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tags (Separate tags with commas. e.g. "tag1, tag2")</label>
                                <input type="text" className="form-control" name="tags" value={editingNews.category} onChange={handleFormChange} />
                            </div>

                            <div className="form-row">
                                <div className="form-group third">
                                    <label>Meta Title</label>
                                    <input type="text" className="form-control" name="metaTitle" defaultValue={editingNews.title} />
                                </div>
                                <div className="form-group third">
                                    <label>Meta Description</label>
                                    <input type="text" className="form-control" name="metaDescription" defaultValue={editingNews.description} />
                                </div>
                                <div className="form-group third">
                                    <label>Meta Keywords</label>
                                    <input type="text" className="form-control" name="metaKeywords" defaultValue={editingNews.category} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group third">
                                    <label>Video URL (optional)</label>
                                    <input type="url" className="form-control" name="videoUrl" />
                                </div>
                                <div className="form-group third">
                                    <label>Author / Source <span className="req">*</span></label>
                                    <input type="text" className="form-control" name="source" value={editingNews.source || 'TV19 News'} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group third">
                                    <label>Publish Date / Time</label>
                                    <input type="datetime-local" className="form-control" name="publishedAt" defaultValue={new Date(editingNews.publishedAt).toISOString().slice(0, 16)} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className="form-row edit-toggles">
                                <div className="form-group auto-width">
                                    <label>Status <span className="req">*</span></label>
                                    <ToggleSwitch checked={editingNews.status} onChange={() => setEditingNews({ ...editingNews, status: !editingNews.status })} />
                                </div>
                                <div className="form-group auto-width">
                                    <label>Featured</label>
                                    <ToggleSwitch checked={editingNews.featured} onChange={() => setEditingNews({ ...editingNews, featured: !editingNews.featured })} />
                                </div>
                                <div className="form-group auto-width">
                                    <label>Trending</label>
                                    <ToggleSwitch checked={editingNews.trending} onChange={() => setEditingNews({ ...editingNews, trending: !editingNews.trending })} />
                                </div>
                                <div className="form-group auto-width">
                                    <label>Top Story</label>
                                    <ToggleSwitch checked={editingNews.top} onChange={() => setEditingNews({ ...editingNews, top: !editingNews.top })} />
                                </div>
                                <div className="form-group auto-width">
                                    <label>Breaking</label>
                                    <ToggleSwitch checked={editingNews.breaking} onChange={() => setEditingNews({ ...editingNews, breaking: !editingNews.breaking })} />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit">Submit</button>
                                <button type="button" className="btn-cancel" onClick={() => setEditingNews(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : !viewingNews ? (
                    <>
                        {/* Action Buttons */}
                        <div className="rss-actions-final">
                            <button className="rss-btn-delete-final" onClick={handleDelete}>
                                <span className="rss-btn-icon-v2">🗑️</span> Delete News
                            </button>
                            <button className="rss-btn-add-final" onClick={handleAddNewsClick}>
                                <span className="rss-btn-icon-v2">⊕</span> Add News
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="rss-controls">
                            <div className="rss-entries-control">
                                Show
                                <select
                                    value={entries}
                                    onChange={(e) => setEntries(Number(e.target.value))}
                                    className="rss-select"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                entries
                            </div>
                            <div className="rss-search-control">
                                Search:
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="rss-search-input"
                                    placeholder="Search news..."
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="rss-table-wrap">
                            <table className="rss-table">
                                <thead>
                                    <tr>
                                        <th className="rss-th-num"># S No.</th>
                                        <th className="rss-th-check">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={filteredNews.length > 0 && selectedRows.size === filteredNews.length}
                                            />
                                        </th>
                                        <th className="rss-th-cat">📁 Category <span className="sort-icon">⇅</span></th>
                                        <th className="rss-th-link">🖼️ Image</th>
                                        <th className="rss-th-sub">📅 Published <span className="sort-icon">⇅</span></th>
                                        <th className="rss-th-status">⚡ Status</th>
                                        <th className="rss-th-action">⚙️ Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="rss-loading-cell">
                                                <div className="rss-spinner" />
                                                Loading news...
                                            </td>
                                        </tr>
                                    ) : paginatedNews.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="rss-empty-cell">No news found.</td>
                                        </tr>
                                    ) : (
                                        paginatedNews.map((item, index) => {
                                            const isExpanded = expandedRows.has(item._id);
                                            return (
                                                <React.Fragment key={item._id}>
                                                    <tr className="rss-row">
                                                        <td className="rss-cell-num">
                                                            <span className={`expand-icon ${isExpanded ? 'minus' : ''}`} onClick={() => toggleExpand(item._id)}>
                                                                {isExpanded ? '−' : '+'}
                                                            </span> {startIdx + index + 1}
                                                        </td>
                                                        <td className="rss-cell-check">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.has(item._id)}
                                                                onChange={() => toggleSelectRow(item._id)}
                                                            />
                                                        </td>
                                                        <td className="rss-cell-cat">
                                                            <span className="rss-cat-badge">{item.category}</span>
                                                        </td>
                                                        <td className="rss-cell-link">
                                                            {item.image ? (
                                                                <img src={item.image} alt="Thumbnail" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                            ) : (
                                                                <span className="no-img">No Image</span>
                                                            )}
                                                        </td>
                                                        <td className="rss-cell-date">{new Date(item.publishedAt).toLocaleString()}</td>
                                                        <td className="rss-cell-status">
                                                            <div className={`rss-toggle ${item.status ? 'active' : ''}`} onClick={() => handleToggle(item._id, 'status', item.status)}>
                                                                <div className="rss-toggle-label">{item.status ? 'On' : 'Off'}</div>
                                                                <div className="rss-toggle-handle"></div>
                                                            </div>
                                                        </td>
                                                        <td className="rss-cell-action">
                                                            <div className="rss-action-btns">
                                                                <button className="rss-edit-btn-new" title="View" onClick={() => setViewingNews(item)}>
                                                                    👁️
                                                                </button>
                                                                <button className="rss-delete-btn-new" title="Edit" onClick={() => setEditingNews(item)}>
                                                                    📝
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr key={`${item._id}-detail`} className="rss-row">
                                                            <td colSpan={7} style={{ background: '#f8f9fa' }}>
                                                                <div className="expanded-detail" style={{ padding: '16px' }}>
                                                                    <div style={{ marginBottom: '12px' }}>
                                                                        <strong>Title:</strong> {item.title}
                                                                    </div>
                                                                    <div style={{ marginBottom: '12px' }}>
                                                                        <strong>Description:</strong> {item.description || 'No description'}
                                                                    </div>
                                                                    <div>
                                                                        <strong>Source:</strong> {item.source || 'TV19 News'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!loading && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredNews.length}
                                itemsPerPage={entries}
                                startIdx={startIdx}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                ) : (
                    <div className="news-detail-container">
                        <h2 className="news-detail-header">NEWS DETAILS</h2>

                        <div className="detail-row">
                            <div className="detail-label-col">Title:</div>
                            <div className="detail-value-col">{viewingNews.title}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Category:</div>
                            <div className="detail-value-col capitalize">{viewingNews.category}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Image:</div>
                            <div className="detail-value-col">
                                {viewingNews.image ? (
                                    <img src={viewingNews.image} alt="Preview" className="detail-image-preview" />
                                ) : 'No Image'}
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Published At:</div>
                            <div className="detail-value-col">{new Date(viewingNews.publishedAt).toLocaleString()}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Status:</div>
                            <div className="detail-value-col">
                                <span className={`badge-status ${viewingNews.status ? 'active' : 'inactive'}`}>
                                    {viewingNews.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Featured:</div>
                            <div className="detail-value-col">
                                <span className={`badge-status ${viewingNews.featured ? 'active' : 'inactive'}`}>
                                    {viewingNews.featured ? 'Featured' : 'Not Featured'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Trending:</div>
                            <div className="detail-value-col">
                                <span className={`badge-status ${viewingNews.trending ? 'active' : 'inactive'}`}>
                                    {viewingNews.trending ? 'Trending' : 'Not Trending'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label-col">Top Story:</div>
                            <div className="detail-value-col">
                                <span className={`badge-status ${viewingNews.top ? 'active' : 'inactive'}`}>
                                    {viewingNews.top ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-back-actions">
                            <button className="rss-btn-back-link" onClick={() => setViewingNews(null)}>
                                ← Back to News List
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}