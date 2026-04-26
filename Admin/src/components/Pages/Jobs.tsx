import React, { useState, useEffect } from 'react';
import { 
    PlusCircle, 
    Trash2, 
    Edit, 
    Save, 
    X, 
    Briefcase, 
    Calendar, 
    MapPin, 
    Globe, 
    Search,
    ChevronDown,
    ChevronUp,
    FileText,
    Image as ImageIcon
} from 'react-feather';
import Pagination from '../Pagination';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

interface Job {
    _id: string;
    title: string;
    image?: string;
    jobType: string;
    department: string;
    postingDate: string;
    closingDate?: string;
    experienceLevel: string;
    remoteOption: string;
    status: boolean;
    description: string;
    requirements: string;
    benefits: string;
    location: string;
}

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/jobs`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: !currentStatus })
            });

            if (res.ok) {
                setJobs(prev => prev.map(j => j._id === id ? { ...j, status: !currentStatus } : j));
            }
        } catch (e) {
            console.error('Failed toggling status', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job? All applications for this job will also be deleted.')) return;
        try {
            const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                setJobs(prev => prev.filter(j => j._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete job', error);
        }
    };

    const handleSave = async () => {
        if (!editingJob?.title) return;
        
        try {
            const isNew = !editingJob._id;
            const method = isNew ? 'POST' : 'PUT';
            const url = isNew ? `${API_BASE}/api/jobs` : `${API_BASE}/api/jobs/${editingJob._id}`;
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(editingJob)
            });

            if (res.ok) {
                fetchJobs();
                setEditingJob(null);
            }
        } catch (error) {
            console.error('Failed to save job', error);
        }
    };

    const filtered = jobs.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    if (editingJob) {
        return (
            <div className="rss-page">
                <div className="rss-page-header">
                    <h1 className="rss-page-title">{editingJob._id ? 'EDIT JOB' : 'CREATE NEW JOB'}</h1>
                    <nav className="rss-breadcrumb">
                        <span className="rss-bc-item">Jobs</span>
                        <span className="rss-bc-sep">›</span>
                        <span className="rss-bc-active">Editor</span>
                    </nav>
                </div>

                <div className="news-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Job Title *</label>
                            <input 
                                type="text" className="form-control" 
                                value={editingJob.title || ''} 
                                onChange={e => setEditingJob({...editingJob, title: e.target.value})}
                                placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input 
                                type="text" className="form-control" 
                                value={editingJob.department || ''} 
                                onChange={e => setEditingJob({...editingJob, department: e.target.value})}
                                placeholder="e.g. IT, Editorial, Marketing"
                            />
                        </div>
                        <div className="form-group">
                            <label>Job Type</label>
                            <select 
                                className="form-control"
                                value={editingJob.jobType || 'Full-time'}
                                onChange={e => setEditingJob({...editingJob, jobType: e.target.value})}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Experience Level</label>
                            <input 
                                type="text" className="form-control" 
                                value={editingJob.experienceLevel || ''} 
                                onChange={e => setEditingJob({...editingJob, experienceLevel: e.target.value})}
                                placeholder="e.g. 2-3 years, Mid-Level"
                            />
                        </div>
                        <div className="form-group">
                            <label>Remote Option</label>
                            <select 
                                className="form-control"
                                value={editingJob.remoteOption || 'On-site'}
                                onChange={e => setEditingJob({...editingJob, remoteOption: e.target.value})}
                            >
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Closing Date</label>
                            <input 
                                type="date" className="form-control" 
                                value={editingJob.closingDate?.split('T')[0] || ''} 
                                onChange={e => setEditingJob({...editingJob, closingDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Job Description</label>
                        <textarea 
                            className="form-control" rows={5}
                            value={editingJob.description || ''}
                            onChange={e => setEditingJob({...editingJob, description: e.target.value})}
                            placeholder="Describe the role responsibilities..."
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Requirements</label>
                        <textarea 
                            className="form-control" rows={5}
                            value={editingJob.requirements || ''}
                            onChange={e => setEditingJob({...editingJob, requirements: e.target.value})}
                            placeholder="List necessary skills and qualifications..."
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '30px' }}>
                        <button className="btn-submit" onClick={handleSave}><Save size={16} /> Save Job</button>
                        <button className="btn-cancel" onClick={() => setEditingJob(null)}><X size={16} /> Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">JOB MANAGEMENT</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Careers</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Jobs</span>
                </nav>
            </div>

            <div className="rss-actions-final" style={{ marginBottom: '20px' }}>
                <button className="rss-btn-add-final" onClick={() => setEditingJob({})}>
                    <PlusCircle size={16} /> Add Job
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
                        placeholder="Search jobs or department..." 
                        className="rss-search-input"
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat"><Briefcase size={13} style={{marginRight: 5}}/> Job Title</th>
                            <th className="rss-th-sub"><Briefcase size={13} style={{marginRight: 5}}/> Type</th>
                            <th className="rss-th-sub"><Globe size={13} style={{marginRight: 5}}/> Dept.</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> Posted</th>
                            <th className="rss-th-date"><Calendar size={13} style={{marginRight: 5}}/> Closing</th>
                            <th className="rss-th-sub"><MapPin size={13} style={{marginRight: 5}}/> Remote</th>
                            <th className="rss-th-status"><X size={13} style={{marginRight: 5}}/> Status</th>
                            <th className="rss-th-action">⚙️ Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="rss-loading-cell">Loading jobs...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={9} className="rss-empty-cell">No jobs found</td></tr>
                        ) : (
                            paginated.map((job, idx) => (
                                <React.Fragment key={job._id}>
                                    <tr className={`rss-row ${expandedRow === job._id ? 'expanded' : ''}`}>
                                        <td className="rss-cell-num">{startIdx + idx + 1}</td>
                                        <td className="rss-cell-cat">
                                            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                                <button 
                                                    onClick={() => setExpandedRow(expandedRow === job._id ? null : job._id)}
                                                    style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
                                                >
                                                    {expandedRow === job._id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                                <strong>{job.title}</strong>
                                            </div>
                                        </td>
                                        <td className="rss-cell-sub">
                                            <span className="rss-cat-badge" style={{background: '#f0f0f0', color: '#666'}}>
                                                {job.jobType}
                                            </span>
                                        </td>
                                        <td className="rss-cell-sub">{job.department}</td>
                                        <td className="rss-cell-date">{new Date(job.postingDate).toLocaleDateString()}</td>
                                        <td className="rss-cell-date">{job.closingDate ? new Date(job.closingDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="rss-cell-sub">{job.remoteOption}</td>
                                        <td className="rss-cell-status">
                                            <div className={`rss-toggle ${job.status ? 'active' : ''}`} onClick={() => handleToggleStatus(job._id, job.status)}>
                                                <div className="rss-toggle-label">{job.status ? 'On' : 'Off'}</div>
                                                <div className="rss-toggle-handle"></div>
                                            </div>
                                        </td>
                                        <td className="rss-cell-action">
                                            <div className="rss-action-btns">
                                                <button className="rss-edit-btn-new" onClick={() => setEditingJob(job)} title="Edit">
                                                    📝
                                                </button>
                                                <button className="rss-delete-btn-new" onClick={() => handleDelete(job._id)} title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRow === job._id && (
                                        <tr className="rss-expanded-row">
                                            <td colSpan={9}>
                                                <div className="rss-expand-content" style={{padding: '15px 40px', background: '#fafafa'}}>
                                                    <p><strong>Description:</strong> {job.description || 'No description provided.'}</p>
                                                    <p><strong>Requirements:</strong> {job.requirements || 'No requirements listed.'}</p>
                                                    <p><strong>Location:</strong> {job.location}</p>
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
