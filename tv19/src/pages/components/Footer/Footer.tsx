
import { Link } from 'react-router-dom';
import { UilFacebook, UilTwitter, UilYoutube, UilInstagram, UilWhatsapp, UilTelegram } from '@iconscout/react-unicons';
import '../../css/Footer/Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="tv19-global-footer">
      <div className="footer-container">
        
        {/* Row 1: 4 Columns */}
        <div className="footer-top-grid">
          
          {/* Column 1: Brand & Social */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-tv">TV</span>
              <span className="logo-19">19</span>
              <span className="logo-news">NEWS</span>
            </div>
            <p className="footer-desc">
              TV19 is your dedicated source for unbiased, real-time reporting covering global politics, local culture, technology, and lifestyle. We bring you the stories that matter, from the heart of Rajasthan to the world.
            </p>
            <div className="footer-social-icons">
              <a href="#facebook" className="f-icon"><UilFacebook size={18} /></a>
              <a href="#twitter" className="f-icon"><UilTwitter size={18} /></a>
              <a href="#youtube" className="f-icon"><UilYoutube size={18} /></a>
              <a href="#instagram" className="f-icon"><UilInstagram size={18} /></a>
              <a href="#whatsapp" className="f-icon"><UilWhatsapp size={18} /></a>
              <a href="#telegram" className="f-icon"><UilTelegram size={18} /></a>
            </div>
          </div>

          {/* Column 2: Explore Links */}
          <div className="footer-col links-col">
            <h4 className="footer-col-title">EXPLORE</h4>
            <ul className="footer-link-list">
              <li><Link to="/category/arts">Arts</Link></li>
              <li><Link to="/category/astrology">Astrology</Link></li>
              <li><Link to="/category/business">Business</Link></li>
              <li><Link to="/category/crime">Crime</Link></li>
              <li><Link to="/category/education">Education</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories Links */}
          <div className="footer-col links-col">
            <h4 className="footer-col-title">CATEGORIES</h4>
            <ul className="footer-link-list">
              <li><Link to="/category/entertainment">Entertainment</Link></li>
              <li><Link to="/category/finance">Finance</Link></li>
              <li><Link to="/category/green-future">Green Future</Link></li>
              <li><Link to="/category/india">India</Link></li>
              <li><Link to="/category/lifestyle">Lifestyle</Link></li>
            </ul>
          </div>

          {/* Column 4: Subscribe */}
          <div className="footer-col subscribe-col">
            <h4 className="footer-col-title">SUBSCRIBE</h4>
            <p className="footer-sub-text">Get the latest news delivered directly to your inbox.</p>
            <form className="footer-subscribe-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" required />
              <button type="submit">GO</button>
            </form>
          </div>

        </div>

        {/* Row 2: Copyright Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 tv19.news. All Rights Reserved.
          </div>
          <div className="footer-bottom-links">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/advertise">Advertise</Link>
            <Link to="/disclaimer">Disclaimer</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

      </div>

      {/* Floating Back-to-Top Button */}
      <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
        ↑
      </button>

    </footer>
  );
}
