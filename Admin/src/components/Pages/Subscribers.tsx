import React, { useState, useEffect } from 'react';
import { Mail, Search, Award, Shield, CheckCircle } from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    imageUrl?: string;
    isVerified: boolean;
    createdAt: string;
}

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/list`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = subscribers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">ADMIN SUBSCRIBERS</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Users</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Subscribers</span>
                </nav>
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
                        placeholder="Search name or email..." 
                        className="rss-search-input"
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat"><Shield size={13} style={{marginRight: 5}}/> Name</th>
                            <th className="rss-th-sub"><Mail size={13} style={{marginRight: 5}}/> Email</th>
                            <th className="rss-th-date">Joined On</th>
                            <th className="rss-th-status"><CheckCircle size={13} style={{marginRight: 5}}/> Verification</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="rss-loading-cell">Loading subscribers...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={5} className="rss-empty-cell">No admin subscribers found</td></tr>
                        ) : (
                            paginated.map((sub, idx) => (
                                <tr key={sub._id} className="rss-row">
                                    <td className="rss-cell-num">{startIdx + idx + 1}</td>
                                    <td className="rss-cell-cat">
                                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                            {sub.imageUrl ? (
                                                <img src={`${API_BASE}${sub.imageUrl}`} alt={sub.name} style={{width: 32, height: 32, borderRadius: '50%', objectFit: 'cover'}} />
                                            ) : (
                                                <div style={{width: 32, height: 32, borderRadius: '50%', background: '#ffeadb', color: '#e8380d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                                                    {sub.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <strong>{sub.name}</strong>
                                        </div>
                                    </td>
                                    <td className="rss-cell-sub">{sub.email}</td>
                                    <td className="rss-cell-date">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    <td className="rss-cell-status">
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                            background: sub.isVerified ? '#e6f4ea' : '#fce8e6',
                                            color: sub.isVerified ? '#137333' : '#c5221f'
                                        }}>
                                            {sub.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
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
