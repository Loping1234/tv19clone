import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Trash2, Eye, Edit, FileText, AlignLeft, ArrowLeft, CheckCircle, AlertCircle } from 'react-feather';
import './Categories.css';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

function authHeaders(contentType?: string) {
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${getToken()}`
    };
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
    children?: Category[];
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

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
                setParentCategories((data.categories || []).filter((c: Category) => !c.parent));
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
            await Promise.all(selectedItems.map(id =>
                fetch(`${API_BASE}/api/categories/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                })
            ));
            setToast({ type: 'success', msg: 'Categories deleted successfully' });
            setSelectedItems([]);
            fetchCategories();
        } catch (error) {
            console.error('Delete error:', error);
            setToast({ type: 'error', msg: 'Failed to delete categories' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const method = editingCategory._id ? 'PUT' : 'POST';
            const url = editingCategory._id
                ? `${API_BASE}/api/categories/${editingCategory._id}`
                : `${API_BASE}/api/categories`;

            const res = await fetch(url, {
                method,
                headers: authHeaders('application/json'),
                body: JSON.stringify(editingCategory)
            });

            if (!res.ok) throw new Error('Save failed');
            setToast({ type: 'success', msg: `Category ${editingCategory._id ? 'updated' : 'added'} successfully` });
            setEditingCategory(null);
            setShowAddModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Save error:', error);
            setToast({ type: 'error', msg: 'Failed to save category' });
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const category = categories.find(c => c._id === id);
            if (!category) return;

            const res = await fetch(`${API_BASE}/api/categories/${id}`, {
                method: 'PUT',
                headers: authHeaders('application/json'),
                body: JSON.stringify({ ...category, status: !currentStatus })
            });

            if (!res.ok) throw new Error('Update failed');
            setCategories(prev => prev.map(c => c._id === id ? { ...c, status: !currentStatus } : c));
        } catch (error) {
            console.error('Toggle status error:', error);
            setToast({ type: 'error', msg: 'Failed to update status' });
        }
    };

    const [editingCategory, setEditingCategory] = useState<typeof mockCategories[0] | null>(null);
    const [viewingCategory, setViewingCategory] = useState<typeof mockCategories[0] | null>(null);

    const toggleRow = (id: number) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter(rowId => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
    };

    const toggleStatus = (id: number) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, status: !cat.status } : cat
        ));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(categories.map(cat => cat.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editingCategory) return;
        setEditingCategory({ ...editingCategory, [e.target.name]: e.target.value });
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        setCategories(categories.map(cat => cat.id === editingCategory.id ? editingCategory : cat));
        setEditingCategory(null);
    };

    return (
        <div className="categories-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title">
                    {editingCategory ? 'EDIT CATEGORY' : viewingCategory ? 'CATEGORY INFORMATION' : 'CATEGORY LIST'}
                </h1>
                <div className="cat-breadcrumb">
                    <span>Categories</span> <span className="cat-bc-sep">›</span> 
                    <span>{editingCategory ? 'Edit Category' : viewingCategory ? 'Category Information' : 'Category List'}</span>
                </div>
            </div>

            <div className="cat-card">
                {editingCategory ? (
                    <div className="cat-edit-container">
                        <form className="cat-edit-form" onSubmit={handleUpdateCategory}>
                            <div className="cat-form-group">
                                <label className="cat-form-label">Category Name (recommended 10 characters)</label>
                                <input 
                                    type="text" 
                                    className="cat-form-input" 
                                    name="name"
                                    value={editingCategory.name} 
                                    onChange={handleEditFormChange} 
                                />
                            </div>

                            <div className="cat-form-group">
                                <label className="cat-form-label">Meta Keyword (recommended 50 characters)</label>
                                <input 
                                    type="text" 
                                    className="cat-form-input" 
                                    name="metaKeyword"
                                    value={editingCategory.metaKeyword} 
                                    onChange={handleEditFormChange} 
                                />
                            </div>

                            <div className="cat-form-group">
                                <label className="cat-form-label">Meta Title (recommended 50 characters)</label>
                                <input 
                                    type="text" 
                                    className="cat-form-input" 
                                    name="metaTitle"
                                    defaultValue={`${editingCategory.name} News Today - TV19 News | Global Updates`}
                                />
                            </div>

                            <div className="cat-form-group">
                                <label className="cat-form-label">Meta Description (recommended 150 characters)</label>
                                <textarea 
                                    className="cat-form-textarea" 
                                    name="metaDescription"
                                    value={editingCategory.metaDescription} 
                                    onChange={handleEditFormChange} 
                                />
                            </div>

                            <div className="cat-form-group" style={{marginTop: '10px'}}>
                                <label className="cat-form-label">Status</label>
                                <div className="cat-form-status">
                                    <label className="cat-radio-label">
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            checked={editingCategory.status === true}
                                            onChange={() => setEditingCategory({ ...editingCategory, status: true })}
                                        /> Active
                                    </label>
                                    <label className="cat-radio-label">
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            checked={editingCategory.status === false}
                                            onChange={() => setEditingCategory({ ...editingCategory, status: false })}
                                        /> Inactive
                                    </label>
                                </div>
                            </div>

                            <div className="cat-form-actions" style={{justifyContent: 'center', marginTop: '30px'}}>
                                <button type="submit" className="cat-btn-update">Update Category</button>
                                <button type="button" className="cat-btn-back-text" onClick={() => setEditingCategory(null)}>Back</button>
                            </div>
                        </form>
                    </div>
                ) : viewingCategory ? (
                    <div className="cat-details-container">
                        <div className="cat-details-card">
                            <h2 className="cat-details-card-title">CATEGORY DETAILS</h2>
                            
                            <div className="cat-detail-row">
                                <div className="cat-detail-label">Category Name:</div>
                                <div className="cat-detail-value">{viewingCategory.name}</div>
                            </div>

                            <div className="cat-detail-row">
                                <div className="cat-detail-label">Meta Keyword:</div>
                                <div className="cat-detail-value">{viewingCategory.metaKeyword}</div>
                            </div>

                            <div className="cat-detail-row">
                                <div className="cat-detail-label">Meta Description:</div>
                                <div className="cat-detail-value">{viewingCategory.metaDescription}</div>
                            </div>

                            <div className="cat-detail-row">
                                <div className="cat-detail-label">Created On:</div>
                                <div className="cat-detail-value">{viewingCategory.createdOn}</div>
                            </div>

                            <div className="cat-detail-row" style={{alignItems: 'center'}}>
                                <div className="cat-detail-label">Status:</div>
                                <div className="cat-detail-value">
                                    <span className={viewingCategory.status ? 'cat-badge-active' : 'cat-badge-inactive'}>
                                        {viewingCategory.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="cat-detail-actions">
                                <button className="cat-btn-back-orange" onClick={() => setViewingCategory(null)}>
                                    <ArrowLeft size={16} /> Back to Categories
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="cat-actions-row">
                            <button className="cat-btn-add">
                                <PlusCircle size={16} /> Add Category
                            </button>
                            <button className="cat-btn-delete">
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
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="cat-table-responsive">
                            <table className="cat-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}># S No.</th>
                                        <th style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedItems.length === categories.length && categories.length > 0}
                                            />
                                        </th>
                                        <th><span className="th-content"><FileText size={14} /> Name <span className="sort-icon">⇅</span></span></th>
                                        <th><span className="th-content"><FileText size={14} /> Created On <span className="sort-icon">⇅</span></span></th>
                                        <th><span className="th-content">Status</span></th>
                                        <th><span className="th-content">Action</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, index) => {
                                        const isExpanded = expandedRows.includes(cat.id);
                                        return (
                                            <React.Fragment key={cat.id}>
                                                <tr className={isExpanded ? 'expanded-parent-row' : ''}>
                                                    <td>
                                                        <div className="sno-cell">
                                                            <div className="expand-icon" onClick={() => toggleRow(cat.id)}>
                                                                {isExpanded ? <MinusCircle size={16} /> : <PlusCircle size={16} />}
                                                            </div>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(cat.id)}
                                                            onChange={() => handleSelectItem(cat.id)}
                                                        />
                                                    </td>
                                                    <td>{cat.name}</td>
                                                    <td>{cat.createdOn}</td>
                                                    <td>
                                                        <label className="cat-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={cat.status}
                                                                onChange={() => toggleStatus(cat.id)}
                                                            />
                                                            <span className="cat-slider cat-round">
                                                                <span className="cat-switch-text">{cat.status ? 'On' : 'Off'}</span>
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <div className="cat-action-btns">
                                                            <button className="cat-action-btn view-btn" onClick={() => setViewingCategory(cat)}>
                                                                <Eye size={14} />
                                                            </button>
                                                            <button className="cat-action-btn edit-btn" onClick={() => setEditingCategory(cat)}>
                                                                <Edit size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="expanded-details-row">
                                                        <td colSpan={6} style={{ padding: 0 }}>
                                                            <div className="expanded-details-container">
                                                                <div className="meta-section">
                                                                    <strong><FileText size={14} className="meta-icon" /> Meta Keyword</strong>
                                                                    <p>{cat.metaKeyword}</p>
                                                                </div>
                                                                <div className="meta-section">
                                                                    <strong><AlignLeft size={14} className="meta-icon" /> Meta Description</strong>
                                                                    <p>{cat.metaDescription}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="cat-pagination-row">
                            <div className="cat-pagination">
                                <button className="cat-page-btn default">First</button>
                                <button className="cat-page-btn default">Previous</button>
                                <button className="cat-page-btn active">1</button>
                                <button className="cat-page-btn">2</button>
                                <button className="cat-page-btn default">Next</button>
                                <button className="cat-page-btn default">Last</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
};

export default Categories;