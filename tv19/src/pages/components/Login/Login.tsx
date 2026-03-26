// Triggering refresh for icon fix
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    UilEnvelope, UilLock, UilEye, UilEyeSlash,
    UilSignInAlt, UilBolt, UilUser, UilBookmark,
    UilCommentAlt, UilShieldCheck
} from '@iconscout/react-unicons';
import '../../css/Login/Login.css';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                {/* Left Panel: Features */}
                <div className="login-left-panel">
                    <div className="login-left-content">
                        <h2>STAY INFORMED, <span className="highlight">STAY AHEAD</span></h2>
                        <p className="login-description">
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
                <div className="login-right-panel">
                    <div className="login-form-box">
                        <div className="login-header">
                            <h1>WELCOME BACK</h1>
                            <p>Sign in to continue to your account</p>
                        </div>

                        <form className="login-form" onSubmit={handleLogin}>
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

                            <button type="submit" className="login-submit-btn">
                                <UilSignInAlt size={18} /> LOGIN
                            </button>

                            <div className="login-divider">
                                <span>OR CONTINUE WITH</span>
                            </div>

                            <button type="button" className="google-login-btn">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                                <span className="google-letter g-red">G</span>
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
