import React from "react";
import { Flag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <Flag size={28} className="footer-logo-icon" />
              <h3>iReporter</h3>
            </div>
            <p className="footer-description">
              Empowering citizens to drive positive change in their communities through transparent reporting of corruption and infrastructure issues.
            </p>
            <div className="footer-contact-info">
              <div className="contact-item">
                <Mail size={18} />
                <span>support@ireporter.app</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} />
                <span>123 Main St, City, Country</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><a href="/#impact">Our Impact</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section footer-support">
            <h4>Support</h4>
            <ul>
              <li><a href="/support">Help Center</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/status">Status Page</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section footer-legal">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/accessibility">Accessibility</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="footer-section footer-social">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a
                href="https://facebook.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://twitter.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://instagram.com/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://linkedin.com/company/ireporter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-credit">
            <p>
              &copy; {currentYear} <strong>iReporter</strong>. All rights reserved. Built with{" "}
              <Heart size={16} className="heart-icon" /> for transparency and accountability.
            </p>
          </div>
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Countries</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
