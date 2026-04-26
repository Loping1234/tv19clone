import { useState, useEffect } from 'react';
import { Edit, Eye } from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

function authHeaders(contentType?: string) {
    const headers: Record<string, string> = { 'Authorization': `Bearer ${getToken()}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    metaKeyword: string;
    metaDescription: string;
    status: boolean;
    order: number;
    rssUrls: string[];
    createdAt: string;
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { fetchCategories(); }, []);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            setToast({ type: 'error', msg: 'Failed to load categories' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedItems.length === 0) {
            setToast({ type: 'error', msg: 'Please select at least one category' });
            return;
        }
        if (!confirm('Are you sure you want to delete selected categories?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/categories/bulk-delete`, {
                method: 'POST',
                headers: authHeaders('application/json'),
                body: JSON.stringify({ ids: selectedItems })
            });
            if (!res.ok) throw new Error('Delete failed');
            setToast({ type: 'success', msg: 'Categories deleted successfully' });
            setSelectedItems([]);
            fetchCategories();
        } catch {
            setToast({ type: 'error', msg: 'Failed to delete categories' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        try {
            const method = editingCategory._id ? 'PUT' : 'POST';
            const url = editingCategory._id ? `${API_BASE}/api/categories/${editingCategory._id}` : `${API_BASE}/api/categories`;
            const res = await fetch(url, { method, headers: authHeaders('application/json'), body: JSON.stringify(editingCategory) });
            if (!res.ok) throw new Error('Save failed');
            setToast({ type: 'success', msg: `Category ${editingCategory._id ? 'updated' : 'added'} successfully` });
            setEditingCategory(null);
            fetchCategories();
        } catch {
            setToast({ type: 'error', msg: 'Failed to save category' });
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/api/categories/${id}`, { 
                method: 'PUT', 
                headers: authHeaders('application/json'), 
                body: JSON.stringify({ status: !currentStatus }) 
            });
            if (!res.ok) throw new Error('Update failed');
            setCategories(prev => prev.map(c => c._id === id ? { ...c, status: !currentStatus } : c));
        } catch {
            setToast({ type: 'error', msg: 'Failed to update status' });
        }
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedItems(e.target.checked ? paginatedCategories.map(c => c._id) : []);
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredCategories = categories.filter(c =>
        !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
    const startIdx = (currentPage - 1) * entriesPerPage;
    const paginatedCategories = filteredCategories.slice(startIdx, startIdx + entriesPerPage);

    return (
        <div className="rss-page">
            {toast && (
                <div className={`users-toast ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                    {toast.msg}
                </div>
            )}

            {editingCategory ? (
                <>
                    <div className="rss-page-header">
                        <h1 className="rss-page-title">{editingCategory._id ? 'EDIT CATEGORY' : 'ADD CATEGORY'}</h1>
                        <nav className="rss-breadcrumb">
                            <span className="rss-bc-item">Categories</span>
                            <span className="rss-bc-sep">›</span>
                            <span className="rss-bc-active">{editingCategory._id ? 'Edit Category' : 'Add Category'}</span>
                        </nav>
                    </div>

                    <div className="rss-edit-card">
                        <form onSubmit={handleSave} className="rss-edit-form">
                            <div className="rss-form-group">
                                <label className="rss-form-label">Category Name *</label>
                                <input
                                    type="text"
                                    className="rss-form-input"
                                    placeholder="Enter category name"
                                    value={editingCategory.name || ''}
                                    onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Slug *</label>
                                <input
                                    type="text"
                                    className="rss-form-input"
                                    placeholder="Enter slug"
                                    value={editingCategory.slug || ''}
                                    onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Order (Lower numbers appear first)</label>
                                <input
                                    type="number"
                                    className="rss-form-input"
                                    placeholder="e.g. 1"
                                    value={editingCategory.order || 0}
                                    onChange={e => setEditingCategory({...editingCategory, order: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">RSS URLs (Comma-separated)</label>
                                <textarea
                                    className="rss-form-input"
                                    placeholder="Enter RSS URLs, one per line or separated by commas"
                                    value={editingCategory.rssUrls?.join(', ') || ''}
                                    onChange={e => setEditingCategory({...editingCategory, rssUrls: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                                    rows={3}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Meta Keyword</label>
                                <input
                                    type="text"
                                    className="rss-form-input"
                                    placeholder="Enter meta keywords"
                                    value={editingCategory.metaKeyword || ''}
                                    onChange={e => setEditingCategory({...editingCategory, metaKeyword: e.target.value})}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Meta Description</label>
                                <textarea
                                    className="rss-form-input"
                                    placeholder="Enter meta description"
                                    value={editingCategory.metaDescription || ''}
                                    onChange={e => setEditingCategory({...editingCategory, metaDescription: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Category Description</label>
                                <textarea
                                    className="rss-form-input"
                                    placeholder="Enter category description"
                                    value={editingCategory.description || ''}
                                    onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="rss-form-group">
                                <label className="rss-form-label">Status</label>
                                <div className="rss-radio-group">
                                    <label className="rss-radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={editingCategory.status !== false}
                                            onChange={() => setEditingCategory({...editingCategory, status: true})}
                                        />
                                        <span className="rss-radio-custom orange"></span>
                                        Active
                                    </label>
                                    <label className="rss-radio-label">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={editingCategory.status === false}
                                            onChange={() => setEditingCategory({...editingCategory, status: false})}
                                        />
                                        <span className="rss-radio-custom grey"></span>
                                        Inactive
                                    </label>
                                </div>
                            </div>
                            <div className="rss-form-actions-centered">
                                <button type="submit" className="rss-btn-submit-gradient">
                                    {editingCategory._id ? 'Update Category' : 'Add Category'}
                                </button>
                                <button type="button" className="rss-btn-back-link" onClick={() => setEditingCategory(null)}>
                                    Back
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <>
                    <div className="rss-page-header">
                        <h1 className="rss-page-title">CATEGORY LIST</h1>
                        <nav className="rss-breadcrumb">
                            <span className="rss-bc-item">Categories</span>
                            <span className="rss-bc-sep">›</span>
                            <span className="rss-bc-active">Category List</span>
                        </nav>
                    </div>

                    <div className="rss-actions-final">
                        <button className="rss-btn-delete-final" onClick={handleDelete}>
                            <span className="rss-btn-icon-v2">🗑️</span> Delete Category
                        </button>
                        <button className="rss-btn-add-final" onClick={() => setEditingCategory({ name: '', slug: '', status: true })}>
                            <span className="rss-btn-icon-v2">⊕</span> Add Category
                        </button>
                    </div>

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
                                placeholder="Search categories..."
                            />
                        </div>
                    </div>

                    <div className="rss-table-wrap">
                        <table className="rss-table">
                            <thead>
                                <tr>
                                    <th className="rss-th-num"># S No.</th>
                                    <th className="rss-th-check">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={paginatedCategories.length > 0 && selectedItems.length === paginatedCategories.length}
                                        />
                                    </th>
                                    <th className="rss-th-cat">📁 Name <span className="sort-icon">⇅</span></th>
                                    <th className="rss-th-order">🔢 Order</th>
                                    <th className="rss-th-date">📅 Created On <span className="sort-icon">⇅</span></th>
                                    <th className="rss-th-status">⚡ Status</th>
                                    <th className="rss-th-action">⚙️ Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="rss-loading-cell">
                                            <div className="rss-spinner" />
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : paginatedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="rss-empty-cell">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCategories.map((cat, idx) => (
                                        <tr key={cat._id} className="rss-row">
                                            <td className="rss-cell-num">
                                                {startIdx + idx + 1}
                                            </td>
                                            <td className="rss-cell-check">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(cat._id)}
                                                    onChange={() => handleSelectItem(cat._id)}
                                                />
                                            </td>
                                            <td className="rss-cell-cat">
                                                <span className="rss-cat-badge">{cat.name}</span>
                                            </td>
                                            <td className="rss-cell-order">
                                                {cat.order || 0}
                                            </td>
                                            <td className="rss-cell-date">
                                                {new Date(cat.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', hour12: true
                                                })}
                                            </td>
                                            <td className="rss-cell-status">
                                                <div
                                                    className={`rss-toggle ${cat.status ? 'active' : ''}`}
                                                    onClick={() => toggleStatus(cat._id, cat.status)}
                                                >
                                                    <div className="rss-toggle-label">{cat.status ? 'On' : 'Off'}</div>
                                                    <div className="rss-toggle-handle"></div>
                                                </div>
                                            </td>
                                            <td className="rss-cell-action">
                                                <div className="rss-action-btns">
                                                    <button
                                                        className="rss-edit-btn-new"
                                                        title="Edit"
                                                        onClick={() => setEditingCategory(cat)}
                                                    >
                                                        📝
                                                    </button>
                                                    <button
                                                        className="rss-delete-btn-new"
                                                        title="Delete"
                                                        onClick={() => {
                                                            setSelectedItems([cat._id]);
                                                            handleDelete();
                                                        }}
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

                    {!loading && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredCategories.length}
                            itemsPerPage={entriesPerPage}
                            startIdx={startIdx}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Categories;
