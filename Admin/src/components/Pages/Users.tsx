import { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, X, CheckCircle, AlertCircle } from 'react-feather'
import './Users.css'

const API_BASE = 'http://localhost:5000'

function getToken() {
  return localStorage.getItem('adminToken') || ''
}

function authHeaders(contentType?: string) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`
  }
  if (contentType) headers['Content-Type'] = contentType
  return headers
}

interface TeamMember {
  _id: string
  name: string
  role: string
  description: string
  imageUrl: string
  status: boolean
  createdAt: string
}

export default function Users() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({ name: '', role: '', description: '', imageUrl: '', status: true })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/team-members`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (err) {
      console.error('Failed to load team members:', err)
      setToast({ type: 'error', msg: 'Failed to load team members' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingMember(null)
    setFormData({ name: '', role: '', description: '', imageUrl: '', status: true })
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({ name: member.name, role: member.role, description: member.description, imageUrl: member.imageUrl, status: member.status })
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const res = await fetch(`${API_BASE}/api/team-members/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (!res.ok) throw new Error('Delete failed')
      setToast({ type: 'success', msg: 'Team member deleted successfully' })
      fetchMembers()
    } catch (err) {
      console.error('Delete error:', err)
      setToast({ type: 'error', msg: 'Failed to delete team member' })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      setToast({ type: 'error', msg: 'Name and role are required' })
      return
    }

    try {
      const method = editingMember ? 'PUT' : 'POST'
      const url = editingMember ? `${API_BASE}/api/team-members/${editingMember._id}` : `${API_BASE}/api/team-members`

      const res = await fetch(url, {
        method,
        headers: authHeaders('application/json'),
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Save failed')
      const savedMember = await res.json()

      if (selectedFile && savedMember._id) {
        const formDataUpload = new FormData()
        formDataUpload.append('memberImage', selectedFile)

        const uploadRes = await fetch(`${API_BASE}/api/team-members/${savedMember._id}/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formDataUpload
        })

        if (!uploadRes.ok) throw new Error('Image upload failed')
      }

      setToast({ type: 'success', msg: `Team member ${editingMember ? 'updated' : 'added'} successfully` })
      setShowModal(false)
      fetchMembers()
    } catch (err) {
      console.error('Save error:', err)
      setToast({ type: 'error', msg: 'Failed to save team member' })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const member = members.find(m => m._id === id)
      if (!member) return

      const res = await fetch(`${API_BASE}/api/team-members/${id}`, {
        method: 'PUT',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ ...member, status: !currentStatus })
      })

      if (!res.ok) throw new Error('Update failed')
      setMembers(prev => prev.map(m => m._id === id ? { ...m, status: !currentStatus } : m))
    } catch (err) {
      console.error('Toggle status error:', err)
      setToast({ type: 'error', msg: 'Failed to update status' })
    }
  }

  if (loading) {
    return (
      <div className="users-page">
        <h1 className="users-page-title">USERS</h1>
        <div className="users-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#999' }}>Loading team members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="users-page">
      {toast && (
        <div className={`users-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="users-header">
        <h1 className="users-page-title">USERS</h1>
        <button className="users-add-btn" onClick={handleAdd}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="users-card">
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Role</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No team members found. Click "Add Member" to create one.
                  </td>
                </tr>
              ) : (
                members.map(member => (
                  <tr key={member._id}>
                    <td>
                      <div className="users-member-image">
                        {member.imageUrl ? (
                          <img src={`${API_BASE}${member.imageUrl}`} alt={member.name} />
                        ) : (
                          <div className="users-member-placeholder">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{member.name}</td>
                    <td>{member.role}</td>
                    <td>
                      <div className="users-description">
                        {member.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <label className="users-toggle">
                        <input
                          type="checkbox"
                          checked={member.status}
                          onChange={() => handleToggleStatus(member._id, member.status)}
                        />
                        <span className="users-toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <div className="users-actions">
                        <button className="users-action-btn edit" onClick={() => handleEdit(member)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="users-action-btn delete" onClick={() => handleDelete(member._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="users-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h2>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button className="users-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>

              <div className="users-form-group">
                <label>Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Enter member role"
                />
              </div>

              <div className="users-form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter member description"
                  rows={4}
                />
              </div>

              <div className="users-form-group">
                <label>Profile Image</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                />
                {selectedFile && <p className="users-file-name">{selectedFile.name}</p>}
              </div>

              <div className="users-form-group">
                <label className="users-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  />
                  Active Status
                </label>
              </div>
            </div>

            <div className="users-modal-footer">
              <button className="users-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="users-btn-submit" onClick={handleSubmit}>
                {editingMember ? 'Update' : 'Add'} Member
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="users-footer">
        2026 © TV19.
      </footer>
    </div>
  )
}
