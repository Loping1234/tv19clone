// Triggering refresh for icon fix
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    UilEnvelope, UilLock, UilEye, UilEyeSlash,
    UilSignInAlt, UilBolt, UilUser, UilBookmark,
    UilCommentAlt, UilShieldCheck
} from '@iconscout/react-unicons';
import '../../css/Signup/Signup.css';

const Signup: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Signup failed');
            alert('Signup successful! You can now log in.');
            // Redirect or switch to login? For now just alert
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Signup-page-container">
            <div className="Signup-card">
                {/* Left Panel: Features */}
                <div className="Signup-left-panel">
                    <div className="Signup-left-content">
                        <h2>STAY INFORMED, <span className="highlight">STAY AHEAD</span></h2>
                        <p className="Signup-description">
                            Join thousands of readers who trust TV19 News for accurate, unbiased reporting. 
                            Create your free account and unlock a personalized news experience.
                        </p>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon-box orange">
                                    <UilBolt size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>BREAKING NEWS ALERTS</h3>
                                    <p>Get instant notifications for stories that matter most to you</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon-box">
                                    <UilUser size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>PERSONALIZED FEED</h3>
                                    <p>Curated news based on your interests and reading history</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon-box">
                                    <UilBookmark size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>SAVE & READ LATER</h3>
                                    <p>Bookmark articles to read offline at your convenience</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon-box">
                                    <UilCommentAlt size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>JOIN THE CONVERSATION</h3>
                                    <p>Comment, share opinions, and engage with our community</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon-box ad-free">
                                    <UilShieldCheck size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>AD-FREE READING</h3>
                                    <p>Upgrade to premium for a distraction-free experience</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="Signup-right-panel">
                    <div className="Signup-form-box">
                        <div className="Signup-header">
                            <h1>CREATE ACCOUNT</h1>
                            <p>Join thousands of readers and stay ahead.</p>
                        </div>

                        {error && <div style={{ color: '#e63e00', backgroundColor: '#fff5f2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffccbc' }}>{error}</div>}

                        <form className="Signup-form" onSubmit={handleSignup}>
                            <div className="form-group">
                                <label>FULL NAME</label>
                                <div className="input-with-icon">
                                    <UilUser className="input-icon" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter your full name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>EMAIL ADDRESS</label>
                                <div className="input-with-icon">
                                    <UilEnvelope className="input-icon" size={18} />
                                    <input 
                                        type="email" 
                                        placeholder="userjdr1@gmail.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>PASSWORD</label>
                                <div className="input-with-icon">
                                    <UilLock className="input-icon" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
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

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>

                            <button type="submit" className="Signup-submit-btn" disabled={loading}>
                                <UilSignInAlt size={18} /> {loading ? 'PROCESSING...' : 'SIGN UP'}
                            </button>

                            <div className="Signup-divider">
                                <span>OR CONTINUE WITH</span>
                            </div>

                            <button type="button" className="google-Signup-btn">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                                <span className="google-letter g-red">G</span>
                            </button>
                        </form>

                        <div className="Signup-footer">
                            <p>Already have an account? <Link to="/login">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
