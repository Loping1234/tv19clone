import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Trash2, Eye, Edit, FileText, AlignLeft, ArrowLeft } from 'react-feather';
import './Categories.css';

// Mock data to match the screenshot provided
const mockCategories = [
    { id: 1, name: 'World', createdOn: 'Oct 13, 2025 02:49 PM', status: true, metaKeyword: 'global news updates', metaDescription: 'Stay updated with world news today featuring global politics, international affairs, economy, conflicts and major events on TV19 News.' },
    { id: 2, name: 'Technology', createdOn: 'Oct 13, 2025 02:48 PM', status: true, metaKeyword: 'latest tech updates', metaDescription: 'Read technology news today with updates on gadgets, smartphones, AI, startups, apps, digital trends and innovation stories on TV19 News.' },
    { id: 3, name: 'State', createdOn: 'Nov 18, 2025 04:03 PM', status: true, metaKeyword: 'state news local', metaDescription: 'Local and state news coverage.' },
    { id: 4, name: 'Opinion', createdOn: 'Jan 28, 2026 02:10 PM', status: true, metaKeyword: 'expert opinions', metaDescription: 'Editorials and expert opinions.' },
    { id: 5, name: 'Green Future', createdOn: 'Dec 18, 2025 08:00 PM', status: true, metaKeyword: 'climate change green', metaDescription: 'Environmental and climate change news.' },
    { id: 6, name: 'Finance', createdOn: 'Nov 14, 2025 04:33 PM', status: true, metaKeyword: 'finance markets', metaDescription: 'Financial markets and economy news.' },
    { id: 7, name: 'Entertainment', createdOn: 'Oct 13, 2025 02:48 PM', status: true, metaKeyword: 'entertainment movies', metaDescription: 'Entertainment and pop culture.' },
    { id: 8, name: 'Education', createdOn: 'Jan 19, 2026 04:48 PM', status: true, metaKeyword: 'education learning', metaDescription: 'Education sector updates.' },
    { id: 9, name: 'Weather', createdOn: 'Oct 27, 2025 05:29 PM', status: true, metaKeyword: 'weather forecast', metaDescription: 'Daily weather forecasts.' },
    { id: 10, name: 'Sports', createdOn: 'Oct 13, 2025 02:48 PM', status: true, metaKeyword: 'sports scores', metaDescription: 'Live sports scores and news.' },
];

const Categories = () => {
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState(mockCategories);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

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