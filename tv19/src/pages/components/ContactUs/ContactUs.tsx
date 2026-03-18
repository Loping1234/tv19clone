import '../../css/ContactUs/ContactUs.css';
import { UilStore, UilPhoneAlt, UilEnvelope, UilFacebook, UilTwitter, UilInstagram, UilYoutube, UilLinkedin, UilWhatsapp, UilMessage } from '@iconscout/react-unicons';

export default function ContactUs() {
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

            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input type="text" placeholder="First Name" />
                </div>
                <div className="form-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input type="text" placeholder="Last Name" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input type="email" placeholder="Email" />
                </div>
                <div className="form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input type="tel" placeholder="Phone" />
                </div>
              </div>

              <div className="form-group">
                <label>Reason of Contact <span className="required">*</span></label>
                <div className="select-wrapper">
                  <select defaultValue="">
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
                <textarea placeholder="Write here" rows={5}></textarea>
              </div>

              <button type="button" className="btn-send-message">
                <UilMessage size={18} /> SEND MESSAGE
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
