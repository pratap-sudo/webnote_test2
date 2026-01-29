import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import Navbar from './Navbar';

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About WebNote</h1>
          <p>Secure, Simple, and Powerful File Management for Everyone</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="section-content">
          <div className="mission-card">
            <h2>🎯 Our Mission</h2>
            <p>
              We believe that managing files should be simple, secure, and accessible to everyone. 
              WebNote was created to provide a reliable cloud storage solution that respects your privacy 
              and makes file management effortless. Whether you're a student, professional, or just someone 
              who needs to store important documents, WebNote is here for you.
            </p>
          </div>

          <div className="mission-card">
            <h2>💡 Our Vision</h2>
            <p>
              To become the most trusted file management platform by combining cutting-edge security, 
              intuitive design, and affordable pricing. We envision a world where everyone can securely 
              access their files from anywhere, at any time, without compromising on privacy or ease of use.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <h2>Why Choose WebNote?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔐</div>
            <h3>Bank-Level Security</h3>
            <p>Your files are encrypted and stored securely using industry-leading encryption protocols. Only you have access to your data.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Storage</h3>
            <p>Access your files from any device, anywhere in the world. Your files are always synchronized and up-to-date.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Fast upload and download speeds ensure you spend less time waiting and more time being productive.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Design</h3>
            <p>Intuitive interface designed with user experience in mind. No steep learning curve, just simple and elegant.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3>Easy Sharing</h3>
            <p>Share files with friends, family, or colleagues with just a few clicks. Control permissions with precision.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">💰</div>
            <h3>Affordable Plans</h3>
            <p>Start free with generous storage. Upgrade to premium for unlimited storage and advanced features.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="section-intro">Passionate professionals dedicated to making file management better</p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-avatar">👨‍💼</div>
            <h3>Pratap Indalkar</h3>
            <p className="role">Founder & CEO</p>
            <p className="bio">Visionary leader with 10+ years in cloud technologies and data security. Passionate about creating user-centric solutions that transform how people manage their digital lives.</p>
          </div>

          <div className="team-member">
            <div className="member-avatar">👩‍💻</div>
            <h3>Sarah Johnson</h3>
            <p className="role">Lead Developer</p>
            <p className="bio">Full-stack developer specializing in secure web applications. Ensures every line of code meets our high standards.</p>
          </div>

          <div className="team-member">
            <div className="member-avatar">👨‍🔒</div>
            <h3>Michael Chen</h3>
            <p className="role">Security Officer</p>
            <p className="bio">Cybersecurity expert with certifications in data protection. Guards your data with unwavering dedication.</p>
          </div>

          <div className="team-member">
            <div className="member-avatar">👩‍🎨</div>
            <h3>Emma Davis</h3>
            <p className="role">UX/UI Designer</p>
            <p className="bio">Creative designer focused on simplicity and elegance. Every pixel is designed with you in mind.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3 className="stat-number">50K+</h3>
          <p className="stat-label">Active Users</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-number">500M+</h3>
          <p className="stat-label">Files Secured</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-number">99.9%</h3>
          <p className="stat-label">Uptime Guarantee</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-number">24/7</h3>
          <p className="stat-label">Customer Support</p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <h2>Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2020 - Founded</h4>
              <p>WebNote was launched with a simple mission: to make file management accessible to everyone.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2021 - 10K Users</h4>
              <p>Reached 10,000 active users and expanded to 5 countries across Europe and Asia.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2022 - Advanced Features</h4>
              <p>Launched admin dashboard, advanced sharing, and version control features.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2023 - Security Certified</h4>
              <p>Achieved ISO 27001 certification and implemented enhanced encryption protocols.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2024 - Global Expansion</h4>
              <p>Expanded to 50+ countries with localized support in 15 languages.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>2025 - 50K+ Users</h4>
              <p>Celebrating our milestone with new mobile apps and enterprise features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Trust</h3>
            <p>We earn your trust through transparency, reliability, and unwavering commitment to your privacy.</p>
          </div>

          <div className="value-card">
            <h3>Innovation</h3>
            <p>We constantly innovate and improve our platform to stay ahead of the curve and serve you better.</p>
          </div>

          <div className="value-card">
            <h3>Excellence</h3>
            <p>We never settle for mediocrity. Every feature, every update reflects our commitment to excellence.</p>
          </div>

          <div className="value-card">
            <h3>Customer First</h3>
            <p>Your needs drive everything we do. Your feedback shapes our roadmap and our future.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who trust WebNote with their important files</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/register')} className="cta-btn primary">
            Create Free Account
          </button>
          <button onClick={() => navigate('/')} className="cta-btn secondary">
            Back to Home
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>WebNote</h4>
            <p>Your secure file management solution</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📧 support@webnote.com</p>
            <p>📱 +1 (555) 123-4567</p>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <p>
              <a href="#twitter">Twitter</a> • 
              <a href="#facebook"> Facebook</a> • 
              <a href="#linkedin"> LinkedIn</a>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 WebNote. All rights reserved. Made with ❤️ for you.</p>
        </div>
      </footer>
    </div>
  );
}

export default About;
