import React, { useEffect } from 'react';
import { 
    UilUsersAlt, UilEye, UilChartLine, UilCrosshair, 
    UilShieldCheck, UilChartGrowth, UilTelegramAlt, 
    UilDesktop, UilVideo, UilNewspaper, UilQuestionCircle 
} from '@iconscout/react-unicons';
import '../../css/Advertise/Advertise.css';

const Advertise: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="advertise-page-container">
            {/* Hero Section */}
            <div className="advertise-hero">
                <div className="advertise-hero-content">
                    <h1>Advertise With Us</h1>
                    <p>Advertise with us to connect your brand with an engaged audience of professionals and decision-makers. Benefit from premium placements, data-driven insights, and strategic exposure within a trusted media environment designed to deliver measurable impact</p>
                </div>
            </div>

            {/* Stats Overlay Cards */}
            <div className="advertise-stats-container">
                <div className="stat-card">
                    <div className="stat-icon"><UilUsersAlt size={32} /></div>
                    <h3>Monthly Audience</h3>
                    <div className="stat-number">5 Million+</div>
                    <p>Active Monthly Users</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><UilEye size={32} /></div>
                    <h3>Page Views</h3>
                    <div className="stat-number">12 Million+</div>
                    <p>Monthly Impressions</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><UilChartLine size={32} /></div>
                    <h3>Engagement</h3>
                    <div className="stat-number">Top 10</div>
                    <p>News Portal in Region</p>
                </div>
            </div>

            {/* Why Advertise Section */}
            <div className="why-advertise-section">
                <h2>Why Advertise with TV19?</h2>
                <div className="why-cards-grid">
                    <div className="why-card">
                        <div className="why-card-header">
                            <UilCrosshair className="why-icon" />
                            <h3>Targeted Reach</h3>
                        </div>
                        <p>Connect with a specific demographic interested in news, politics, and technology from Tier 1 & Tier 2 cities.</p>
                    </div>
                    <div className="why-card">
                        <div className="why-card-header">
                            <UilShieldCheck className="why-icon" />
                            <h3>Premium Environment</h3>
                        </div>
                        <p>Place your brand next to high-quality, trusted journalism that ensures brand safety and credibility.</p>
                    </div>
                    <div className="why-card">
                        <div className="why-card-header">
                            <UilChartGrowth className="why-icon" />
                            <h3>High ROI</h3>
                        </div>
                        <p>Our tailored ad solutions are designed to deliver maximum engagement and return on investment.</p>
                    </div>
                </div>
            </div>

            {/* Main Content: Form & Sidebar */}
            <div className="advertise-main-content">
                {/* Contact Form */}
                <div className="advertise-form-container">
                    <div className="form-header">
                        <UilTelegramAlt size={20} className="form-header-icon" />
                        <h2>Start Your Campaign</h2>
                    </div>
                    <form className="campaign-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name <span>*</span></label>
                                <input type="text" placeholder="Full Name" required />
                            </div>
                            <div className="form-group">
                                <label>Company Name <span>*</span></label>
                                <input type="text" placeholder="Company Name" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Work Email <span>*</span></label>
                                <input type="email" placeholder="Email" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number <span>*</span></label>
                                <input type="tel" placeholder="Phone" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Budget <span>*</span></label>
                            <select required>
                                <option value="">Select Budget</option>
                                <option value="<50k">Less than ₹50,000</option>
                                <option value="50k-2L">₹50,000 - ₹2,00,000</option>
                                <option value="2L+">Above ₹2,00,000</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Website <span>*</span></label>
                            <input type="url" placeholder="Website URL" required />
                        </div>
                        <div className="form-group">
                            <label>Target Category <span>*</span></label>
                            <div className="input-with-icon">
                                <select required>
                                    <option value="">Select Target Geography</option>
                                    <option value="pan-india">Pan India</option>
                                    <option value="north">North India</option>
                                    <option value="south">South India</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Additional Details</label>
                            <textarea placeholder="Write here" rows={4}></textarea>
                        </div>
                        <button type="submit" className="btn-submit">
                            <UilTelegramAlt size={18} /> SEND INQUIRY
                        </button>
                    </form>
                </div>

                {/* Sidebar Details */}
                <div className="advertise-sidebar">
                    <div className="sidebar-card">
                        <div className="sidebar-card-header">
                            <span className="sidebar-title-icon">🎯</span>
                            <h3>Ad Formats</h3>
                        </div>
                        <div className="ad-format-list">
                            <div className="ad-format-item">
                                <div className="ad-format-icon"><UilDesktop size={24} /></div>
                                <div className="ad-format-text">
                                    <h4>Display Ads</h4>
                                    <p>Leaderboard, MPU, Sticky</p>
                                </div>
                            </div>
                            <div className="ad-format-item">
                                <div className="ad-format-icon"><UilVideo size={24} /></div>
                                <div className="ad-format-text">
                                    <h4>Video Ads</h4>
                                    <p>Pre-roll & Mid-roll</p>
                                </div>
                            </div>
                            <div className="ad-format-item">
                                <div className="ad-format-icon"><UilNewspaper size={24} /></div>
                                <div className="ad-format-text">
                                    <h4>Sponsored Content</h4>
                                    <p>Native articles & stories</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <div className="sidebar-card-header">
                            <span className="sidebar-title-icon">📊</span>
                            <h3>Audience Profile</h3>
                        </div>
                        <div className="audience-profile-list">
                            <div className="audience-item">
                                <div className="audience-label">
                                    <span>Age 18-34</span>
                                    <span>65%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-fill" style={{width: '65%'}}></div></div>
                            </div>
                            <div className="audience-item">
                                <div className="audience-label">
                                    <span>Age 35-50</span>
                                    <span>25%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-fill" style={{width: '25%'}}></div></div>
                            </div>
                            <div className="audience-item">
                                <div className="audience-label">
                                    <span>Mobile Users</span>
                                    <span>85%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-fill" style={{width: '85%'}}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-grid">
                    <div className="faq-card">
                        <div className="faq-header">
                            <UilQuestionCircle className="faq-icon" size={20} />
                            <h3>Can I target a specific region?</h3>
                        </div>
                        <p>Yes, we offer geo-targeting options for specific states or cities across India.</p>
                    </div>
                    <div className="faq-card">
                        <div className="faq-header">
                            <UilQuestionCircle className="faq-icon" size={20} />
                            <h3>What are your advertising rates?</h3>
                        </div>
                        <p>Our rates vary based on ad format, duration, and placement. Fill out the form to get our latest Media Kit.</p>
                    </div>
                    <div className="faq-card">
                        <div className="faq-header">
                            <UilQuestionCircle className="faq-icon" size={20} />
                            <h3>Do you offer reporting?</h3>
                        </div>
                        <p>Yes, we provide detailed performance reports including impressions, clicks, and CTR after the campaign ends.</p>
                    </div>
                    <div className="faq-card">
                        <div className="faq-header">
                            <UilQuestionCircle className="faq-icon" size={20} />
                            <h3>What is the lead time for campaigns?</h3>
                        </div>
                        <p>Standard display ads can go live within 24 hours. Sponsored content typically takes 2-3 days for approval.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advertise;
