import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UilLock, UilEye, UilEyeSlash, UilCheck } from '@iconscout/react-unicons';
import '../../css/Login/Login.css';

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reset failed');
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="login-right-panel" style={{ width: '100%' }}>
                    <div className="login-form-box">
                        <div className="login-header">
                            <h1>SET NEW PASSWORD</h1>
                            <p>Please enter your new password.</p>
                        </div>
                        
                        {message && <div style={{ color: '#006600', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ccffcc' }}>{message}</div>}
                        {error && <div style={{ color: '#e63e00', backgroundColor: '#fff5f2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffccbc' }}>{error}</div>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>NEW PASSWORD</label>
                                <div className="input-with-icon">
                                    <UilLock className="input-icon" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        minLength={6}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <UilEyeSlash size={18} /> : <UilEye size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>CONFIRM NEW PASSWORD</label>
                                <div className="input-with-icon">
                                    <UilLock className="input-icon" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="login-submit-btn" disabled={loading || !!message}>
                                <UilCheck size={18} /> {loading ? 'SAVING...' : 'SAVE PASSWORD'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
