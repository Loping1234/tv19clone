import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'react-feather';

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [signupSuccess, setSignupSuccess] = useState('');
    const [isVerifiedRedirect, setIsVerifiedRedirect] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE = 'http://localhost:5000';

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verified') === 'true') {
            setIsVerifiedRedirect(true);
            setTimeout(() => {
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 3000);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSignupSuccess('');
        setLoading(true);

        const endpoint = isLogin ? '/api/admin/login' : '/api/admin/signup';
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            if (!isLogin) {
                setSignupSuccess(data.message || 'Signup successful. Please check your email.');
                setIsLogin(true); // Switch to login view
                setName('');
                setPassword('');
            } else {
                onLogin(data.token);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Geometric pattern background */}
            <div className="login-pattern"></div>

            <div className="login-box">
                {/* Logo */}
                <div className="login-logo">
                    <span className="login-logo-tv">TV</span>
                    <span className="login-logo-circle">19</span>
                    <span className="login-logo-news">NEWS</span>
                </div>

                <div className="login-header">
                    <h2>{isLogin ? 'WELCOME BACK!' : 'CREATE ACCOUNT'}</h2>
                    <p>{isLogin ? 'Sign in to continue to TV19.' : 'Sign up to get started with TV19.'}</p>
                </div>

                {isVerifiedRedirect && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
                        ✅ Email verified successfully! You can now log in.
                    </div>
                )}

                {signupSuccess && (
                    <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
                        📧 {signupSuccess}
                    </div>
                )}

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="login-field">
                            <label>Full Name</label>
                            <div className="login-input-wrap">
                                <Mail size={16} className="login-input-icon" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    placeholder="Enter Full Name"
                                />
                            </div>
                        </div>
                    )}
                    <div className="login-field">
                        <label>Email</label>
                        <div className="login-input-wrap">
                            <Mail size={16} className="login-input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter Email"
                            />
                        </div>
                    </div>
                    <div className="login-field">
                        <label>Password</label>
                        <div className="login-input-wrap">
                            <Lock size={16} className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="login-forgot">
                            <a href="#">Forgot password?</a>
                        </div>
                    )}

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="login-footer">
                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
