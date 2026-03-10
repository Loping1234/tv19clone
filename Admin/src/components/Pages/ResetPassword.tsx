import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'react-feather';

const API_BASE = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken') || '';
}

function authHeaders(contentType?: string) {
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${getToken()}`
    };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
}

export default function ResetPassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Auto-dismiss toast
    React.useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setToast({ type: 'error', msg: 'New password and confirm password do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setToast({ type: 'error', msg: 'New password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/reset-password`, {
                method: 'PUT',
                headers: authHeaders('application/json'),
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setToast({ type: 'success', msg: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Reset password error:', err);
            setToast({ type: 'error', msg: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-pwd-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title">RESET PASSWORD</h1>
                <div className="cat-breadcrumb">
                    <span>Admin</span> <span className="cat-bc-sep">›</span> <span>Reset Password</span>
                </div>
            </div>

            <div className="cat-card reset-pwd-card">
                <form onSubmit={handleSubmit} className="reset-pwd-form">
                    <div className="form-group full-width">
                        <label>Current Password</label>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="reset-pwd-submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit'}
                    </button>
                </form>
            </div>

            {/* Toast Notifications */}
            {toast && (
                <div className={`profile-toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
