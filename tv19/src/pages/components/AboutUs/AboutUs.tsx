import { useState, useEffect } from 'react';
import '../../css/AboutUs/AboutUs.css';
import { UilEye, UilBullseye } from '@iconscout/react-unicons';

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
    fetch('http://localhost:5000/api/team-members')
      .then(res => res.json())
      .then(data => {
        if (data.members) {
          setTeamMembers(data.members.filter((m: TeamMember) => m.status));
        }
      })
      .catch(err => console.error("Failed to load team members", err))
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
             <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Loading leadership team...</p>
          ) : teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div className="leader-card" key={member._id}>
                {member.imageUrl ? (
                  <div 
                    className="leader-img" 
                    style={{ backgroundImage: `url(http://localhost:5000${member.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f0f0f0' }}
                  ></div>
                ) : (
                  <div className="leader-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', color: '#64748b', fontSize: '3rem', fontWeight: 'bold' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h4>{member.name}</h4>
                <span className="leader-role">{member.role}</span>
                <p>{member.description}</p>
              </div>
            ))
          ) : (
            <>
              {/* 1 */}
              <div className="leader-card">
                <div className="leader-img placeholder-1"></div>
                <h4>Rajdeep Singh</h4>
                <span className="leader-role">Editor-in-Chief</span>
                <p>The editor-in-chief holds the highest editorial position within a publication and media organization, overseeing content creation.</p>
              </div>
              {/* 2 */}
              <div className="leader-card">
                <div className="leader-img placeholder-2"></div>
                <h4>Anjana Sharma</h4>
                <span className="leader-role">Chief Content Officer</span>
                <p>Chief content officers direct the multi-platform content strategy for the company\'s portfolio of brands.</p>
              </div>
              {/* 3 */}
              <div className="leader-card">
                <div className="leader-img placeholder-3"></div>
                <h4>Pradeep Mehta</h4>
                <span className="leader-role">Chief Marketing Officer</span>
                <p>Oversees the marketing department, brand management, and all marketing communications.</p>
              </div>
              {/* 4 */}
              <div className="leader-card">
                <div className="leader-img placeholder-4"></div>
                <h4>Sharad Joshi</h4>
                <span className="leader-role">News Editor</span>
                <p>खबर-गैलेरी एक डिजिटल न्यूज प्लेटफ़ॉर्म है, जो मुख्यधारा और ब्रेकिंग न्यूज और फीचर और वीडियो की प्रामाणिक और सटीक रिपोर्टिंग प्रदान करने पर केंद्रित है।</p>
              </div>
              {/* 5 */}
              <div className="leader-card">
                <div className="leader-img placeholder-5"></div>
                <h4>Arvind Arora</h4>
                <span className="leader-role">Head of Digital</span>
                <p>Arvind drives our digital transformation, leading website, mobile app, and social media strategy for maximum reach.</p>
              </div>
              {/* 6 */}
              <div className="leader-card">
                <div className="leader-img placeholder-6"></div>
                <h4>Zafar Choudhary</h4>
                <span className="leader-role">Manager</span>
                <p>Business administration expert and operations manager.</p>
              </div>
              {/* 7 */}
              <div className="leader-card">
                <div className="leader-img blur-placeholder">
                  <span>19</span>
                </div>
                <h4>TV19 News</h4>
                <span className="leader-role">System Default Author</span>
                <p>TV19 News represents the official editorial team responsible for publishing syndicated and agency-sourced content. Articles without a set author...</p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
