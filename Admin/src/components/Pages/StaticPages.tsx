import { useState } from 'react';
import { Edit, Eye } from 'react-feather';
import EditTemplate from './EditTemplate';
import ViewPage from './ViewPage';

const mockStaticPages = [
    { 
        id: 1, 
        title: 'About Us', 
        updatedOn: 'Mar 11, 2026 01:01 PM', 
        metaTitle: 'About Us | TV19 News', 
        metaKeywords: 'about us, tv19 news', 
        metaDescription: 'Learn more about TV19 News.', 
        content: '<iframe src="http://localhost:5173/about" width="100%" height="800px" style="border:none;"></iframe>' 
    },
    { 
        id: 6, 
        title: 'Contact Us', 
        updatedOn: 'Feb 17, 2026 03:37 PM', 
        metaTitle: 'Contact Us | TV19 News', 
        metaKeywords: 'contact us, tv19 news', 
        metaDescription: 'Get in touch with TV19 News.', 
        content: '<iframe src="http://localhost:5173/contact" width="100%" height="800px" style="border:none;"></iframe>' 
    },
    { 
        id: 3, 
        title: 'Disclaimer', 
        updatedOn: 'Mar 11, 2026 03:36 PM', 
        metaTitle: 'Disclaimer | TV19 News', 
        metaKeywords: 'disclaimer, tv19 news', 
        metaDescription: 'Read the TV19 News disclaimer.', 
        content: '<iframe src="http://localhost:5173/disclaimer" width="100%" height="800px" style="border:none;"></iframe>' 
    },
    { id: 4, title: 'Home Page', updatedOn: 'Feb 17, 2026 03:39 PM', metaTitle: 'TV19 News | Breaking News, Live Updates & Top Headlines', metaKeywords: 'breaking news today', metaDescription: 'TV19 News brings you breaking news, live updates and top headlines from Jodhpur, Rajasthan and India covering politics, crime, business, sports and more.', content: '<iframe src="http://localhost:5173" width="100%" height="800px" style="border:none;"></iframe>' },
    { id: 2, title: 'Join Our Team', updatedOn: 'Feb 17, 2026 06:47 PM', metaTitle: 'Join Our Team | TV19 News', metaKeywords: 'careers, jobs, tv19 news', metaDescription: 'Explore career opportunities at TV19 News.', content: '' },
    { id: 5, title: 'Privacy Policy', updatedOn: 'Feb 17, 2026 03:38 PM', metaTitle: 'Privacy Policy | TV19 News', metaKeywords: 'privacy policy, tv19 news', metaDescription: 'Read our privacy policy.', content: '' },
    { id: 7, title: 'Advertise With Us', updatedOn: 'Feb 17, 2026 03:13 PM', metaTitle: 'Advertise | TV19 News', metaKeywords: 'advertise, tv19 news', metaDescription: 'Advertise your brand with us.', content: '' },
    { id: 8, title: 'Footer', updatedOn: 'Dec 19, 2025 11:14 AM', metaTitle: 'Footer | TV19 News', metaKeywords: 'footer', metaDescription: 'Website footer.', content: '' },
];

export default function StaticPages() {
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [pages, setPages] = useState(mockStaticPages);
    
    // Placeholder states for future Edit/View views
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [editingPage, setEditingPage] = useState<any>(null);

    // Save handler — updates the page in the state so changes reflect live
    const handleSavePage = (updatedPage: any) => {
        setPages(prev => prev.map(p =>
            p.id === updatedPage.id
                ? { ...p, title: updatedPage.title, content: updatedPage.content, updatedOn: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) }
                : p
        ));
        setEditingPage(null);
    };

    // If viewing a page, reuse the ViewPage component
    if (selectedPage) {
        return <ViewPage page={selectedPage} onBack={() => setSelectedPage(null)} />;
    }

    // If editing a page, reuse the EditTemplate component
    if (editingPage) {
        return <EditTemplate template={editingPage} onBack={() => setEditingPage(null)} onSave={handleSavePage} />;
    }

    // Main Table View
    return (
        <div className="categories-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title">PAGES</h1>
                <div className="cat-breadcrumb">
                    <span>Static</span> <span className="cat-bc-sep">›</span> <span>Pages</span>
                </div>
            </div>

            <div className="cat-card">
                <div className="cat-controls">
                    <div className="cat-show-entries">
                        <span>Show</span>
                        <select
                            value={entries}
                            onChange={(e) => setEntries(Number(e.target.value))}
                            className="cat-select"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="cat-search">
                        <span>Search:</span>
                        <input
                            type="text"
                            className="cat-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="cat-table-wrapper">
                    <table className="cat-table">
                        <thead>
                            <tr>
                                <th>S No. <span className="sort-icon">⇅</span></th>
                                <th>Title <span className="sort-icon">⇅</span></th>
                                <th>Updated On <span className="sort-icon">⇅</span></th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page, index) => (
                                <tr key={page.id}>
                                    <td>{index + 1}</td>
                                    <td>{page.title}</td>
                                    <td>{page.updatedOn}</td>
                                    <td>
                                        <div className="cat-actions">
                                            <button 
                                                className="cat-action-btn edit-btn" 
                                                title="Edit"
                                                onClick={() => setEditingPage(page)}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                className="cat-action-btn view-btn" 
                                                title="View"
                                                onClick={() => setSelectedPage(page)}
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="cat-empty">No matching records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="cat-pagination-footer">
                    <div className="cat-info">
                        Showing 1 to {pages.length} of {pages.length} entries
                    </div>
                    <div className="cat-pagination">
                        <button className="cat-page-btn disabled">First</button>
                        <button className="cat-page-btn disabled">Previous</button>
                        <button className="cat-page-btn cat-page-active">1</button>
                        <button className="cat-page-btn disabled">Next</button>
                        <button className="cat-page-btn disabled">Last</button>
                    </div>
                </div>
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
}
