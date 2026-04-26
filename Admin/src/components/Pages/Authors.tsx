import React, { useState } from 'react'
import Pagination from '../Pagination'

interface Author {
  id: number
  name: string
  role: string
  email: string
  designation: string
  bio: string
  location: string
  createdOn: string
  image: string
  status: boolean
}

const PLACEHOLDER_AUTHORS: Author[] = [
  {
    id: 1,
    name: 'TV19 News',
    role: 'author',
    email: 'editorial@tv19news.com',
    designation: 'System Editorial Author',
    bio: 'TV19 News Desk represents the official editorial team responsible for publishing syndicated and agency-sourced content. Articles attributed to this account are curated from verified RSS feeds and published in accordance with TV19 News editorial standards.',
    location: 'Jaipur',
    createdOn: 'Jan 15, 2026 10:37 AM',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Globe_icon.svg/240px-Globe_icon.svg.png',
    status: true,
  },
  {
    id: 2,
    name: 'ABC',
    role: 'subadmin',
    email: 'developauth82@gmail.com',
    designation: 'Sub Administrator',
    bio: 'Manages content and user operations for the TV19 platform.',
    location: 'Delhi',
    createdOn: 'Jan 20, 2026 09:00 AM',
    image: 'https://i.pravatar.cc/80?img=12',
    status: true,
  },
  {
    id: 3,
    name: 'Test Subadmin',
    role: 'subadmin',
    email: 'userjdr1+1011@gmail.com',
    designation: 'Sub Administrator',
    bio: 'Test account for subadmin role verification.',
    location: 'Mumbai',
    createdOn: 'Feb 01, 2026 11:15 AM',
    image: 'https://i.pravatar.cc/80?img=33',
    status: true,
  },
  {
    id: 4,
    name: 'John Doe',
    role: 'author',
    email: 'userjdr1+1012@gmail.com',
    designation: 'Senior Correspondent',
    bio: 'Covers national politics and governance for TV19 News.',
    location: 'New Delhi',
    createdOn: 'Feb 05, 2026 08:30 AM',
    image: 'https://i.pravatar.cc/80?img=57',
    status: true,
  },
  {
    id: 5,
    name: 'Rajdeep Singh',
    role: 'author',
    email: 'rajdeep08@gmail.com',
    designation: 'Business Editor',
    bio: 'Expert in financial markets, economy, and corporate affairs.',
    location: 'Mumbai',
    createdOn: 'Feb 10, 2026 10:00 AM',
    image: 'https://i.pravatar.cc/80?img=52',
    status: true,
  },
  {
    id: 6,
    name: 'Anjaana Sharma',
    role: 'author',
    email: 'anjaana.coo@tv19news.com',
    designation: 'Chief of Operations',
    bio: 'Oversees editorial workflow and content strategy at TV19 News.',
    location: 'Jaipur',
    createdOn: 'Feb 12, 2026 09:45 AM',
    image: 'https://i.pravatar.cc/80?img=47',
    status: true,
  },
  {
    id: 7,
    name: 'Pradeep Mehta',
    role: 'author',
    email: 'pradeep.cmo@tv19news.com',
    designation: 'Chief Marketing Officer',
    bio: 'Leads digital marketing and audience growth initiatives.',
    location: 'Bangalore',
    createdOn: 'Feb 15, 2026 02:00 PM',
    image: 'https://i.pravatar.cc/80?img=60',
    status: true,
  },
  {
    id: 8,
    name: 'Sharad Joshi',
    role: 'author',
    email: 's.joshi@tv19news.com',
    designation: 'Sports Correspondent',
    bio: 'Covers cricket, football, and major sporting events across India.',
    location: 'Pune',
    createdOn: 'Feb 18, 2026 11:30 AM',
    image: 'https://i.pravatar.cc/80?img=65',
    status: true,
  },
  {
    id: 9,
    name: 'Arvind Arora',
    role: 'author',
    email: 'allen0816@gmail.com',
    designation: 'Technology Reporter',
    bio: 'Reports on startups, AI, and the Indian tech ecosystem.',
    location: 'Hyderabad',
    createdOn: 'Feb 20, 2026 03:15 PM',
    image: 'https://i.pravatar.cc/80?img=68',
    status: true,
  },
  {
    id: 10,
    name: 'Zafar Choudhary',
    role: 'author',
    email: 'arrowgreen901@gmail.com',
    designation: 'Political Analyst',
    bio: 'Specialises in Rajasthan politics and state-level governance.',
    location: 'Jaipur',
    createdOn: 'Feb 22, 2026 10:00 AM',
    image: 'https://i.pravatar.cc/80?img=70',
    status: true,
  },
]

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>(PLACEHOLDER_AUTHORS)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = authors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / entries)
  const startIdx = (currentPage - 1) * entries
  const paginated = filtered.slice(startIdx, startIdx + entries)

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? paginated.map(a => a.id) : [])

  const toggleStatus = (id: number) =>
    setAuthors(prev => prev.map(a => a.id === id ? { ...a, status: !a.status } : a))

  const toggleExpand = (id: number) =>
    setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="rss-page">
      {/* Header */}
      <div className="rss-page-header">
        <h1 className="rss-page-title">AUTHOR LIST</h1>
        <nav className="rss-breadcrumb">
          <span>Polls</span>
          <span className="rss-bc-sep">›</span>
          <span className="rss-bc-active">Author List</span>
        </nav>
      </div>

      {/* Action buttons */}
      <div className="rss-actions-final">
        <button className="rss-btn-add-final" style={{ background: '#e8380d' }}>
          <span className="rss-btn-icon-v2">👤</span> Add Author
        </button>
        <button className="rss-btn-delete-final">
          <span className="rss-btn-icon-v2">🗑️</span> Delete Author
        </button>
      </div>

      {/* Controls */}
      <div className="rss-controls">
        <div className="rss-entries-control">
          Show
          <select
            value={entries}
            onChange={e => { setEntries(Number(e.target.value)); setCurrentPage(1) }}
            className="rss-select"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          entries
        </div>
        <div className="rss-search-control">
          Search:
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="rss-search-input"
            placeholder="Search authors..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="rss-table-wrap">
        <table className="rss-table">
          <thead>
            <tr>
              <th className="rss-th-num"># S No.</th>
              <th className="rss-th-check">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={paginated.length > 0 && selected.length === paginated.length}
                />
              </th>
              <th>👤 Name</th>
              <th>🎭 Role</th>
              <th>🖼️ Profile Image</th>
              <th>✉️ Email</th>
              <th>⚡ Status</th>
              <th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((author, idx) => (
              <React.Fragment key={author.id}>
                <tr
                  className="rss-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleExpand(author.id)}
                >
                  <td className="rss-cell-num">
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#e8380d', color: '#fff', fontSize: 11, fontWeight: 700, marginRight: 6
                    }}>●</span>
                    {startIdx + idx + 1}
                  </td>
                  <td className="rss-cell-check" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(author.id)}
                      onChange={() => toggleSelect(author.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{author.name}</td>
                  <td>{author.role}</td>
                  <td>
                    <img
                      src={author.image}
                      alt={author.name}
                      style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=e8380d&color=fff&size=52` }}
                    />
                  </td>
                  <td>{author.email}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div
                      className={`rss-toggle ${author.status ? 'active' : ''}`}
                      onClick={() => toggleStatus(author.id)}
                    >
                      <div className="rss-toggle-label">{author.status ? 'On' : 'Off'}</div>
                      <div className="rss-toggle-handle"></div>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="rss-action-btns">
                      <button className="rss-edit-btn-new" title="View">👁️</button>
                      <button className="rss-edit-btn-new" title="Edit">📝</button>
                    </div>
                  </td>
                </tr>

                {/* Expandable detail row */}
                {expandedId === author.id && (
                  <tr style={{ background: '#fafafa' }}>
                    <td colSpan={8} style={{ padding: '16px 24px', borderBottom: '2px solid #f0f0f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px', fontSize: 13 }}>
                        <div>
                          <p style={{ margin: '4px 0' }}>
                            <strong>🏷️ Designation</strong><br />
                            <span style={{ color: '#555' }}>{author.designation}</span>
                          </p>
                          <p style={{ margin: '10px 0 4px' }}>
                            <strong>📄 Bio</strong><br />
                            <span style={{ color: '#555', lineHeight: 1.6 }}>{author.bio}</span>
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '4px 0' }}>
                            <strong>📍 Location</strong><br />
                            <span style={{ color: '#555' }}>{author.location}</span>
                          </p>
                          <p style={{ margin: '10px 0 4px' }}>
                            <strong>📅 Created On</strong><br />
                            <span style={{ color: '#555' }}>{author.createdOn}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={entries}
        startIdx={startIdx}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
