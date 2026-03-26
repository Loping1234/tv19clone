import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import "../../css/PrivacyPolicy/PrivacyPolicy.css"
import { UilEnvelope, UilPhone, UilMessage } from '@iconscout/react-unicons';

const PrivacyPolicy: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('introduction');
    const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200; // Offset for sticky header
            let currentActive = 'introduction';

            const sectionKeys = Object.keys(sectionsRef.current);
            for (let i = 0; i < sectionKeys.length; i++) {
                const key = sectionKeys[i];
                const element = sectionsRef.current[key];
                if (element && element.offsetTop <= scrollPosition) {
                    currentActive = key;
                }
            }
            setActiveSection(currentActive);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial call to set active
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = sectionsRef.current[id];
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Account for fixed header if any
                behavior: 'smooth'
            });
        }
    };

    const navItems = [
        { id: 'introduction', label: 'Introduction' },
        { id: 'information-we-collect', label: 'Information We Collect' },
        { id: 'how-we-use-your-information', label: 'How We Use Your Information' },
        { id: 'cookies-tracking', label: 'Cookies & Tracking' },
        { id: 'information-sharing', label: 'Information Sharing' },
        { id: 'data-security', label: 'Data Security' },
        { id: 'your-rights', label: 'Your Rights & Choices' },
        { id: 'third-party-links', label: 'Third-Party Links' },
        { id: 'childrens-privacy', label: "Children's Privacy" },
        { id: 'changes-to-policy', label: 'Changes to Policy' },
        { id: 'contact-us', label: 'Contact Us' }
    ];

    return (
        <div className="privacy-page-container">
            {/* Hero Section */}
            <div className="privacy-hero">
                <div className="privacy-hero-bg-overlay"></div>
                <div className="privacy-hero-content">
                    <h1>Privacy Policy</h1>
                    <p>Your privacy is important to us. This Privacy Policy explains how TV19 News collects, uses, and shares your information when you use our website and services.</p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="privacy-layout">
                
                {/* Sidebar Navigation */}
                <aside className="privacy-sidebar">
                    <div className="privacy-sidebar-inner">
                        <div className="privacy-sidebar-header">
                            <span className="sidebar-icon">≡</span> Quick Navigation
                        </div>
                        <nav className="privacy-sidebar-nav">
                            <ul>
                                {navItems.map(item => (
                                    <li 
                                        key={item.id}
                                        className={activeSection === item.id ? 'active' : ''}
                                        onClick={() => scrollToSection(item.id)}
                                    >
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="privacy-last-updated">
                            <span className="dot"></span> Last Updated: October 5, 2024
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="privacy-content">
                    
                    {/* Section 1 */}
                    <section id="introduction" ref={el => { sectionsRef.current['introduction'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">1</span>
                            <h2>Introduction</h2>
                        </div>
                        <p>Welcome to TV19 News. This Privacy Policy helps you understand how we collect, use, and protect your personal information when you use our website and services. By accessing or using TV19 News, you agree to this Privacy Policy.</p>
                        <p>If you do not agree with our policies and practices, please do not use our services.</p>
                        <div className="privacy-alert">
                            <strong>Important:</strong> Please read this Privacy Policy carefully to understand our practices regarding your information and how we will treat it.
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="information-we-collect" ref={el => { sectionsRef.current['information-we-collect'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">2</span>
                            <h2>Information We Collect</h2>
                        </div>
                        <p>We collect several types of information from and about users of our Website, including information:</p>
                        <h3>Personal Information You Provide</h3>
                        <ul className="custom-bullets">
                            <li>Name, email address, postal address, and telephone number when you register for an account.</li>
                            <li>Usernames and passwords used to access TV19 News.</li>
                            <li>Financial data (such as credit card information) for subscription payments.</li>
                            <li>Profile information and preferences.</li>
                            <li>Information provided when you contact us for support or other inquiries.</li>
                        </ul>
                        <h3>Information Collected Automatically</h3>
                        <ul className="custom-bullets">
                            <li>Technical details like IP address, browser type and version, and operating system.</li>
                            <li>Usage details like pages visited, time spent on pages, and referring/exit URLs.</li>
                            <li>Device information, including unique device identifiers and mobile network information.</li>
                            <li>Location data if you grant permission.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section id="how-we-use-your-information" ref={el => { sectionsRef.current['how-we-use-your-information'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">3</span>
                            <h2>How We Use Your Information</h2>
                        </div>
                        <p>We use information that we collect about you or that you provide to us, including:</p>
                        <ul className="custom-bullets">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request.</li>
                            <li>To fulfill any other purpose for which you provide it.</li>
                            <li>To notify you about changes to our Website or any products or services.</li>
                            <li>To allow you to participate in interactive features on our Website.</li>
                            <li>To monitor and analyze trends, usage, and activities.</li>
                            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                            <li>In any other way we may describe when you provide the information.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section id="cookies-tracking" ref={el => { sectionsRef.current['cookies-tracking'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">4</span>
                            <h2>Cookies & Tracking Technologies</h2>
                        </div>
                        <p>We use cookies to collect information regarding your online activities. We and our service providers also use cookies to improve our services and your experience.</p>
                        <h3>Types of Cookies We Use</h3>
                        <ul className="custom-bullets">
                            <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                            <li><strong>Analytical/Performance Cookies:</strong> Allow us to count visits and traffic sources.</li>
                            <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website.</li>
                            <li><strong>Targeting/Advertising Cookies:</strong> Used to deliver relevant advertisements.</li>
                        </ul>
                        <h3>Managing Your Preferences</h3>
                        <p>You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of this site may then be inaccessible or not function properly.</p>
                    </section>

                    {/* Section 5 */}
                    <section id="information-sharing" ref={el => { sectionsRef.current['information-sharing'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">5</span>
                            <h2>Information Sharing & Disclosure</h2>
                        </div>
                        <p>We do not sell your personal information. We may share your information in the following situations:</p>
                        <ul className="custom-bullets">
                            <li><strong>Service Providers:</strong> With contractors, service providers, and other third parties we use to support our business.</li>
                            <li><strong>Legal Requirements:</strong> To comply with any court order, law, or legal process.</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
                            <li><strong>Compliance:</strong> To enforce our Terms of Service and other agreements.</li>
                            <li><strong>Consent:</strong> With your consent or at your direction.</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section id="data-security" ref={el => { sectionsRef.current['data-security'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">6</span>
                            <h2>Data Security</h2>
                        </div>
                        <p>We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.</p>
                        <ul className="custom-bullets">
                            <li>Data transmitted is encrypted via SSL technology.</li>
                            <li>Access to data is limited to authorized personnel only.</li>
                            <li>Regular security assessments and audits are performed.</li>
                            <li>Secure servers are used for data storage.</li>
                        </ul>
                        <div className="privacy-alert">
                            <strong>Note:</strong> No method of transmission over the Internet, or method of electronic storage, is 100% secure. Therefore, we cannot guarantee its absolute security.
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section id="your-rights" ref={el => { sectionsRef.current['your-rights'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">7</span>
                            <h2>Your Rights & Choices</h2>
                        </div>
                        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
                        <ul className="custom-bullets">
                            <li><strong>Access:</strong> You can request an electronic copy of your personal data.</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate information.</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from our marketing communications.</li>
                            <li><strong>Restrict Processing:</strong> Object to or restrict the processing of your data.</li>
                        </ul>
                        <p>You can exercise these rights by contacting us using the information provided below.</p>
                    </section>

                    {/* Section 8 */}
                    <section id="third-party-links" ref={el => { sectionsRef.current['third-party-links'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">8</span>
                            <h2>Third-Party Links</h2>
                        </div>
                        <p>Our Website may contain links to third-party websites. Any access to and use of such linked websites is not governed by this Policy, but instead is governed by the privacy policies of those third party websites. We are not responsible for the information practices of such third party websites.</p>
                    </section>

                    {/* Section 9 */}
                    <section id="childrens-privacy" ref={el => { sectionsRef.current['childrens-privacy'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">9</span>
                            <h2>Children's Privacy</h2>
                        </div>
                        <p>Our Website is not intended for children under 16 years of age. No one under age 16 may provide any personal information to or on the Website. We do not knowingly collect personal information from children under 16. If we learn we have collected or received personal information from a child under 16, we will delete that information.</p>
                    </section>

                    {/* Section 10 */}
                    <section id="changes-to-policy" ref={el => { sectionsRef.current['changes-to-policy'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">10</span>
                            <h2>Changes to This Policy</h2>
                        </div>
                        <p>We may update this Privacy Policy from time to time. If we make material changes, we will post the updated Privacy Policy on this page and update the "Last Updated" date at the top of the policy.</p>
                        <p>We encourage you to review this Privacy Policy periodically for any changes.</p>
                    </section>

                    {/* Section 11 */}
                    <section id="contact-us" ref={el => { sectionsRef.current['contact-us'] = el; }}>
                        <div className="section-header">
                            <span className="section-badge">11</span>
                            <h2>Contact Us</h2>
                        </div>
                        <p>If you have any questions or comments about this Privacy Policy, please contact us at:</p>

                        <div className="contact-card">
                            <div className="contact-card-header">
                                <UilMessage className="contact-icon" size={20} />
                                <h3>Get in Touch</h3>
                            </div>
                            <p>Have questions? Our dedicated privacy team is here to help address any concerns.</p>
                            <div className="contact-buttons">
                                <a href="mailto:info@tv19news.com" className="btn-contact">
                                    <UilEnvelope className="btn-icon" size={16} /> Email Us
                                </a>
                                <a href="tel:+91910000000" className="btn-contact btn-outline">
                                    <UilPhone className="btn-icon" size={16} /> +91 99042...
                                </a>
                                <Link to="/contact" className="btn-contact btn-outline">
                                    Contact Form
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
