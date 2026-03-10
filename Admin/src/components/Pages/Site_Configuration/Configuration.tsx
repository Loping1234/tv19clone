import { useState, useRef, useEffect } from 'react'
import { Upload, Save, CheckCircle, AlertCircle } from 'react-feather'

const API_BASE = 'http://localhost:5000'

function getToken() {
    return localStorage.getItem('adminToken') || ''
}

interface ConfigData {
    siteName: string
    siteEmail: string
    officeAddress: string
    recaptchaSiteKey: string
    recaptchaSecretKey: string
    faviconUrl: string
    siteIconUrl: string
}

export default function Configuration() {
    const [config, setConfig] = useState<ConfigData>({
        siteName: '',
        siteEmail: '',
        officeAddress: '',
        recaptchaSiteKey: '',
        recaptchaSecretKey: '',
        faviconUrl: '',
        siteIconUrl: '',
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const faviconRef = useRef<HTMLInputElement>(null)
    const iconRef = useRef<HTMLInputElement>(null)

    // Fetch config on mount
    useEffect(() => {
        fetchConfig()
    }, [])

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(t)
        }
    }, [toast])

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/config`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setConfig({
                siteName: data.siteName || '',
                siteEmail: data.siteEmail || '',
                officeAddress: data.officeAddress || '',
                recaptchaSiteKey: data.recaptchaSiteKey || '',
                recaptchaSecretKey: data.recaptchaSecretKey || '',
                faviconUrl: data.faviconUrl || '',
                siteIconUrl: data.siteIconUrl || '',
            })
        } catch (err) {
            console.error('Failed to load config:', err)
            setToast({ type: 'error', msg: 'Failed to load config from server' })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof ConfigData, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE}/api/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    siteName: config.siteName,
                    siteEmail: config.siteEmail,
                    officeAddress: config.officeAddress,
                    recaptchaSiteKey: config.recaptchaSiteKey,
                    recaptchaSecretKey: config.recaptchaSecretKey,
                }),
            })
            if (!res.ok) throw new Error('Save failed')
            setToast({ type: 'success', msg: 'Configuration saved successfully!' })
        } catch (err) {
            console.error('Save error:', err)
            setToast({ type: 'error', msg: 'Failed to save configuration' })
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (file: File, type: 'favicon' | 'icon') => {
        const formData = new FormData()
        formData.append(type === 'favicon' ? 'favicon' : 'icon', file)

        const endpoint = type === 'favicon' ? 'upload-favicon' : 'upload-icon'

        try {
            const res = await fetch(`${API_BASE}/api/config/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()

            if (type === 'favicon') {
                setConfig(prev => ({ ...prev, faviconUrl: data.faviconUrl }))
            } else {
                setConfig(prev => ({ ...prev, siteIconUrl: data.siteIconUrl }))
            }
            setToast({ type: 'success', msg: `${type === 'favicon' ? 'Favicon' : 'Site icon'} uploaded!` })
        } catch (err) {
            console.error('Upload error:', err)
            setToast({ type: 'error', msg: `Failed to upload ${type}` })
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'favicon' | 'icon') => {
        const file = e.target.files?.[0]
        if (file) handleFileUpload(file, type)
    }

    if (loading) {
        return (
            <div className="config-page">
                <div className="config-header">
                    <h1 className="config-title">SITE CONFIGURATION</h1>
                </div>
                <div className="config-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#999' }}>Loading configuration...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="config-page">
            {/* Toast Notification */}
            {toast && (
                <div className={`config-toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="config-header">
                <h1 className="config-title">SITE CONFIGURATION</h1>
                <nav className="config-breadcrumb">
                    <span className="crumb-link">Configs</span>
                    <span className="crumb-sep">›</span>
                    <span className="crumb-current">Site Configuration</span>
                </nav>
            </div>

            {/* Form Card */}
            <div className="config-card">
                {/* Site Name */}
                <div className="config-field">
                    <label className="config-label">Site Name</label>
                    <input
                        type="text"
                        className="config-input"
                        value={config.siteName}
                        onChange={e => handleChange('siteName', e.target.value)}
                    />
                </div>

                {/* Favicon Upload */}
                <div className="config-field">
                    <label className="config-label">Site Favicon Icon</label>
                    <div className="file-upload-row">
                        <div className="file-input-wrap">
                            <input
                                ref={faviconRef}
                                type="file"
                                accept="image/*"
                                onChange={e => onFileChange(e, 'favicon')}
                            />
                        </div>
                        <button className="upload-btn" onClick={() => faviconRef.current?.click()}>
                            <Upload size={14} /> Upload
                        </button>
                    </div>
                    {config.faviconUrl && (
                        <div className="image-preview favicon-preview">
                            <img src={`${API_BASE}${config.faviconUrl}`} alt="Favicon" />
                        </div>
                    )}
                </div>

                {/* Site Icon */}
                <div className="config-field">
                    <label className="config-label">Site Icon</label>
                    <div className="file-upload-row">
                        <div className="file-input-wrap">
                            <input
                                ref={iconRef}
                                type="file"
                                accept="image/*"
                                onChange={e => onFileChange(e, 'icon')}
                            />
                        </div>
                        <button className="upload-btn" onClick={() => iconRef.current?.click()}>
                            <Upload size={14} /> Upload
                        </button>
                    </div>
                    {config.siteIconUrl && (
                        <div className="image-preview icon-preview">
                            <img src={`${API_BASE}${config.siteIconUrl}`} alt="Site icon" />
                        </div>
                    )}
                </div>

                {/* Site Email */}
                <div className="config-field">
                    <label className="config-label">Site Email</label>
                    <input
                        type="email"
                        className="config-input"
                        value={config.siteEmail}
                        onChange={e => handleChange('siteEmail', e.target.value)}
                    />
                </div>

                {/* Office Address */}
                <div className="config-field">
                    <label className="config-label">Office Address</label>
                    <textarea
                        className="config-textarea"
                        rows={6}
                        value={config.officeAddress}
                        onChange={e => handleChange('officeAddress', e.target.value)}
                    />
                </div>

                {/* ReCaptcha Site Key */}
                <div className="config-field">
                    <label className="config-label">ReCaptcha Site Key</label>
                    <input
                        type="text"
                        className="config-input"
                        value={config.recaptchaSiteKey}
                        onChange={e => handleChange('recaptchaSiteKey', e.target.value)}
                    />
                </div>

                {/* ReCaptcha Secret Key */}
                <div className="config-field">
                    <label className="config-label">ReCaptcha Secret Key</label>
                    <input
                        type="text"
                        className="config-input"
                        value={config.recaptchaSecretKey}
                        onChange={e => handleChange('recaptchaSecretKey', e.target.value)}
                    />
                </div>

                {/* Save Button */}
                <div className="config-actions">
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="config-footer">
                2026 © TV19.
            </div>
        </div>
    )
}
