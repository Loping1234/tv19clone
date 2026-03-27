import { useState, useEffect } from 'react';
import '../../css/AboutUs/AboutUs.css';
import { UilEye, UilBullseye } from '@iconscout/react-unicons';

const API_BASE = 'http://localhost:5000';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  status: boolean;
}

export default function AboutUs() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/team-members`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => {
        const activeMembers = (data.members || []).filter((m: TeamMember) => m.status);
        setTeamMembers(activeMembers);
      })
      .catch(err => console.error('Failed to load team members:', err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="about-page-wrapper">
      {/* Top Banner Section */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-desc">
            We envision a world where communication and technology empower everyone. TV19News is a multimedia 
            brand that reaches people across print, radio, mobile, and digital platforms—round the clock, every
            day. With a 24×7 presence, we ensure news and information are always within your reach, no matter
            where you are.
          </p>
        </div>
      </section>

      {/* Split Content: Image + Text */}
      <section className="about-split-section">
        <div className="about-split-container">
          <div className="about-split-image">
            <div className="news-image-placeholder">
              <div className="live-badge">
                 <span className="live-dot"></span> 24×7 Live Broadcasting
              </div>
            </div>
          </div>
          <div className="about-split-text">
            <h2>News with Integrity, <span className="highlight-orange">Voice with Impact.</span></h2>
            <p className="sub-heading-orange">Your window to India’s top English news—fast, reliable, and always in your pocket.</p>
            
            <p>
              TV19News, launched with the vision of redefining journalism, has steadily grown into one of India’s most trusted 
              English news destinations. Known for its independent editorial voice and balanced, reliable news coverage, 
              TV19News has earned the attention and respect of audiences across India and around the world.
            </p>
            <p>
              With a wide network of correspondents and photojournalists across the country, TV19News delivers powerful reportage 
              from the national capital as well as from states and cities nationwide. As a digital-first brand, TV19News was among 
              the earliest Indian news platforms to embrace the internet, and today its website, mobile app, and e-paper cater to a 
              rapidly growing audience that prefers news on the go.
            </p>
            
            <div className="about-quote-box">
              Beyond breaking news, TV19News also brings in-depth business, politics, sports, and culture stories, offering a complete view of the nation.
            </div>

            <p>
              Published in multiple regional editions, it tailors content to suit diverse audiences, ensuring relevance and impact with 
              every update. TV19News continues to push boundaries with sharp analysis, fearless reporting, and seamless digital experiences—keeping you informed, wherever you are.
            </p>

            <div className="about-features-grid">
              <div className="feature-item"><span className="check-icon">✔</span> Independent Editorial Voice</div>
              <div className="feature-item"><span className="check-icon">✔</span> Digital-First Approach</div>
              <div className="feature-item"><span className="check-icon">✔</span> Pan-India Coverage</div>
              <div className="feature-item"><span className="check-icon">✔</span> Multiple Regional Editions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="about-vision-mission-section">
        <div className="vision-mission-container">
          <div className="vm-card">
            <div className="vm-icon-wrapper">
              <UilEye size={24} />
            </div>
            <h3>Our Vision</h3>
            <p>
              To be India\'s most trusted and innovative news platform, empowering citizens with accurate information and diverse perspectives. 
              We envision a world where every individual has access to in-depth, unbiased news that helps them make informed decisions and 
              participate actively in democracy.
            </p>
          </div>
          <div className="vm-card">
            <div className="vm-icon-wrapper">
              <UilBullseye size={24} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To deliver news with integrity, speed, and depth across all platforms. We are committed to upholding the highest standards of 
              journalism while embracing technology to reach every citizen. Our mission is to inform, educate, and inspire our audience through 
              compelling storytelling.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="about-leadership-section">
        <div className="leadership-header">
          <h2>Meet Our <span className="highlight-green">Leadership</span></h2>
          <div className="underline-orange"></div>
          <p>
            The experienced professionals who guide TV19News with vision, integrity, and commitment to excellence.
          </p>
        </div>

        <div className="leadership-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
              Loading team members...
            </div>
          ) : teamMembers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
              No team members available.
            </div>
          ) : (
            teamMembers.map((member) => (
              <div className="leader-card" key={member._id}>
                <div className="leader-img">
                  {member.imageUrl ? (
                    <img src={`${API_BASE}${member.imageUrl}`} alt={member.name} />
                  ) : (
                    <div className="leader-placeholder">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h4>{member.name}</h4>
                <span className="leader-role">{member.role}</span>
                <p>{member.description}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
