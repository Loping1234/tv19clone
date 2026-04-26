import React, { useState, useEffect } from 'react';
import { 
    PlusCircle, 
    Trash2, 
    Edit, 
    Save, 
    X, 
    HelpCircle, 
    Calendar, 
    Zap, 
    Settings, 
    Search,
    PieChart,
    ChevronDown,
    ChevronUp,
    FileText,
    TrendingUp
} from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface PollOption {
    _id?: string;
    text: string;
    votes: number;
}

interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    status: boolean;
    featured: boolean;
    publishedAt: string;
    startDate?: string;
    endDate?: string;
    author: string;
}

export default function Polls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingPoll, setEditingPoll] = useState<Partial<Poll> | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/polls`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPolls(data);
            }
        } catch (error) {
            console.error('Failed to fetch polls', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/polls/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: !currentStatus })
            });

            if (res.ok) {
                setPolls(prev => prev.map(p => p._id === id ? { ...p, status: !currentStatus } : p));
            }
        } catch (e) {
            console.error('Failed toggling status', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this poll?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/polls/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setPolls(prev => prev.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete poll', error);
        }
    };

    const handleSave = async () => {
        if (!editingPoll?.question) return;
        
        try {
            const isNew = !editingPoll._id;
            const method = isNew ? 'POST' : 'PUT';
            const url = isNew ? `${API_BASE}/api/admin/polls` : `${API_BASE}/api/admin/polls/${editingPoll._id}`;
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(editingPoll)
            });

            if (res.ok) {
                fetchPolls();
                setEditingPoll(null);
            }
        } catch (error) {
            console.error('Failed to save poll', error);
        }
    };

    const updateOption = (idx: number, text: string) => {
        if (!editingPoll?.options) return;
        const newOptions = [...editingPoll.options];
        newOptions[idx].text = text;
        setEditingPoll({ ...editingPoll, options: newOptions });
    };

    const addOption = () => {
        if (!editingPoll) return;
        const options = editingPoll.options || [];
        setEditingPoll({ ...editingPoll, options: [...options, { text: '', votes: 0 }] });
    };

    const removeOption = (idx: number) => {
        if (!editingPoll?.options) return;
        const newOptions = editingPoll.options.filter((_, i) => i !== idx);
        setEditingPoll({ ...editingPoll, options: newOptions });
    };

    const filtered = polls.filter(p => 
        p.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    if (editingPoll) {
        return (
            <div className="rss-page">
                <div className="rss-page-header">
                    <h1 className="rss-page-title">{editingPoll._id ? 'EDIT POLL' : 'CREATE NEW POLL'}</h1>
                    <nav className="rss-breadcrumb">
                        <span className="rss-bc-item">Admin</span>
                        <span className="rss-bc-sep">›</span>
                        <span className="rss-bc-active">Polls</span>
                    </nav>
                </div>

                <div className="news-card" style={{ padding: '30px' }}>
                    <div className="form-group">
                        <label>Poll Question *</label>
                        <input 
                            type="text" className="form-control" 
                            value={editingPoll.question || ''} 
                            onChange={e => setEditingPoll({...editingPoll, question: e.target.value})}
                            placeholder="Enter your question..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input 
                                type="date" className="form-control" 
                                value={editingPoll.startDate?.split('T')[0] || ''} 
                                onChange={e => setEditingPoll({...editingPoll, startDate: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input 
                                type="date" className="form-control" 
                                value={editingPoll.endDate?.split('T')[0] || ''} 
                                onChange={e => setEditingPoll({...editingPoll, endDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Options / Answers *</label>
                        {(editingPoll.options || []).map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input 
                                    type="text" className="form-control" 
                                    value={opt.text} 
                                    onChange={e => updateOption(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                />
                                {(editingPoll.options || []).length > 2 && (
                                    <button className="btn-cancel" style={{ padding: '0 15px' }} onClick={() => removeOption(idx)}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="btn-add" onClick={addOption} style={{ marginTop: '5px' }}>+ Add Option</button>
                    </div>

                    <div className="form-actions" style={{ marginTop: '30px' }}>
                        <button className="btn-submit" onClick={handleSave}><Save size={16} /> Save Poll</button>
                        <button className="btn-cancel" onClick={() => setEditingPoll(null)}><X size={16} /> Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">POLL MANAGEMENT</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Admin</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Polls</span>
                </nav>
            </div>

            <div className="rss-actions-final" style={{ marginBottom: '20px' }}>
                <button className="rss-btn-add-final" onClick={() => setEditingPoll({ 
                    question: '', options: [{text: '', votes: 0}, {text: '', votes: 0}], status: true 
                })}>
                    <PlusCircle size={16} /> Create Poll
                </button>
            </div>

            <div className="rss-controls">
                <div className="rss-entries-control">
                    Show 
                    <select value={entries} onChange={e => setEntries(Number(e.target.value))} className="rss-select">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select> 
                    entries
                </div>
                <div className="rss-search-control">
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Search questions..." 
                        className="rss-search-input"
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat"><HelpCircle size={13} style={{marginRight: 5}}/> Question</th>
                            <th className="rss-th-sub"><PieChart size={13} style={{marginRight: 5}}/> Options</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> Start Date</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> End Date</th>
                            <th className="rss-th-status"><Zap size={13} style={{marginRight: 5}}/> Status</th>
                            <th className="rss-th-action">⚙️ Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="rss-loading-cell">Loading polls...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={7} className="rss-empty-cell">No polls found</td></tr>
                        ) : (
                            paginated.map((poll, idx) => (
                                <tr key={poll._id} className="rss-row">
                                    <td className="rss-cell-num">{startIdx + idx + 1}</td>
                                    <td className="rss-cell-cat"><strong>{poll.question}</strong></td>
                                    <td className="rss-cell-sub">{poll.options.length} options ({poll.totalVotes || 0} votes)</td>
                                    <td className="rss-cell-date">{poll.startDate ? new Date(poll.startDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="rss-cell-date">{poll.endDate ? new Date(poll.endDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="rss-cell-status">
                                        <div className={`rss-toggle ${poll.status ? 'active' : ''}`} onClick={() => handleToggleStatus(poll._id, poll.status)}>
                                            <div className="rss-toggle-label">{poll.status ? 'Active' : 'Ended'}</div>
                                            <div className="rss-toggle-handle"></div>
                                        </div>
                                    </td>
                                    <td className="rss-cell-action">
                                        <div className="rss-action-btns">
                                            <button className="rss-edit-btn-new" onClick={() => setEditingPoll(poll)} title="Edit">
                                                📝
                                            </button>
                                            <button className="rss-delete-btn-new" onClick={() => handleDelete(poll._id)} title="Delete">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
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
