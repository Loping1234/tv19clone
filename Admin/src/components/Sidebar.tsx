import { useState, useEffect, type ReactNode } from 'react'
import type { Page } from '../App'
import {
    Home,          // Dashboard
    Settings,      // Site Configuration
    Sliders,       // Configuration
    Globe,         // Social Settings
    File,          // Static
    Mail,          // Email Template
    FileText,      // Pages
    Users,         // Users
    Tag,           // Categories
    List,          // SubHeadings
    AlignLeft,     // News
    User,          // Author
    MessageSquare, // Comments
    Monitor,       // Ads
    Rss,           // RSS Feed
    Bell,          // Subscribers
    BarChart2,     // Polls
    HelpCircle,    // Quiz
    DollarSign,    // Ad Inquiry
    Briefcase,     // Jobs
    UserCheck,     // Job Applicants
    MessageCircle, // Community Posts
    Search,        // SEO Pages
    ChevronDown,   // Submenu arrow down
    ChevronRight,  // Submenu arrow right
    Info,          // About Us
    Phone,         // Contact Us
    Shield,        // Disclaimer
    Lock,          // Privacy Policy
} from 'react-feather';

const API_BASE = 'http://localhost:5000'

interface NavItem {
    id: Page;
    label: string;
    icon: ReactNode;
    subItems?: { id: Page; label: string; icon: ReactNode }[];
}

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} /> },
    {
        id: 'settings',
        label: 'Site Configuration',
        icon: <Settings size={16} />,
        subItems: [
            { id: 'configuration', label: 'Configuration', icon: <Sliders size={16} /> },
            { id: 'social', label: 'Social Settings', icon: <Globe size={16} /> },
        ]
    },
    {
        id: 'settings',
        label: 'Pages',
        icon: <FileText size={16} />,
        subItems: [
            { id: 'email-templates', label: 'Email Templates', icon: <Mail size={16} /> },
            { id: 'pages', label: 'Web Pages', icon: <File size={16} /> },
        ]

    },
    //{ id: 'settings', label: 'Pages', icon: <Page size={16} /> },
    { id: 'settings', label: 'Users', icon: <Users size={16} /> },
    { id: 'reset-password', label: 'Reset Password', icon: <User size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Tag size={16} /> },
    { id: 'settings', label: 'SubHeadings', icon: <List size={16} /> },
    { id: 'news', label: 'News', icon: <AlignLeft size={16} /> },
    { id: 'authors', label: 'Author', icon: <User size={16} /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare size={16} /> },
    { id: 'ads', label: 'Ads', icon: <Monitor size={16} /> },
    { id: 'rss-feeds', label: 'RSS Feed', icon: <Rss size={16} /> },
    { id: 'subscribers', label: 'Subscribers', icon: <Bell size={16} /> },
    { id: 'settings', label: 'Polls', icon: <BarChart2 size={16} /> },
    { id: 'settings', label: 'Quiz', icon: <HelpCircle size={16} /> },
    { id: 'settings', label: 'Ad Inquiry', icon: <DollarSign size={16} /> },
    { id: 'settings', label: 'Jobs', icon: <Briefcase size={16} /> },
    { id: 'settings', label: 'Job Applicants', icon: <UserCheck size={16} /> },
    { id: 'settings', label: 'Community Posts', icon: <MessageCircle size={16} /> },
    { id: 'settings', label: 'SEO Pages', icon: <Search size={16} /> },
]

interface Props {
    activePage: Page
    setActivePage: (p: Page) => void
    collapsed: boolean
    setCollapsed: (v: boolean | ((p: boolean) => boolean)) => void
}

export default function Sidebar({ setActivePage, collapsed }: Props) {
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])
    // Track by label (unique) instead of page id (shared) so only the clicked item turns red
    const [activeLabel, setActiveLabel] = useState<string>('Dashboard')
    const [faviconUrl, setFaviconUrl] = useState<string>('')
    const [siteIconUrl, setSiteIconUrl] = useState<string>('')

    // Fetch site config for logo images
    useEffect(() => {
        fetch(`${API_BASE}/api/config`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed'))
            .then(data => {
                setFaviconUrl(data.faviconUrl || '')
                setSiteIconUrl(data.siteIconUrl || '')
            })
            .catch(err => console.error('Failed to load site config for sidebar:', err))
    }, [])

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
        )
    }

    const handleNav = (item: NavItem) => {
        setActiveLabel(item.label)
        setActivePage(item.id)
    }

    const handleSubNav = (sub: { id: Page; label: string; icon: ReactNode }) => {
        setActiveLabel(sub.label)
        setActivePage(sub.id)
    }

    // Determine which logo to show
    const showSiteIcon = !collapsed && siteIconUrl
    const showFavicon = collapsed && faviconUrl

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                {showSiteIcon ? (
                    <img
                        src={`${API_BASE}${siteIconUrl}`}
                        alt="Site Icon"
                        className="sidebar-logo-img site-icon-img"
                    />
                ) : showFavicon ? (
                    <img
                        src={`${API_BASE}${faviconUrl}`}
                        alt="Favicon"
                        className="sidebar-logo-img favicon-img"
                    />
                ) : (
                    <>
                        <div className="logo-mark">
                            <span className="logo-tv">TV</span>
                            <span className="logo-19">19</span>
                        </div>
                        {!collapsed && <span className="logo-text">NEWS <em>Admin</em></span>}
                    </>
                )}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item, index) => {
                    const isExpanded = expandedMenus.includes(item.label)
                    const hasSubItems = item.subItems && item.subItems.length > 0
                    // Only highlight if THIS specific item's label matches
                    const isItemActive = activeLabel === item.label && !hasSubItems
                    // Highlight parent if any of its sub-items are active
                    const isParentActive = hasSubItems && item.subItems?.some(s => s.label === activeLabel)

                    return (
                        <div key={`${item.label}-${index}`} className="nav-group">
                            <button
                                className={`nav-item ${isItemActive ? 'active' : ''} ${isParentActive || (hasSubItems && isExpanded) ? 'parent-expanded' : ''}`}
                                onClick={() => hasSubItems ? toggleMenu(item.label) : handleNav(item)}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                                {!collapsed && hasSubItems && (
                                    isExpanded ? <ChevronDown size={16} className="chevron" /> : <ChevronRight size={16} className="chevron" />
                                )}
                            </button>

                            {!collapsed && hasSubItems && isExpanded && (
                                <div className="sub-menu">
                                    {item.subItems?.map((sub, sIdx) => (
                                        <button
                                            key={`${sub.label}-${sIdx}`}
                                            className={`nav-item sub-item ${activeLabel === sub.label ? 'active' : ''}`}
                                            onClick={() => handleSubNav(sub)}
                                        >
                                            <span className="nav-icon">{sub.icon}</span>
                                            <span className="nav-label">{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {!collapsed && <span className="footer-text">© 2026 TV19</span>}
            </div>
        </aside>
    )
}
