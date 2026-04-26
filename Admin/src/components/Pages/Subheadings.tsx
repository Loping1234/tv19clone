import { useState, useEffect, useCallback } from 'react'
import { 
    Hash, 
    MessageCircle, 
    Settings, 
    ChevronRight, 
    Plus, 
    Trash2, 
    Edit, 
    Check, 
    X,
    Folder
} from 'react-feather'
import './Subheadings.css' 

const API = 'http://localhost:5000'

function getToken() {
    return localStorage.getItem('adminToken') || ''
}

interface Subheading {
    _id: string;
    category: string;
    label: string;
    slug: string;
    order: number;
    status: boolean;
    rssUrls: string[];
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

export default function Subheadings() {
    const [subheadings, setSubheadings] = useState<Subheading[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editLabel, setEditLabel] = useState('')
    const [newCategory, setNewCategory] = useState('')
    const [newLabel, setNewLabel] = useState('')
    const [newSlug, setNewSlug] = useState('')
    const [newOrder, setNewOrder] = useState(0)
    const [newStatus, setNewStatus] = useState(true)
    const [newRss, setNewRss] = useState('')
    const [adding, setAdding] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [subRes, catRes] = await Promise.all([
                fetch(`${API}/api/subheadings`),
                fetch(`${API}/api/categories`)
            ])
            if (!subRes.ok || !catRes.ok) throw new Error('Server error')
            const subData = await subRes.json() as { subheadings: Subheading[] }
            const catData = await catRes.json() as { categories: Category[] }
            setSubheadings(subData.subheadings)
            setCategories(catData.categories)
        } catch {
            setError('Could not reach the TV19 server. Make sure it is running on port 5000.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const capitalize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API}/api/subheadings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ 
                    category: newCategory, 
                    label: newLabel.trim(),
                    slug: newSlug || newLabel.trim().toLowerCase().replace(/\s+/g, '-'),
                    order: newOrder,
                    status: newStatus,
                    rssUrls: newRss.split(',').map(s => s.trim()).filter(s => s)
                })
            })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            setNewCategory('')
            setNewLabel('')
            setNewSlug('')
            setNewOrder(0)
            setNewStatus(true)
            setNewRss('')
            setAdding(false)
            fetchData()
        } catch (err) {
            alert((err as Error).message || 'Failed to add subheading')
        }
    }

    const handleUpdate = async (id: string) => {
        if (!editLabel.trim()) return
        try {
            const res = await fetch(`${API}/api/subheadings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ label: editLabel.trim() })
            })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            setEditingId(null)
            fetchData()
        } catch (err) {
            alert((err as Error).message || 'Failed to update')
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API}/api/subheadings/${id}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, 
                body: JSON.stringify({ status: !currentStatus }) 
            });
            if (!res.ok) throw new Error('Update failed');
            setSubheadings(prev => prev.map(s => s._id === id ? { ...s, status: !currentStatus } : s));
        } catch {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this subheading?')) return
        try {
            const res = await fetch(`${API}/api/subheadings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error('Delete failed')
            fetchData()
        } catch {
            alert('Failed to delete subheading')
        }
    }

    const usedCategories = new Set(subheadings.map(s => s.category))
    const availableCategories = categories.filter(c => !usedCategories.has(c.slug))

    const filtered = subheadings.filter(s =>
        s.category.includes(searchTerm.toLowerCase()) ||
        s.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="cat-v2-wrapper">
            <div className="cat-v2-header">
                <h1>SUBHEADINGS</h1>
                <div className="cat-v2-breadcrumb">
                    <span>Dashboard</span> <ChevronRight size={14} /> <span>Subheadings</span>
                </div>
            </div>

            {error && <div className="rss-error-banner" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

            <div className="cat-v2-card">
                <div className="cat-v2-toolbar">
                    <div className="action-btns">
                        <button className="btn-add-cat" onClick={() => { setAdding(true); setNewCategory(''); setNewLabel('') }}>
                            <Plus size={18} /> Add Subheading
                        </button>
                    </div>
                </div>

                {adding && (
                    <div className="cat-v2-form-container" style={{ marginBottom: '30px', background: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div className="form-header">
                            <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>Add New Subheading</h2>
                        </div>
                        <form onSubmit={handleAdd} className="cat-v2-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        required
                                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {availableCategories.map(c => (
                                            <option key={c._id} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Heading Label *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AJMER"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug (auto-generated if empty)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ajmer"
                                        value={newSlug}
                                        onChange={e => setNewSlug(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Order</label>
                                    <input
                                        type="number"
                                        value={newOrder}
                                        onChange={e => setNewOrder(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>RSS URLs (Comma-separated)</label>
                                    <textarea
                                        placeholder="Enter RSS URLs"
                                        value={newRss}
                                        onChange={e => setNewRss(e.target.value)}
                                        style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>
                            <div className="form-footer">
                                <button type="submit" className="btn-save">Add Subheading</button>
                                <button type="button" className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="cat-v2-filters">
                    <div className="search-box">
                        Search: 
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                placeholder="Search subheadings..."
                            />
                        </div>
                    </div>
                </div>

                <div className="cat-v2-table-wrapper">
                    <table className="cat-v2-table">
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>
                                    <div className="header-cell">
                                        <Hash size={14} /> # S No.
                                    </div>
                                </th>
                                <th>
                                    <div className="header-cell">
                                        <Folder size={14} /> Category <span className="sort-icon">⇅</span>
                                    </div>
                                </th>
                                <th>
                                    <div className="header-cell">
                                        <MessageCircle size={14} /> Heading Label <span className="sort-icon">⇅</span>
                                    </div>
                                </th>
                                <th style={{ width: '80px' }}>Order</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '150px' }}>
                                    <div className="header-cell">
                                        <Settings size={14} /> Action
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} className="text-center">No subheadings found.</td></tr>
                            ) : (
                                filtered.map((s, idx) => (
                                    <tr key={s._id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <span style={{ 
                                                background: '#f0f0f0', 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: 600,
                                                color: '#555'
                                            }}>
                                                {capitalize(s.category)}
                                            </span>
                                        </td>
                                        <td>
                                            {editingId === s._id ? (
                                                <input
                                                    type="text"
                                                    value={editLabel}
                                                    onChange={e => setEditLabel(e.target.value)}
                                                    autoFocus
                                                    style={{ width: '100%', padding: '6px', border: '1px solid #ff9800', outline: 'none', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <strong style={{ color: '#333' }}>{s.label}</strong>
                                            )}
                                        </td>
                                        <td>{s.order || 0}</td>
                                        <td>
                                            <div
                                                className={`sub-toggle ${s.status !== false ? 'active' : ''}`}
                                                onClick={() => toggleStatus(s._id, s.status !== false)}
                                                style={{
                                                    width: '50px',
                                                    height: '24px',
                                                    background: s.status !== false ? '#ff9800' : '#ccc',
                                                    borderRadius: '12px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '3px',
                                                    left: s.status !== false ? '29px' : '3px',
                                                    transition: '0.3s'
                                                }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                {editingId === s._id ? (
                                                    <>
                                                        <button className="btn-view" style={{ background: '#4caf50' }} title="Save" onClick={() => handleUpdate(s._id)}><Check size={16} /></button>
                                                        <button className="btn-delete-cat" title="Cancel" onClick={() => setEditingId(null)}><X size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn-edit" title="Edit" onClick={() => { setEditingId(s._id); setEditLabel(s.label) }}><Edit size={16} /></button>
                                                        <button className="btn-delete-cat" title="Delete" onClick={() => handleDelete(s._id)}><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
