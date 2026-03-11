import React, { useEffect } from 'react';
import '../../css/Disclaimer/Disclaimer.css';
import { 
    UilInfoCircle, 
    UilExclamationTriangle, 
    UilChartLine, 
    UilExternalLinkAlt, 
    UilCommentsAlt, 
    UilShieldExclamation,
    UilCopyright,
    UilFileEditAlt,
    UilEnvelopeEdit
} from '@iconscout/react-unicons';

const Disclaimer: React.FC = () => {
    
    // Smooth scroll to section
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 180; // Offset for sticky navbar/header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Auto-scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="disclaimer-page">
            {/* Header Hero */}
            <header className="disclaimer-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Disclaimer</h1>
                    <p>
                        Please read the following disclaimer carefully before using TV19News. By accessing or using our services, 
                        you acknowledge that you have read, understood, and agreed to be bound by the terms.
                    </p>
                </div>
            </header>

            <div className="disclaimer-container">
                {/* Sticky Sidebar */}
                <aside className="disclaimer-sidebar">
                    <div className="sidebar-card">
                        <h3>Quick Navigation</h3>
                        <ul>
                            <li onClick={() => scrollToSection('general')}>General Disclaimer</li>
                            <li onClick={() => scrollToSection('accuracy')}>Content Accuracy</li>
                            <li onClick={() => scrollToSection('professional')}>No Professional Advice</li>
                            <li onClick={() => scrollToSection('external')}>External Links</li>
                            <li onClick={() => scrollToSection('user-content')}>User-Generated Content</li>
                            <li onClick={() => scrollToSection('liability')}>Limitation of Liability</li>
                            <li onClick={() => scrollToSection('copyright')}>Copyright Notice</li>
                            <li onClick={() => scrollToSection('changes')}>Changes to Disclaimer</li>
                            <li onClick={() => scrollToSection('contact')}>Contact Us</li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="disclaimer-main">
                    
                    {/* Important Notice Box */}
                    <div className="important-notice">
                        <div className="notice-icon">
                            <UilExclamationTriangle size={24} />
                        </div>
                        <div className="notice-text">
                            <strong>Important Notice</strong>
                            <p>
                                The information provided on TV19News is for general informational purposes only. All information 
                                on the site is provided in good faith, however we make no representation or warranty of any kind, 
                                express or implied, regarding the accuracy, adequacy, validity, reliability, availability or 
                                completeness of any information.
                            </p>
                        </div>
                    </div>

                    {/* Section 1: General Disclaimer */}
                    <section id="general" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle orange"><UilInfoCircle size={20} /></div>
                            <h2>General Disclaimer</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                TV19News (referred to as "we", "us", or "our") makes every effort to ensure the accuracy and reliability 
                                of the information presented on this platform. However, the information is provided "AS IS" without 
                                any warranty of any kind.
                            </p>
                            <ul>
                                <li>We do not guarantee that the website will be error-free or uninterrupted.</li>
                                <li>We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.</li>
                                <li>Use of any information on this site is at your own risk.</li>
                            </ul>
                            <div className="tip-box">
                                <p><strong>Note:</strong> While we strive for excellence, news is a fast-paced environment and updates may happen 
                                as more information becomes available.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Content Accuracy */}
                    <section id="accuracy" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle light-orange"><UilChartLine size={20} /></div>
                            <h2>Content Accuracy</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                While we strive to provide updated and accurate news, we cannot guarantee the complete accuracy or 
                                timeliness of all published content. News stories often evolve rapidly.
                            </p>
                            <ul>
                                <li>Facts and figures are verified to the best of our ability before publication.</li>
                                <li>We are not responsible for errors in reports sourced from external agencies.</li>
                                <li>Opinions expressed by guest contributors are their own and do not necessarily reflect TV19News' views.</li>
                                <li>Any reliance you place on such information is therefore strictly at your own risk.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3: No Professional Advice */}
                    <section id="professional" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle red"><UilShieldExclamation size={20} /></div>
                            <h2>No Professional Advice</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                The content on TV19News is intended for informational and educational purposes only and should not 
                                be construed as professional advice of any nature.
                            </p>
                            <ul>
                                <li><strong>Medical:</strong> Content does not substitute for professional medical advice or diagnosis.</li>
                                <li><strong>Financial:</strong> Investment analysis and market reports should not be taken as direct financial advice.</li>
                                <li><strong>Legal:</strong> Always seek the advice of a qualified attorney for legal matters.</li>
                                <li>No relationship is formed between the reader and the platform through the use of this content.</li>
                            </ul>
                            <div className="warning-box">
                                <p>Checking information with local authorities or qualified professionals is recommended before making decisions 
                                based on news reports.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: External Links Disclaimer */}
                    <section id="external" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle red-alt"><UilExternalLinkAlt size={20} /></div>
                            <h2>External Links Disclaimer</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                Our website may contain links to external websites that are not provided or maintained by or in any way 
                                affiliated with TV19News. Please note that we do not guarantee the accuracy or completeness of any 
                                information on these external sites.
                            </p>
                            <ul>
                                <li>We do not exercise any control over the content of third-party websites.</li>
                                <li>Links are provided for convenience and do not imply endorsement of the content.</li>
                                <li>We will not be responsible for any loss or damage caused by your use of third-party links.</li>
                                <li>External sites may have their own privacy policies and terms of use.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5: User-Generated Content */}
                    <section id="user-content" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle soft-orange"><UilCommentsAlt size={20} /></div>
                            <h2>User-Generated Content</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                TV19News may allow users to post comments or submit content. We are not responsible for the accuracy or 
                                opinions expressed in user-generated content, which is solely the responsibility of the poster.
                            </p>
                            <ul>
                                <li>We reserve the right to moderate, edit, or remove content at our discretion.</li>
                                <li>User comments do not represent the editorial stance of TV19News.</li>
                                <li>Users are responsible for ensuring their content does not violate any laws.</li>
                                <li>Report any inappropriate content to our moderation team via the contact page.</li>
                            </ul>
                            <div className="info-box-blue">
                                <p>Rules of engagement and community guidelines apply to all interactive sections of our website.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Limitation of Liability */}
                    <section id="liability" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle deep-orange"><UilExclamationTriangle size={20} /></div>
                            <h2>Limitation of Liability</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                In no event shall TV19News be liable for any special, direct, indirect, consequential, or incidental 
                                damages or any damages whatsoever, whether in an action of contract, negligence or other tort, 
                                arising out of or in connection with the use of the Service.
                            </p>
                            <ul>
                                <li>We shall not be liable for the loss of data or profits.</li>
                                <li>Liability is excluded for errors, omissions, or inaccuracies.</li>
                                <li>No liability for technical issues or external cyber threats.</li>
                                <li>The limitation of liability applies to the maximum extent permitted by law.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 7: Copyright Notice */}
                    <section id="copyright" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle orange"><UilCopyright size={20} /></div>
                            <h2>Copyright Notice</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                All content on TV19News, including text, logos, icons, and software, is the property of TV19News 
                                or its content suppliers and protected by international copyright laws.
                            </p>
                            <ul>
                                <li>Unauthorized use or reproduction of content is strictly prohibited.</li>
                                <li>All trademarks and logos are property of their respective owners.</li>
                                <li>Users may share content via official social sharing buttons only.</li>
                                <li>Commercial use of website data requires prior written consent.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 8: Changes to This Disclaimer */}
                    <section id="changes" className="disclaimer-section">
                        <div className="section-header">
                            <div className="icon-circle light-orange"><UilFileEditAlt size={20} /></div>
                            <h2>Changes to This Disclaimer</h2>
                        </div>
                        <div className="section-content">
                            <p>
                                We may update our Disclaimer from time to time. We will notify you of any changes by posting the 
                                new Disclaimer on this page.
                            </p>
                            <p>
                                You are advised to review this Disclaimer periodically for any changes. Changes to this Disclaimer 
                                are effective when they are posted on this page.
                            </p>
                        </div>
                    </section>

                    {/* Section 9: Contact Us Section */}
                    <section id="contact" className="disclaimer-section contact-disclaimer">
                        <div className="section-header">
                            <div className="icon-circle red"><UilEnvelopeEdit size={20} /></div>
                            <h2>Contact Us</h2>
                        </div>
                        <div className="section-content">
                            <p>If you have any questions about this Disclaimer, please contact us for further clarification.</p>
                            
                            {/* Blue Contact Card */}
                            <div className="contact-info-card">
                                <div className="card-header">
                                    <span className="info-icon">ⓘ</span>
                                    <h4>GET IN TOUCH</h4>
                                </div>
                                <p>Reach out to us if you have any doubts regarding our policies or data handling.</p>
                                <div className="contact-methods">
                                    <div className="method">
                                        <span className="icon">📧</span>
                                        <span>info@tv19news.com</span>
                                    </div>
                                    <div className="method">
                                        <span className="icon">📞</span>
                                        <span>+91 987 654 3210</span>
                                    </div>
                                    <div className="method">
                                        <span className="icon">📍</span>
                                        <span>Jodhpur, Rajasthan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};

export default Disclaimer;
