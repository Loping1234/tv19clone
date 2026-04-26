import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Edit, CheckCircle, AlertCircle, X } from 'react-feather';
import './Categories.css';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent: any;
    description: string;
    status: boolean;
    isMainCategory: boolean;
    createdAt: string;
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entries, setEntries] = useState(10);

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

    const handleAdd = () => {
        setEditingCategory({
            name: '',
            slug: '',
            parent: null,
            description: '',
            status: true,
            isMainCategory: false
        });
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            setToast({ type: 'success', msg: 'Category deleted successfully' });
            fetchCategories();
        } catch (error: any) {
            console.error('Delete error:', error);
            setToast({ type: 'error', msg: error.message || 'Failed to delete category' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name) {
            setToast({ type: 'error', msg: 'Category name is required' });
            return;
        }

        try {
            const method = editingCategory._id ? 'PUT' : 'POST';
            const url = editingCategory._id
                ? `${API_BASE}/api/categories/${editingCategory._id}`
                : `${API_BASE}/api/categories`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(editingCategory)
            });

            if (!res.ok) throw new Error('Save failed');
            setToast({ type: 'success', msg: `Category ${editingCategory._id ? 'updated' : 'added'} successfully` });
            setShowModal(false);
            setEditingCategory(null);
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ ...category, status: !currentStatus })
            });

            if (!res.ok) throw new Error('Update failed');
            setCategories(prev => prev.map(c => c._id === id ? { ...c, status: !currentStatus } : c));
        } catch (error) {
            console.error('Toggle status error:', error);
            setToast({ type: 'error', msg: 'Failed to update status' });
        }
    };

    // Group categories by parent
    const groupedCategories = categories.reduce((acc, cat) => {
        const parentId = cat.parent?._id || cat.parent || 'root';
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(cat);
        return acc;
    }, {} as Record<string, Category[]>);

    const totalPages = Math.ceil(categories.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginatedCategories = categories.slice(startIdx, startIdx + entries);

    if (loading) {
        return (
            <div className="categories-page">
                <h1 className="cat-page-title">CATEGORIES</h1>
                <div className="cat-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#999' }}>Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="categories-page">
            {toast && (
                <div className={`users-toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="cat-header-container">
                <h1 className="cat-page-title">CATEGORY LIST</h1>
                <button className="users-add-btn" onClick={handleAdd}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="cat-card">
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Parent</th>
                                <th>Slug</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        No categories found. Click "Add Category" to create one.
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map(cat => (
                                    <tr key={cat._id}>
                                        <td>{cat.name}</td>
                                        <td>{cat.parent?.name || '-'}</td>
                                        <td>{cat.slug}</td>
                                        <td>{cat.isMainCategory ? 'Main' : 'Sub'}</td>
                                        <td>
                                            <label className="users-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={cat.status}
                                                    onChange={() => toggleStatus(cat._id, cat.status)}
                                                />
                                                <span className="users-toggle-slider"></span>
                                            </label>
                                        </td>
                                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="users-actions">
                                                <button className="users-action-btn edit" onClick={() => handleEdit(cat)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="users-action-btn delete" onClick={() => handleDelete(cat._id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && categories.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={categories.length}
                        itemsPerPage={entries}
                        startIdx={startIdx}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {showModal && editingCategory && (
                <div className="users-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="users-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="users-modal-header">
                            <h2>{editingCategory._id ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="users-modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="users-modal-body">
                                <div className="users-form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={editingCategory.name || ''}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            const slug = name.toLowerCase().replace(/\s+/g, '-');
                                            setEditingCategory({ ...editingCategory, name, slug });
                                        }}
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>

                                <div className="users-form-group">
                                    <label>Slug *</label>
                                    <input
                                        type="text"
                                        value={editingCategory.slug || ''}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                        placeholder="category-slug"
                                        required
                                    />
                                </div>

                                <div className="users-form-group">
                                    <label>Parent Category</label>
                                    <select
                                        value={editingCategory.parent?._id || editingCategory.parent || ''}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, parent: e.target.value || null })}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {parentCategories.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="users-form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={editingCategory.description || ''}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                        placeholder="Enter category description"
                                        rows={3}
                                    />
                                </div>

                                <div className="users-form-group">
                                    <label className="users-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingCategory.status || false}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, status: e.target.checked })}
                                        />
                                        Active Status
                                    </label>
                                </div>

                                <div className="users-form-group">
                                    <label className="users-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingCategory.isMainCategory || false}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, isMainCategory: e.target.checked })}
                                        />
                                        Main Category
                                    </label>
                                </div>
                            </div>

                            <div className="users-modal-footer">
                                <button type="button" className="users-btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="users-btn-submit">
                                    {editingCategory._id ? 'Update' : 'Add'} Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <footer className="users-footer">
                2026 © TV19.
            </footer>
        </div>
    );
}
