import React, { useState } from 'react';
import '../../css/ContactUs/ContactUs.css';
import { UilStore, UilPhoneAlt, UilEnvelope, UilFacebook, UilTwitter, UilInstagram, UilYoutube, UilLinkedin, UilWhatsapp, UilMessage } from '@iconscout/react-unicons';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', reason: '', message: '' });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred');
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* Top Banner Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-desc">
            We envision a world where communication and technology empower everyone. TV19News is a multimedia 
            brand that reaches people across print, radio, mobile, and digital platforms—round the clock, every day.
            With a 24×7 presence, we ensure news and information are always within your reach, no matter where you are.
          </p>
        </div>
      </section>

      {/* Overlapping Info Cards Section */}
      <section className="contact-info-cards-section">
        <div className="contact-cards-container">
          
          <div className="contact-info-card">
            <div className="contact-card-icon-wrapper">
              <UilStore size={28} className="contact-card-icon" />
            </div>
            <h3 className="contact-card-title">Our Office</h3>
            <p className="contact-card-text">
              45, Donegall Place, Victoria Square Shopping<br />
              Centre, Belfast, BT1 5AD
            </p>
          </div>

          <div className="contact-info-card">
            <div className="contact-card-icon-wrapper">
              <UilPhoneAlt size={28} className="contact-card-icon" />
            </div>
            <h3 className="contact-card-title">Phone Number</h3>
            <p className="contact-card-text highlight-orange">
              +12-34-5678 9012<br />
              +12-34-5678 9013
            </p>
          </div>

          <div className="contact-info-card">
            <div className="contact-card-icon-wrapper">
              <UilEnvelope size={28} className="contact-card-icon" />
            </div>
            <h3 className="contact-card-title">Email Address</h3>
            <p className="contact-card-text highlight-orange">
              info@tv19news.com<br />
              support@tv19news.com
            </p>
          </div>

        </div>
      </section>

      {/* Main Content: Form + Social Connect */}
      <section className="contact-main-content-section">
        <div className="contact-main-grid">
          
          {/* Left Column: Feedback Form */}
          <div className="contact-feedback-block">
            <div className="feedback-header">
              <UilMessage size={24} className="feedback-header-icon" />
              <div>
                <h2 className="feedback-title">Give Feedback to TV19News</h2>
                <p className="feedback-subtitle">We value your feedback! Share your thoughts, suggestions, or report any issues you\'ve encountered.</p>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {status === 'success' && (
                <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>
                  Thank you! Your message has been sent successfully. Please check your email for a copy of your inquiry.
                </div>
              )}
              {status === 'error' && (
                <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>
                  {errorMessage}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
                </div>
                <div className="form-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                </div>
                <div className="form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
                </div>
              </div>

              <div className="form-group">
                <label>Reason of Contact <span className="required">*</span></label>
                <div className="select-wrapper">
                  <select name="reason" value={formData.reason} onChange={handleChange} required>
                    <option value="" disabled>Select</option>
                    <option value="feedback">General Feedback</option>
                    <option value="support">Technical Support</option>
                    <option value="press">Press / Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Your Message <span className="required">*</span></label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write here" rows={5} required></textarea>
              </div>

              <button type="submit" className="btn-send-message" disabled={status === 'loading'} style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
                <UilMessage size={18} /> {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

          {/* Right Column: Social Links */}
          <div className="contact-social-block">
            <div className="social-header">
              <div className="social-header-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-connect-icon">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <div>
                <h3 className="social-title">Connect with TV19News</h3>
                <p className="social-subtitle">Send news tips, report minor errors, or alert us about misuse of TV19News content.</p>
              </div>
            </div>

            <div className="social-buttons-grid">
              <a href="#facebook" className="social-button">
                <UilFacebook size={20} className="social-btn-icon fb-icon" />
                Facebook
              </a>
              <a href="#twitter" className="social-button">
                <UilTwitter size={20} className="social-btn-icon tw-icon" />
                Twitter
              </a>
              <a href="#instagram" className="social-button">
                <UilInstagram size={20} className="social-btn-icon ig-icon" />
                Instagram
              </a>
              <a href="#youtube" className="social-button">
                <UilYoutube size={20} className="social-btn-icon yt-icon" />
                Youtube
              </a>
              <a href="#linkedin" className="social-button">
                <UilLinkedin size={20} className="social-btn-icon in-icon" />
                Linkedin
              </a>
              <a href="#whatsapp" className="social-button">
                <UilWhatsapp size={20} className="social-btn-icon wa-icon" />
                Whatsapp
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
