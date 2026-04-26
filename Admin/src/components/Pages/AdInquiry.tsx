import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    X, 
    User, 
    Home, 
    Mail, 
    Phone, 
    MessageCircle, 
    Calendar, 
    Search,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface Inquiry {
    _id: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    message?: string;
    status: string;
    date: string;
}

export default function AdInquiry() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/ad-inquiries`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInquiries(data);
            }
        } catch (error) {
            console.error('Failed to fetch inquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/ad-inquiries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
            }
        } catch (e) {
            console.error('Failed updating status', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this inquiry?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/ad-inquiries/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setInquiries(prev => prev.filter(i => i._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete inquiry', error);
        }
    };

    const filtered = inquiries.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.company && i.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'New': return { color: '#e8380d', bg: '#fef1ef' };
            case 'Contacted': return { color: '#007bff', bg: '#eef6ff' };
            case 'Resolved': return { color: '#28a745', bg: '#effdf2' };
            case 'Spam': return { color: '#666', bg: '#f5f5f5' };
            default: return { color: '#666', bg: '#f5f5f5' };
        }
    };

    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">ADVERTISING INQUIRIES</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Advertising</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Inquiries</span>
                </nav>
            </div>

            <div className="rss-actions-final" style={{ marginBottom: '20px' }}>
                <button className="rss-btn-delete-final" onClick={() => alert('Feature coming soon: Export to CSV')}>
                    📥 Export Inquiries
                </button>
            </div>

            <div className="rss-controls">
                <div className="rss-entries-control">
                    Show 
                    <select value={entries} onChange={e => setEntries(Number(e.target.value))} className="rss-select">
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select> 
                    entries
                </div>
                <div className="rss-search-control">
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Search name, email or company..." 
                        className="rss-search-input"
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat"><User size={13} style={{marginRight: 5}}/> Name</th>
                            <th className="rss-th-sub"><Home size={13} style={{marginRight: 5}}/> Company</th>
                            <th className="rss-th-sub"><Mail size={13} style={{marginRight: 5}}/> Email</th>
                            <th className="rss-th-sub"><Phone size={13} style={{marginRight: 5}}/> Phone</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> Date</th>
                            <th className="rss-th-status"><Clock size={13} style={{marginRight: 5}}/> Status</th>
                            <th className="rss-th-action">⚙️ Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="rss-loading-cell">Loading inquiries...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={8} className="rss-empty-cell">No inquiries found</td></tr>
                        ) : (
                            paginated.map((inq, idx) => (
                                <React.Fragment key={inq._id}>
                                    <tr className={`rss-row ${expandedRow === inq._id ? 'expanded' : ''}`}>
                                        <td className="rss-cell-num">{startIdx + idx + 1}</td>
                                        <td className="rss-cell-cat">
                                            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                                <button 
                                                    onClick={() => setExpandedRow(expandedRow === inq._id ? null : inq._id)}
                                                    style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
                                                >
                                                    {expandedRow === inq._id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                                <strong>{inq.name}</strong>
                                            </div>
                                        </td>
                                        <td className="rss-cell-sub">{inq.company || 'N/A'}</td>
                                        <td className="rss-cell-sub">{inq.email}</td>
                                        <td className="rss-cell-sub">{inq.phone || 'N/A'}</td>
                                        <td className="rss-cell-date">{new Date(inq.date).toLocaleDateString()}</td>
                                        <td className="rss-cell-status">
                                            <select 
                                                value={inq.status} 
                                                onChange={(e) => handleUpdateStatus(inq._id, e.target.value)}
                                                style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', 
                                                    fontSize: '12px', background: '#fff', color: getStatusStyles(inq.status).color,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <option value="New">New</option>
                                                <option value="Contacted">Contacted</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Spam">Spam</option>
                                            </select>
                                        </td>
                                        <td className="rss-cell-action">
                                            <div className="rss-action-btns">
                                                <button className="rss-delete-btn-new" onClick={() => handleDelete(inq._id)} title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRow === inq._id && (
                                        <tr className="rss-expanded-row">
                                            <td colSpan={8}>
                                                <div className="rss-expand-content" style={{padding: '15px 40px', background: '#fafafa'}}>
                                                    <div style={{display: 'flex', gap: 10, alignItems: 'flex-start'}}>
                                                        <MessageCircle size={16} style={{marginTop: 3, color: '#e8380d'}} />
                                                        <div>
                                                            <strong>Message:</strong>
                                                            <p style={{marginTop: 5, color: '#444', lineHeight: 1.5}}>
                                                                {inq.message || 'No message provided.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={entries}
                startIdx={startIdx}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
