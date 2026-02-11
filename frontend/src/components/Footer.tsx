import React from "react";
import { Flag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, Shield, Users, TrendingUp, Award, Globe, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/styles/footer.css";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      {/* Enhanced Background Effects */}
      <div className="footer-bg-effects">
        <div className="footer-gradient-overlay"></div>
        <div className="footer-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="footer-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-content">
          {/* Enhanced Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-container">
                <Flag size={32} className="footer-logo-icon" />
                <div className="footer-logo-glow"></div>
              </div>
              <div className="footer-brand-text">
                <h3>iReporter</h3>
                <div className="footer-tagline">Driving Change Together</div>
              </div>
            </div>
            <p className="footer-description">
              Empowering citizens worldwide to combat corruption and drive positive change through transparent, anonymous reporting of infrastructure issues and government accountability.
            </p>

            {/* Enhanced Contact Info */}
            <div className="footer-contact-info">
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Mail size={18} />
                </div>
                <span>support@ireporter.app</span>
              </div>
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone size={18} />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <span>Global Headquarters</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="footer-trust-indicators">
              <div className="trust-item">
                <Shield size={16} />
                <span>SSL Secured</span>
              </div>
              <div className="trust-item">
                <Award size={16} />
                <span>Certified Platform</span>
              </div>
              <div className="trust-item">
                <Globe size={16} />
                <span>50+ Countries</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div className="footer-section footer-links">
            <div className="footer-section-header">
              <Zap size={20} className="section-icon" />
              <h4>Quick Links</h4>
            </div>
            <ul>
              <li><a href="/#features" className="footer-link">Features</a></li>
              <li><a href="/#how-it-works" className="footer-link">How It Works</a></li>
              <li><a href="/#impact" className="footer-link">Our Impact</a></li>
              <li><a href="/dashboard" className="footer-link">Dashboard</a></li>
              <li><a href="/reports" className="footer-link">Browse Reports</a></li>
            </ul>
          </div>

          {/* Enhanced Support */}
          <div className="footer-section footer-support">
            <div className="footer-section-header">
              <Users size={20} className="section-icon" />
              <h4>Support</h4>
            </div>
            <ul>
              <li><a href="/support" className="footer-link">Help Center</a></li>
              <li><a href="/faq" className="footer-link">FAQ</a></li>
              <li><a href="/contact" className="footer-link">Contact Us</a></li>
              <li><a href="/status" className="footer-link">Status Page</a></li>
              <li><a href="/guides" className="footer-link">User Guides</a></li>
            </ul>
          </div>

          {/* Enhanced Legal */}
          <div className="footer-section footer-legal">
            <div className="footer-section-header">
              <Shield size={20} className="section-icon" />
              <h4>Legal</h4>
            </div>
            <ul>
              <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
              <li><a href="/terms" className="footer-link">Terms of Service</a></li>
              <li><a href="/cookies" className="footer-link">Cookie Policy</a></li>
              <li><a href="/accessibility" className="footer-link">Accessibility</a></li>
              <li><a href="/gdpr" className="footer-link">GDPR Compliance</a></li>
            </ul>
          </div>

          {/* Enhanced Social Media */}
          <div className="footer-section footer-social">
            <div className="footer-section-header">
              <TrendingUp size={20} className="section-icon" />
              <h4>Follow Us</h4>
            </div>
            <p className="social-description">Stay connected and join the movement</p>
            <div className="social-links">
              <a
                href="https://facebook.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <Facebook size={24} />
                <div className="social-glow"></div>
              </a>
              <a
                href="https://twitter.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon twitter"
                aria-label="Twitter"
              >
                <Twitter size={24} />
                <div className="social-glow"></div>
              </a>
              <a
                href="https://instagram.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <Instagram size={24} />
                <div className="social-glow"></div>
              </a>
              <a
                href="https://linkedin.com/company/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon linkedin"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
                <div className="social-glow"></div>
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="footer-newsletter">
              <h5>Stay Updated</h5>
              <div className="newsletter-input">
                <input type="email" placeholder="Enter your email" />
                <button type="submit" className="newsletter-btn">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-credit">
            <div className="credit-content">
              <p>
                &copy; {currentYear} <strong>iReporter</strong>. All rights reserved.
              </p>
              <div className="credit-message">
                Built with <Heart size={16} className="heart-icon" /> for transparency, accountability, and positive change.
              </div>
            </div>
          </div>

          <div className="footer-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <Flag size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-number">25K+</span>
                <span className="stat-label">Reports Filed</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-number">15K+</span>
                <span className="stat-label">Active Users</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <Globe size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-number">75+</span>
                <span className="stat-label">Countries</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <Award size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-number">98%</span>
                <span className="stat-label">Resolution Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <div className="scroll-arrow">↑</div>
      </button>
    </footer>
  );
};

export default Footer;
