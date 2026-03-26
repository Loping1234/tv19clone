import { useState, useEffect } from 'react';
import { Edit, Eye } from 'react-feather';
import EditTemplate from './EditTemplate';
import ViewPage from './ViewPage';

// Port where the TV19 frontend dev server is running
const PREVIEW_PORT = 5175;

// Helper to get the preview URL with the current hostname
const getPreviewUrl = (path: string = '') => {
    const host = window.location.hostname; // 'localhost' or '127.0.0.1'
    return `http://${host}:${PREVIEW_PORT}${path}`;
};

const mockStaticPages = [
    { 
        id: 1, 
        title: 'About Us', 
        updatedOn: 'Mar 11, 2026 01:01 PM', 
        metaTitle: 'About Us – TV19 News', 
        metaKeywords: 'About Us, TV19 News, Indian News, News Channel', 
        metaDescription: 'Learn about TV19 News — India\'s trusted source for breaking news, live updates, and in-depth coverage across politics, sports, entertainment, and more.', 
        content: `<iframe src="${getPreviewUrl('/about')}" width="100%" height="800px" style="border:none;"></iframe>` 
    },
    { 
        id: 6, 
        title: 'Contact Us', 
        updatedOn: 'Feb 17, 2026 03:37 PM', 
        metaTitle: 'Contact Us – TV19 News', 
        metaKeywords: 'Contact Us, TV19 News, Customer Support, Feedback', 
        metaDescription: 'Get in touch with TV19 News for inquiries, feedback, partnerships, or advertising. Reach our editorial and business teams directly.', 
        content: `<iframe src="${getPreviewUrl('/contact')}" width="100%" height="800px" style="border:none;"></iframe>` 
    },
    { 
        id: 3, 
        title: 'Disclaimer', 
        updatedOn: 'Mar 11, 2026 03:36 PM', 
        metaTitle: 'Disclaimer – TV19 News', 
        metaKeywords: 'Disclaimer, TV19 News, Terms, Legal', 
        metaDescription: 'Read the official disclaimer of TV19 News to understand the terms and conditions governing the use of our website and content.', 
        content: `<iframe src="${getPreviewUrl('/disclaimer')}" width="100%" height="800px" style="border:none;"></iframe>` 
    },
    { id: 4, title: 'Home Page', updatedOn: 'Feb 17, 2026 03:39 PM', metaTitle: 'TV19 News | Breaking News, Live Updates & Top Headlines', metaKeywords: 'Breaking News, Live Updates, Top Headlines, India News, Jodhpur News', metaDescription: 'TV19 News brings you breaking news, live updates and top headlines from Jodhpur, Rajasthan and India covering politics, crime, business, sports and more.', content: `<iframe src="${getPreviewUrl('/')}" width="100%" height="800px" style="border:none;"></iframe>` },
    { id: 2, title: 'Join Our Team', updatedOn: 'Feb 17, 2026 06:47 PM', metaTitle: 'Join Our Team – TV19 News', metaKeywords: 'Careers, Jobs, TV19 News, Media Jobs, Journalism', metaDescription: 'Explore exciting career opportunities at TV19 News. Join our dynamic team of journalists, editors, and digital media professionals.', content: `<iframe src="${getPreviewUrl('/career')}" width="100%" height="800px" style="border:none;"></iframe>` },
    { id: 5, title: 'Privacy Policy', updatedOn: 'Feb 17, 2026 03:38 PM', metaTitle: 'Privacy Policy – TV19 News', metaKeywords: 'Privacy Policy', metaDescription: 'Read the privacy policy of TV19 News to understand how we collect, use and protect user data while delivering trusted digital news content.', content: `<iframe src="${getPreviewUrl('/privacy')}" width="100%" height="800px" style="border:none;"></iframe>` },
    { id: 7, title: 'Advertise With Us', updatedOn: 'Feb 17, 2026 03:13 PM', metaTitle: 'Advertise With Us – TV19 News', metaKeywords: 'Advertise, TV19 News, Digital Advertising, Brand Promotion', metaDescription: 'Advertise your brand with TV19 News and connect with millions of engaged readers. Premium placements, data-driven insights, and measurable impact.', content: `<iframe src="${getPreviewUrl('/advertise')}" width="100%" height="800px" style="border:none;"></iframe>` },
    { id: 8, title: 'Footer', updatedOn: 'Dec 19, 2025 11:14 AM', metaTitle: 'Footer – TV19 News', metaKeywords: 'Footer, Site Navigation, TV19 News', metaDescription: 'The global footer section of the TV19 News website, containing quick links, social media connections, and subscription options.', content: `<iframe src="${getPreviewUrl('/footer-preview')}" width="100%" height="800px" style="border:none;"></iframe>` },
];

export default function StaticPages({ initialView }: { initialView?: { title: string } }) {
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [pages, setPages] = useState(mockStaticPages);

    // Placeholder states for future Edit/View views
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [editingPage, setEditingPage] = useState<any>(null);

    // Sync selectedPage with initialView if provided
    useEffect(() => {
        if (initialView) {
            const page = mockStaticPages.find(p => p.title === initialView.title);
            if (page) {
                setSelectedPage(page);
            }
        }
    }, [initialView]);

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
