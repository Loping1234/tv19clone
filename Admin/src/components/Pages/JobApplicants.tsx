import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    X, 
    User, 
    Mail, 
    Phone, 
    Link as LinkIcon, 
    FileText, 
    Calendar, 
    Search,
    ChevronDown,
    ChevronUp,
    Download,
    CheckCircle,
    Clock,
    UserCheck
} from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface Applicant {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    portfolio?: string;
    resume?: string;
    jobId?: { _id: string, title: string };
    status: string;
    appliedOn: string;
    additionalDetails?: string;
}

export default function JobApplicants() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/job-applicants`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApplicants(data);
            }
        } catch (error) {
            console.error('Failed to fetch applicants', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/job-applicants/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
            }
        } catch (e) {
            console.error('Failed updating status', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this applicant?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/job-applicants/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setApplicants(prev => prev.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete applicant', error);
        }
    };

    const filtered = applicants.filter(a => 
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.jobId?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Applied': return '#666';
            case 'Reviewed': return '#007bff';
            case 'Interviewing': return '#e67e22';
            case 'Hired': return '#28a745';
            case 'Rejected': return '#dc3545';
            default: return '#666';
        }
    };

    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">JOB APPLICATIONS</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Careers</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Applicants</span>
                </nav>
            </div>

            <div className="rss-actions-final" style={{ marginBottom: '20px' }}>
                <button className="rss-btn-delete-final" onClick={() => alert('Feature coming soon: Bulk delete')}>
                    <Trash2 size={16} /> Delete Applicants
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
                        placeholder="Search name, email or job..." 
                        className="rss-search-input"
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat"><User size={13} style={{marginRight: 5}}/> Full Name</th>
                            <th className="rss-th-sub"><Mail size={13} style={{marginRight: 5}}/> Email</th>
                            <th className="rss-th-sub"><Phone size={13} style={{marginRight: 5}}/> Phone</th>
                            <th className="rss-th-sub"><LinkIcon size={13} style={{marginRight: 5}}/> Portfolio</th>
                            <th className="rss-th-sub"><FileText size={13} style={{marginRight: 5}}/> Resume</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> Applied On</th>
                            <th className="rss-th-status"><Clock size={13} style={{marginRight: 5}}/> Status</th>
                            <th className="rss-th-action">⚙️ Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="rss-loading-cell">Loading applicants...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={9} className="rss-empty-cell">No applications found</td></tr>
                        ) : (
                            paginated.map((app, idx) => (
                                <React.Fragment key={app._id}>
                                    <tr className={`rss-row ${expandedRow === app._id ? 'expanded' : ''}`}>
                                        <td className="rss-cell-num">{startIdx + idx + 1}</td>
                                        <td className="rss-cell-cat">
                                            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                                <button 
                                                    onClick={() => setExpandedRow(expandedRow === app._id ? null : app._id)}
                                                    style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
                                                >
                                                    {expandedRow === app._id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                                <strong>{app.fullName}</strong>
                                            </div>
                                        </td>
                                        <td className="rss-cell-sub">{app.email}</td>
                                        <td className="rss-cell-sub">{app.phone || 'N/A'}</td>
                                        <td className="rss-cell-sub">
                                            {app.portfolio ? (
                                                <a href={app.portfolio} target="_blank" rel="noopener noreferrer" style={{color: '#e8380d'}}>
                                                    <LinkIcon size={14} /> Link
                                                </a>
                                            ) : 'None'}
                                        </td>
                                        <td className="rss-cell-sub">
                                            {app.resume ? (
                                                <a href={`${API_BASE}${app.resume}`} target="_blank" rel="noopener noreferrer" style={{color: '#28a745'}}>
                                                    <Download size={14} /> Resume
                                                </a>
                                            ) : 'None'}
                                        </td>
                                        <td className="rss-cell-date">{new Date(app.appliedOn).toLocaleDateString()}</td>
                                        <td className="rss-cell-status">
                                            <select 
                                                value={app.status} 
                                                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', 
                                                    fontSize: '12px', background: '#fff', color: getStatusColor(app.status),
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <option value="Applied">Applied</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="Interviewing">Interviewing</option>
                                                <option value="Hired">Hired</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="rss-cell-action">
                                            <div className="rss-action-btns">
                                                <button className="rss-delete-btn-new" onClick={() => handleDelete(app._id)} title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRow === app._id && (
                                        <tr className="rss-expanded-row">
                                            <td colSpan={9}>
                                                <div className="rss-expand-content" style={{padding: '15px 40px', background: '#fafafa'}}>
                                                    <p><strong>Applying for:</strong> {app.jobId?.title || 'Unknown Job'}</p>
                                                    <p><strong>Additional Details:</strong> {app.additionalDetails || 'No additional info provided.'}</p>
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
