import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../components/ui/styles/components.css";
import { Footer } from "@/components/Footer";
import { ThemeSelector } from "@/components/ThemeSelector";
import LanguageSelector from "@/components/LanguageSelector";
import {
  Shield,
  Activity,
  Users,
  Flag,
  FileText,
  CheckCircle,
  MapPin,
  TrendingUp,
  Star,
  Quote,
  Award,
  Globe,
  Heart,
  Zap,
  Eye,
  Target,
  Smartphone,
  Apple,
  Play,
  ExternalLink,
  Volume2,
  VolumeX,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Share2,
  Menu,
  X,
} from "lucide-react";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shareStory = (title: string, description: string) => {
   const url = window.location.href;
   const text = `${title}\n\n${description}\n\nShared from iReporter - Making a difference in communities!`;

   if (navigator.share) {
     navigator.share({
       title: title,
       text: text,
       url: url,
     });
   } else {
     // Fallback for browsers that don't support Web Share API
     const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
     window.open(shareUrl, '_blank');
   }
 };

 const speakIntro = () => {
   if ('speechSynthesis' in window) {
     if (isSpeaking) {
       speechSynthesis.cancel();
       setIsSpeaking(false);
       return;
     }

     const introText = `Welcome to iReporter, the platform that empowers citizens to report corruption and public issues. With iReporter, you can create red-flag reports for corruption incidents or intervention requests for infrastructure problems like broken roads or collapsed bridges. Track your reports in real-time, add geolocation, and get notified when authorities take action. Join thousands of citizens making a difference in their communities.`;

     const utterance = new SpeechSynthesisUtterance(introText);
     utterance.lang = 'en-US'; // Set language to English
     utterance.rate = 0.9; // Slightly slower for clarity
     utterance.pitch = 1;

     utterance.onstart = () => setIsSpeaking(true);
     utterance.onend = () => setIsSpeaking(false);
     utterance.onerror = () => setIsSpeaking(false);

     speechSynthesis.speak(utterance);
   } else {
     alert('Sorry, your browser does not support text-to-speech. Please try a modern browser like Chrome or Firefox.');
   }
 };
const handleSignup = () => {
 navigate("/login", { state: { mode: "signup" } });
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="header-container">
          <div
            className="header-logo"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Flag size={24} style={{ color: "hsl(var(--destructive))" }} />
            <h1 style={{ margin: 0 }}>iReporter</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="header-nav">
            <a href="#Features" className="nav-link">
              {t('nav.features')}
            </a>
            <a href="#How-it-works" className="nav-link">
              {t('nav.howItWorks')}
            </a>
            <a href="#impact" className="nav-link">
              {t('nav.impact')}
            </a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="header-actions">
            <ThemeSelector />
            <LanguageSelector />
            <button
              className="btn-ghost"
              onClick={() => navigate("/login", { state: { mode: "login" } })}
            >
              {t('login')}
            </button>
            <button className="btn-primary" onClick={handleSignup}>
              {t('GetStarted')}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Navigation Menu */}
          <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
            <nav className="mobile-nav">
              <a 
                href="#features" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.features')}
              </a>
              <a 
                href="#how-it-works" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.HowItWorks')}
              </a>
              <a 
                href="#impact" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.impact')}
              </a>
              <div className="mobile-nav-divider"></div>
              <button
                className="mobile-nav-btn btn-ghost"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/login", { state: { mode: "login" } });
                }}
              >
                {t('login')}
              </button>
              <button 
                className="mobile-nav-btn btn-primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignup();
                }}
              >
                {t('GetStarted')}
              </button>
            </nav>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
      </header>

      
      <section
        className="hero"
        style={{
          backgroundImage:
            "url(https://stories.freepiklabs.com/api/vectors/people-watching-the-news/amico/render?color=263238FF&background=complete&hide=)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="hero-overlay" style={{ background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))' }} />
        <div className="hero-content">
          <div className="hero-badge">
            <Star size={16} />
            Trusted by 10,000+ Citizens across Africa
          </div>
          <div className="hero-trust-signals">
            <span>✔ End-to-end encrypted & anonymous</span>
            <span>✔ Used in multiple African countries</span>
            <span>✔ Reports reviewed by verified authorities</span>
          </div>
          <h1 className="hero-title">
            {t('hero.title')}
          </h1>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-lg" style={{ background: 'hsl(var(--destructive))', color: 'white' }} onClick={handleSignup}>
              Report an Issue
            </button>
            <button
              className="btn-secondary btn-lg"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </button>
            <button
              className="btn-ghost btn-lg"
              onClick={speakIntro}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
              {isSpeaking ? 'Stop Audio' : 'Listen'}
            </button>
          </div>
          <div className="hero-features">
            <div className="feature-badge">
              <CheckCircle className="feature-icon" size={20} />
              Secure & Anonymous
            </div>
            <div className="feature-badge">
              <Activity className="feature-icon" size={20} />
              Real-time Tracking
            </div>
            <div className="feature-badge">
              <Users className="feature-icon" size={20} />
              Community Driven
            </div>
          </div>
        </div>
        <div className="scroll-cue">
          <span>↓ See How iReporter Works</span>
        </div>
      </section>

      <section id="how-it-works" className="process-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          From report to resolution in three simple steps
        </p>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <h3 className="step-title">Report an Issue</h3>
            <p className="step-description">
              Submit corruption or community problems safely and anonymously
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <h3 className="step-title">Authorities Review</h3>
            <p className="step-description">
              Relevant agencies receive verified reports and take action
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <h3 className="step-title">Track Progress</h3>
            <p className="step-description">
              Follow updates in real time and see the change happen
            </p>
          </div>
        </div>
      </section>

      <section id="impact" className="stats-section">
        <h2 className="section-title">{t('trustedBy')}</h2>
        <p className="section-subtitle">
          Together, we're building more transparent and accountable communities
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
              }}
            >
              <Users size={28} />
            </div>
            <h3 className="stat-number">10,000+</h3>
            <p className="stat-label">{t('activeCitizens')}</p>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              }}
            >
              <TrendingUp size={28} />
            </div>
            <h3 className="stat-number">5,000+</h3>
            <p className="stat-label">{t('reportsSubmitted')}</p>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <CheckCircle size={28} />
            </div>
            <h3 className="stat-number">2,500+</h3>
            <p className="stat-label">{t('issuesResolved')}</p>
          </div>
        </div>
      </section>

      
      <section id="how-it-works" className="process-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          From report to resolution in three simple steps
        </p>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <h3 className="step-title">Report an Issue</h3>
            <p className="step-description">
              Submit corruption or community problems safely and anonymously
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <h3 className="step-title">Authorities Review</h3>
            <p className="step-description">
              Relevant agencies receive verified reports and take action
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <h3 className="step-title">Track Progress</h3>
            <p className="step-description">
              Follow updates in real time and see the change happen
            </p>
          </div>
        </div>
      </section>

      
      <section id="features" className="report-types-section">
        <h2 className="section-title">{t('twoWays')}</h2>
        <p className="section-subtitle">
          Whether it's corruption or broken infrastructure, your voice matters
        </p>
        <div className="report-types-grid">
          <div className="report-type-card">
            <div className="report-type-icon red-flag-icon">
              <Flag size={32} />
            </div>
            <h3 className="report-type-title">{t('redFlagReports')}</h3>
            <p className="report-type-description">
              {t('redFlagDesc')}
            </p>
            <ul className="report-type-features">
              <li>
                <CheckCircle size={18} /> {t('anonymousReporting')}
              </li>
              <li>
                <CheckCircle size={18} /> {t('uploadEvidence')}
              </li>
              <li>
                <CheckCircle size={18} /> {t('trackStatus')}
              </li>
            </ul>
          </div>
          <div className="report-type-card intervention-card">
            <div className="report-type-icon intervention-icon">
              <MapPin size={32} />
            </div>
            <h3 className="report-type-title">{t('interventionRequests')}</h3>
            <p className="report-type-description">
              {t('interventionDesc')}
            </p>
            <ul className="report-type-features">
              <li>
                <CheckCircle size={18} /> {t('preciseMapping')}
              </li>
              <li>
                <CheckCircle size={18} /> {t('visualDoc')}
              </li>
              <li>
                <CheckCircle size={18} /> {t('resolutionUpdates')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">Hear from citizens who have made a difference</p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <Quote size={24} />
            <p className="testimonial-quote">"iReporter helped me report corruption in my local government. The process was secure and anonymous, and I saw real change."</p>
            <div className="testimonial-author">
              <p className="author-name">Carol Johnson</p>
              <p className="author-role">Community Activist</p>
            </div>
          </div>
          <div className="testimonial-card">
            <Quote size={24} />
            <p className="testimonial-quote">"Reporting infrastructure issues has never been easier. The app's location mapping and tracking features are fantastic."</p>
            <div className="testimonial-author">
              <p className="author-name">Michael Chen</p>
              <p className="author-role">Local Resident</p>
            </div>
          </div>
          <div className="testimonial-card">
            <Quote size={24} />
            <p className="testimonial-quote">"As a journalist, iReporter has been invaluable for gathering citizen reports and holding authorities accountable."</p>
            <div className="testimonial-author">
              <p className="author-name">Nankunda Felisha</p>
              <p className="author-role">Investigative Journalist</p>
            </div>
          </div>
        </div>
      </section>

      <section className="success-stories-section">
        <div className="success-stories-content">
          <h2 className="success-stories-title">{t('RecentSuccess')}</h2>
          <p className="success-stories-subtitle">
            {t('SeeChangeCommunity')}
          </p>
          <div className="success-stories-grid">
            <div className="success-story-card">
              <div className="success-story-status">Resolved</div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <Flag size={24} />
                </div>
                <div>
                  <div className="success-story-category">Red-Flag Report</div>
                  <div className="success-story-location">Lagos, Nigeria</div>
                </div>
              </div>
              <h3 className="success-story-title">Corruption in Local Government</h3>
              <p className="success-story-description">
                A citizen reported embezzlement of public funds by local officials. The report led to a full investigation, recovery of stolen funds, and prosecution of those involved.
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">₦2.5M</div>
                  <div className="success-story-stat-label">Funds Recovered</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">3</div>
                  <div className="success-story-stat-label">Officials Charged</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">45</div>
                  <div className="success-story-stat-label">Days to Resolution</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => shareStory('Corruption in Local Government', 'A citizen reported embezzlement of public funds by local officials. The report led to a full investigation, recovery of stolen funds, and prosecution of those involved.')}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  <Share2 size={16} style={{ marginRight: '0.5rem' }} />
                  Share
                </button>
              </div>
            </div>

            <div className="success-story-card">
              <div className="success-story-status">Resolved</div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="success-story-category">Intervention Request</div>
                  <div className="success-story-location">Kampala, Uganda</div>
                </div>
              </div>
              <h3 className="success-story-title">Broken Street Lights Fixed</h3>
              <p className="success-story-description">
                Community members reported non-functional street lights affecting safety. Authorities responded within 48 hours, repairing 15 lights and improving neighborhood security.
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">15</div>
                  <div className="success-story-stat-label">Lights Repaired</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">48hrs</div>
                  <div className="success-story-stat-label">Response Time</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">200+</div>
                  <div className="success-story-stat-label">Citizens Benefited</div>
                </div>
              </div>
            </div>

            <div className="success-story-card">
              <div className="success-story-status">Resolved</div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <Heart size={24} />
                </div>
                <div>
                  <div className="success-story-category">Healthcare Issue</div>
                  <div className="success-story-location">Dare-salam, Tanzania</div>
                </div>
              </div>
              <h3 className="success-story-title">Hospital Equipment Restored</h3>
              <p className="success-story-description">
                Reports of malfunctioning medical equipment in a public hospital led to immediate repairs and restocking of essential supplies, improving healthcare delivery.
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">8</div>
                  <div className="success-story-stat-label">Equipment Fixed</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">24hrs</div>
                  <div className="success-story-stat-label">Response Time</div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">500+</div>
                  <div className="success-story-stat-label">Patients Helped</div>
                </div>
              </div>
            </div>
          </div>
          <a href="/reports" className="view-all-stories">
            View All Success Stories
          </a>
        </div>
      </section>

      <section className="partners-section">
        <h2 className="section-title">{t('TrustedPartners')}</h2>
        <p className="section-subtitle">{t('WorkingTogether')}</p>
        <div className="partners-grid">
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Shield size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              Transparency International
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Heart size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              Amnesty International
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Globe size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              UNDP
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Award size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              World Bank
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Eye size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              Open Government Partnership
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Target size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              African Union
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-app-section">
        <div className="mobile-app-content">
          <div className="mobile-app-layout">
            <div className="mobile-app-text">
              <h2 className="mobile-app-title">{t('GetApp')}</h2>
              <p className="mobile-app-description">
                {t('AppDesc')}
              </p>
              <div className="app-stores">
                <a
                  href="https://apps.apple.com/app/ireporter/id1234567890"
                  className="app-store-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Apple className="app-store-icon" />
                  <div className="app-store-text">
                    <span className="app-store-label">Download on the</span>
                    <span className="app-store-name">App Store</span>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.ireporter.app"
                  className="app-store-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="app-store-icon" />
                  <div className="app-store-text">
                    <span className="app-store-label">Get it on</span>
                    <span className="app-store-name">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
            <div className="mobile-app-image">
              <img 
                src="https://image.made-in-china.com/365f3j00cuUjabQZvWoE/6-56-Inches-Cell-Phone-Android-12-Mobile-Phone-Uniwa-X19s-4G-Android-Global-Version-Smartphone.webp" 
                alt="iReporter Mobile App" 
                className="smartphone-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-mid-section">
        <div className="cta-mid-content">
          <h2 className="cta-mid-title">{t('ReadyToMakeDifference')}</h2>
          <p className="cta-mid-description">
            {t('JoinThousands')}
          </p>
          <div className="cta-final-buttons">
            <button className="btn-primary btn-lg" onClick={handleSignup}>
              {t('CreateAccountBtn')}
            </button>
            <button
              className="btn-secondary btn-lg"
              onClick={() => navigate("/login", { state: { mode: "login" } })}
            >
              {t('loginBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Professional Design */}
      <Footer />
    </div>
  );
};

export default Homepage;
