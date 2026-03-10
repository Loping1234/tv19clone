import { useState, useEffect, useRef } from 'react'
import { CheckCircle, AlertCircle } from 'react-feather'

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

export default function Profile() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [imageUrl, setImageUrl] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedFileName, setSelectedFileName] = useState('No file chosen')
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(t)
        }
    }, [toast])

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/profile`, {
                headers: authHeaders()
            })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setName(data.name || '')
            setEmail(data.email || '')
            setImageUrl(data.imageUrl || '')
        } catch (err) {
            console.error('Failed to load profile:', err)
            setToast({ type: 'error', msg: 'Failed to load profile' })
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setSelectedFileName(e.target.files[0].name)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setToast({ type: 'error', msg: 'Please choose a file first' })
            return
        }

        const formData = new FormData()
        formData.append('profileImage', selectedFile)

        try {
            const res = await fetch(`${API_BASE}/api/admin/profile/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            setImageUrl(data.imageUrl)
            setSelectedFile(null)
            setSelectedFileName('No file chosen')
            if (fileRef.current) fileRef.current.value = ''
            setToast({ type: 'success', msg: 'Profile image uploaded!' })
        } catch (err) {
            console.error('Upload error:', err)
            setToast({ type: 'error', msg: 'Failed to upload image' })
        }
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE}/api/admin/profile`, {
                method: 'PUT',
                headers: authHeaders('application/json'),
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error('Save failed')
            setToast({ type: 'success', msg: 'Profile updated successfully!' })
        } catch (err) {
            console.error('Save error:', err)
            setToast({ type: 'error', msg: 'Failed to update profile' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="profile-page">
                <h1 className="profile-page-title">PROFILE</h1>
                <div className="profile-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#999' }}>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page">
            {/* Toast */}
            {toast && (
                <div className={`config-toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <h1 className="profile-page-title">PROFILE</h1>

            <div className="profile-card">
                <div className="profile-image-container">
                    <div className="profile-image-box">
                        {imageUrl ? (
                            <img src={`${API_BASE}${imageUrl}`} alt="Profile" className="profile-preview" />
                        ) : (
                            <div className="profile-placeholder">
                                <img src="https://via.placeholder.com/150" alt="Placeholder" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-form">
                    <div className="profile-form-group">
                        <label className="profile-label">Image</label>
                        <div className="profile-upload-wrapper">
                            <div className="profile-file-input-container">
                                <label className="profile-file-btn">
                                    Choose File
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                    />
                                </label>
                                <span className="profile-file-name">{selectedFileName}</span>
                            </div>
                            <button className="profile-upload-btn" onClick={handleUpload}>Upload</button>
                        </div>
                    </div>

                    <div className="profile-form-group">
                        <label className="profile-label">Name</label>
                        <input
                            type="text"
                            className="profile-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="profile-form-group">
                        <label className="profile-label">Email</label>
                        <input
                            type="email"
                            className="profile-input"
                            value={email}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <button
                        className="profile-submit-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </div>

            <footer className="profile-footer">
                2026 © TV19.
            </footer>
        </div>
    )
}
