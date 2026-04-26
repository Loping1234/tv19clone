import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UilEnvelope, UilMessage } from '@iconscout/react-unicons';
import '../../css/Login/Login.css'; // Reusing Login CSS

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/user/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            setMessage(data.message);
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
                            <h1>FORGOT PASSWORD</h1>
                            <p>Enter your email to receive a password reset link.</p>
                        </div>
                        
                        {message && <div style={{ color: '#006600', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ccffcc' }}>{message}</div>}
                        {error && <div style={{ color: '#e63e00', backgroundColor: '#fff5f2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffccbc' }}>{error}</div>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>EMAIL ADDRESS</label>
                                <div className="input-with-icon">
                                    <UilEnvelope className="input-icon" size={18} />
                                    <input 
                                        type="email" 
                                        placeholder="user@example.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                <UilMessage size={18} /> {loading ? 'SENDING...' : 'SEND RESET LINK'}
                            </button>
                        </form>
                        
                        <div className="login-footer" style={{ marginTop: '20px' }}>
                            <p>Remember your password? <Link to="/login">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
