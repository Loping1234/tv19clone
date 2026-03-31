import React from 'react';
import '../../css/HOME/home-comp/AdBanner.css';

interface AdBannerProps {
  variant?: 'horizontal' | 'square';
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = 'horizontal' }) => {
  return (
    <div className={`ad-banner ad-banner--${variant}`}>
      <div className="ad-banner__inner">
        <div className="ad-banner__label">ADVERTISEMENT</div>
        <div className="ad-banner__placeholder">
          <div className="ad-banner__icon">
            <i className="fas fa-ad"></i>
          </div>
          <span className="ad-banner__text">Your Ad Here</span>
          <span className="ad-banner__subtext">Contact us for advertising opportunities</span>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
