import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Trash2, Eye, Edit, FileText, AlignLeft, ArrowLeft } from 'react-feather';
import './Categories.css';
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
    parent: string | null;
    description: string;
    icon: string;
    order: number;
    status: boolean;
    isMainCategory: boolean;
    createdAt: string;
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { fetchCategories(); }, []);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, entries]);

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
        if (selectedItems.length === 0) { setToast({ type: 'error', msg: 'Please select at least one category' }); return; }
        if (!confirm('Are you sure you want to delete selected categories?')) return;
        try {
            await Promise.all(selectedItems.map(id => fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE', headers: authHeaders() })));
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
            const category = categories.find(c => c._id === id);
            if (!category) return;
            const res = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'PUT', headers: authHeaders('application/json'), body: JSON.stringify({ ...category, status: !currentStatus }) });
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
        setSelectedItems(e.target.checked ? filteredCategories.map(c => c._id) : []);
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editingCategory) return;
        setEditingCategory({ ...editingCategory, [e.target.name]: e.target.value });
    };

    const filteredCategories = categories.filter(c =>
        !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredCategories.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginatedCategories = filteredCategories.slice(startIdx, startIdx + entries);

    return (
        <div className="categories-page">
            {toast && (
                <div className={`users-toast ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 6, background: toast.type === 'success' ? '#28a745' : '#dc3545', color: '#fff', fontSize: 14 }}>
                    {toast.msg}
                </div>
            )}

            <div className="cat-header-container">
                <h1 className="cat-page-title">
                    {editingCategory ? (editingCategory._id ? 'EDIT CATEGORY' : 'ADD CATEGORY') : viewingCategory ? 'CATEGORY INFORMATION' : 'CATEGORY LIST'}
                </h1>
                <div className="cat-breadcrumb">
                    <span>Categories</span> <span className="cat-bc-sep">›</span>
                    <span>{editingCategory ? (editingCategory._id ? 'Edit Category' : 'Add Category') : viewingCategory ? 'Category Information' : 'Category List'}</span>
                </div>
            </div>

            <div className="cat-card">
                {editingCategory ? (
                    <div className="cat-edit-container">
                        <form className="cat-edit-form" onSubmit={handleSave}>
                            <div className="cat-form-group">
                                <label className="cat-form-label">Category Name</label>
                                <input type="text" className="cat-form-input" name="name" value={editingCategory.name} onChange={handleEditFormChange} required />
                            </div>
                            <div className="cat-form-group">
                                <label className="cat-form-label">Slug</label>
                                <input type="text" className="cat-form-input" name="slug" value={editingCategory.slug} onChange={handleEditFormChange} />
                            </div>
                            <div className="cat-form-group">
                                <label className="cat-form-label">Description</label>
                                <textarea className="cat-form-textarea" name="description" value={editingCategory.description} onChange={handleEditFormChange} />
                            </div>
                            <div className="cat-form-group" style={{ marginTop: '10px' }}>
                                <label className="cat-form-label">Status</label>
                                <div className="cat-form-status">
                                    <label className="cat-radio-label">
                                        <input type="radio" name="status" checked={editingCategory.status === true} onChange={() => setEditingCategory({ ...editingCategory, status: true })} /> Active
                                    </label>
                                    <label className="cat-radio-label">
                                        <input type="radio" name="status" checked={editingCategory.status === false} onChange={() => setEditingCategory({ ...editingCategory, status: false })} /> Inactive
                                    </label>
                                </div>
                            </div>
                            <div className="cat-form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
                                <button type="submit" className="cat-btn-update">{editingCategory._id ? 'Update Category' : 'Add Category'}</button>
                                <button type="button" className="cat-btn-back-text" onClick={() => setEditingCategory(null)}>Back</button>
                            </div>
                        </form>
                    </div>
                ) : viewingCategory ? (
                    <div className="cat-details-container">
                        <div className="cat-details-card">
                            <h2 className="cat-details-card-title">CATEGORY DETAILS</h2>
                            <div className="cat-detail-row"><div className="cat-detail-label">Category Name:</div><div className="cat-detail-value">{viewingCategory.name}</div></div>
                            <div className="cat-detail-row"><div className="cat-detail-label">Slug:</div><div className="cat-detail-value">{viewingCategory.slug}</div></div>
                            <div className="cat-detail-row"><div className="cat-detail-label">Description:</div><div className="cat-detail-value">{viewingCategory.description || '—'}</div></div>
                            <div className="cat-detail-row"><div className="cat-detail-label">Created On:</div><div className="cat-detail-value">{new Date(viewingCategory.createdAt).toLocaleString()}</div></div>
                            <div className="cat-detail-row" style={{ alignItems: 'center' }}>
                                <div className="cat-detail-label">Status:</div>
                                <div className="cat-detail-value">
                                    <span className={viewingCategory.status ? 'cat-badge-active' : 'cat-badge-inactive'}>{viewingCategory.status ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="cat-detail-actions">
                                <button className="cat-btn-back-orange" onClick={() => setViewingCategory(null)}><ArrowLeft size={16} /> Back to Categories</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="cat-actions-row">
                            <button className="cat-btn-add" onClick={() => setEditingCategory({ _id: '', name: '', slug: '', parent: null, description: '', icon: '', order: 0, status: true, isMainCategory: false, createdAt: new Date().toISOString() })}>
                                <PlusCircle size={16} /> Add Category
                            </button>
                            <button className="cat-btn-delete" onClick={handleDelete}>
                                <Trash2 size={16} /> Delete Category
                            </button>
                        </div>

                        <div className="cat-controls-row">
                            <div className="cat-show-entries">
                                <span>Show</span>
                                <select value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="cat-search">
                                <span>Search:</span>
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="cat-table-responsive">
                            <table className="cat-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}># S No.</th>
                                        <th style={{ width: '40px' }}>
                                            <input type="checkbox" onChange={handleSelectAll} checked={paginatedCategories.length > 0 && selectedItems.length === paginatedCategories.length} />
                                        </th>
                                        <th><span className="th-content"><FileText size={14} /> Name <span className="sort-icon">⇅</span></span></th>
                                        <th><span className="th-content"><FileText size={14} /> Created On <span className="sort-icon">⇅</span></span></th>
                                        <th><span className="th-content">Status</span></th>
                                        <th><span className="th-content">Action</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading categories...</td></tr>
                                    ) : paginatedCategories.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No categories found.</td></tr>
                                    ) : (
                                        paginatedCategories.map((cat, index) => {
                                            const isExpanded = expandedRows.includes(cat._id);
                                            return (
                                                <React.Fragment key={cat._id}>
                                                    <tr className={isExpanded ? 'expanded-parent-row' : ''}>
                                                        <td>
                                                            <div className="sno-cell">
                                                                <div className="expand-icon" onClick={() => toggleRow(cat._id)}>
                                                                    {isExpanded ? <MinusCircle size={16} /> : <PlusCircle size={16} />}
                                                                </div>
                                                                {startIdx + index + 1}
                                                            </div>
                                                        </td>
                                                        <td><input type="checkbox" checked={selectedItems.includes(cat._id)} onChange={() => handleSelectItem(cat._id)} /></td>
                                                        <td>{cat.name}</td>
                                                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <label className="cat-switch">
                                                                <input type="checkbox" checked={cat.status} onChange={() => toggleStatus(cat._id, cat.status)} />
                                                                <span className="cat-slider cat-round">
                                                                    <span className="cat-switch-text">{cat.status ? 'On' : 'Off'}</span>
                                                                </span>
                                                            </label>
                                                        </td>
                                                        <td>
                                                            <div className="cat-action-btns">
                                                                <button className="cat-action-btn view-btn" onClick={() => setViewingCategory(cat)}><Eye size={14} /></button>
                                                                <button className="cat-action-btn edit-btn" onClick={() => setEditingCategory(cat)}><Edit size={14} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="expanded-details-row">
                                                            <td colSpan={6} style={{ padding: 0 }}>
                                                                <div className="expanded-details-container">
                                                                    <div className="meta-section">
                                                                        <strong><FileText size={14} className="meta-icon" /> Slug</strong>
                                                                        <p>{cat.slug}</p>
                                                                    </div>
                                                                    <div className="meta-section">
                                                                        <strong><AlignLeft size={14} className="meta-icon" /> Description</strong>
                                                                        <p>{cat.description || '—'}</p>
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

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredCategories.length}
                            itemsPerPage={entries}
                            startIdx={startIdx}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>2026 © TV19.</footer>
        </div>
    );
};

export default Categories;
