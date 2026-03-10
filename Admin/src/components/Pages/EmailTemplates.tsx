import { useState } from 'react';
import { Edit, Eye } from 'react-feather';

const mockEmailTemplates = [
    { id: 1, title: 'Advertisement Lead', subject: 'Advertisement Lead', updatedOn: 'Feb 17, 2026 05:37 PM' },
    { id: 2, title: 'Change Email Notification', subject: 'Change Email Notification', updatedOn: 'Jan 09, 2026 11:54 AM' },
    { id: 3, title: 'Change Email Verification', subject: 'Change Email Verification', updatedOn: 'Jan 09, 2026 11:00 AM' },
    { id: 4, title: 'Contact Form Submission confirmation', subject: 'Contact Form Submission confirmation', updatedOn: 'Dec 31, 2025 11:43 AM' },
    { id: 5, title: 'Forgot Password', subject: 'Forgot Password', updatedOn: 'Dec 22, 2025 02:17 PM' },
    { id: 6, title: 'Personalized News', subject: 'Personalized News Update', updatedOn: 'Dec 03, 2025 12:55 PM' },
    { id: 7, title: 'Admin Change Email Notification', subject: 'Admin Change Email Notification', updatedOn: 'Nov 26, 2025 02:12 PM' },
    { id: 8, title: 'Admin Change Password Notification', subject: 'Admin Change Password Notification', updatedOn: 'Nov 26, 2025 02:12 PM' },
    { id: 9, title: 'User Registration', subject: 'Account Verification', updatedOn: 'Nov 26, 2025 02:07 PM' },
    { id: 10, title: 'Contact Us', subject: 'Contact Us', updatedOn: 'Nov 26, 2025 02:07 PM' },
];

export default function EmailTemplates() {
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [templates] = useState(mockEmailTemplates);

    return (
        <div className="categories-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title">EMAIL TEMPLATES</h1>
                <div className="cat-breadcrumb">
                    <span>Emails</span> <span className="cat-bc-sep">›</span> <span>Email Templates</span>
                </div>
            </div>

            <div className="cat-card email-tpl-card">
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
                                <th style={{ width: '60px' }}>S No.</th>
                                <th><span className="th-content">Title <span className="sort-icon">⇅</span></span></th>
                                <th><span className="th-content">Subject <span className="sort-icon">⇅</span></span></th>
                                <th><span className="th-content">Updated On <span className="sort-icon">⇅</span></span></th>
                                <th style={{ width: '100px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((tpl, index) => (
                                <tr key={tpl.id}>
                                    <td style={{ fontWeight: 500 }}>{index + 1}</td>
                                    <td>{tpl.title}</td>
                                    <td>{tpl.subject}</td>
                                    <td>{tpl.updatedOn}</td>
                                    <td>
                                        <div className="cat-action-btns">
                                            <button className="cat-action-btn edit-btn"><Edit size={14} /></button>
                                            <button className="cat-action-btn view-btn"><Eye size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="cat-pagination-row">
                    <div className="cat-pagination">
                        <button className="cat-page-btn default">First</button>
                        <button className="cat-page-btn default">Previous</button>
                        <button className="cat-page-btn active">1</button>
                        <button className="cat-page-btn default">Next</button>
                        <button className="cat-page-btn default">Last</button>
                    </div>
                </div>
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
}
