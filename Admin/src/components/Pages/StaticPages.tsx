import { useState, useEffect } from 'react';
import { Edit, Eye } from 'react-feather';
import EditTemplate from './EditTemplate';
import ViewPage from './ViewPage';
import Pagination from '../Pagination';

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
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

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

    const filtered = pages.filter(p =>
        !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / entries);
    const startIdx = (currentPage - 1) * entries;
    const paginated = filtered.slice(startIdx, startIdx + entries);

    // Main Table View
    return (
        <div className="rss-page">
            <div className="rss-page-header">
                <h1 className="rss-page-title">STATIC PAGES</h1>
                <nav className="rss-breadcrumb">
                    <span className="rss-bc-item">Static</span>
                    <span className="rss-bc-sep">›</span>
                    <span className="rss-bc-active">Pages</span>
                </nav>
            </div>

            <div className="rss-controls">
                <div className="rss-entries-control">
                    Show
                    <select
                        value={entries}
                        onChange={(e) => setEntries(Number(e.target.value))}
                        className="rss-select"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    entries
                </div>
                <div className="rss-search-control">
                    Search:
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rss-search-input"
                        placeholder="Search pages..."
                    />
                </div>
            </div>

            <div className="rss-table-wrap">
                <table className="rss-table">
                    <thead>
                        <tr>
                            <th className="rss-th-num"># S No.</th>
                            <th className="rss-th-cat">📁 Title <span className="sort-icon">⇅</span></th>
                            <th className="rss-th-date">📅 Updated On <span className="sort-icon">⇅</span></th>
                            <th className="rss-th-action">⚙️ Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((page, index) => (
                            <tr key={page.id} className="rss-row">
                                <td className="rss-cell-num">{startIdx + index + 1}</td>
                                <td className="rss-cell-cat">
                                    <span className="rss-cat-badge">{page.title}</span>
                                </td>
                                <td className="rss-cell-date">{page.updatedOn}</td>
                                <td className="rss-cell-action">
                                    <div className="rss-action-btns">
                                        <button
                                            className="rss-edit-btn-new"
                                            title="Edit"
                                            onClick={() => setEditingPage(page)}
                                        >
                                            📝
                                        </button>
                                        <button
                                            className="rss-delete-btn-new"
                                            title="View"
                                            onClick={() => setSelectedPage(page)}
                                        >
                                            👁️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="rss-empty-cell">No matching records found</td>
                            </tr>
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
