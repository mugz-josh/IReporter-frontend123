import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../components/ui/styles/components.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import ClickableText from "@/components/ClickableText";
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
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin as MapIcon,
  Lock,
  Check,
  Languages,
  FileText as FileIcon,
} from "lucide-react";

const Homepage: React.FC = () => {
 const navigate = useNavigate();
 const { t } = useTranslation();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <nav className="header-nav">
            <a href="#features" className="nav-link">
              <ClickableText translationKey="nav.features" />
            </a>
            <a href="#how-it-works" className="nav-link">
              <ClickableText translationKey="nav.howItWorks" />
            </a>
            <a href="#impact" className="nav-link">
              <ClickableText translationKey="nav.impact" />
            </a>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <LanguageSelector />
            <button
              className="btn-ghost"
              style={{ marginTop: '-5px' }}
              onClick={() => navigate("/login", { state: { mode: "login" } })}
            >
              <ClickableText translationKey="login" />
            </button>
            <button className="btn-primary" onClick={handleSignup}>
              <ClickableText translationKey="getStarted" />
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
          <nav className="mobile-nav-links">
            <a
              href="#features"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ClickableText translationKey="nav.features" />
            </a>
            <a
              href="#how-it-works"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ClickableText translationKey="nav.howItWorks" />
            </a>
            <a
              href="#impact"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ClickableText translationKey="nav.impact" />
            </a>
          </nav>
          <div className="mobile-nav-actions">
            <button
              className="btn-ghost mobile-btn"
              onClick={() => {
                navigate("/login", { state: { mode: "login" } });
                setIsMobileMenuOpen(false);
              }}
            >
              <ClickableText translationKey="login" />
            </button>
            <button
              className="btn-primary mobile-btn"
              onClick={() => {
                handleSignup();
                setIsMobileMenuOpen(false);
              }}
            >
              <ClickableText translationKey="getStarted" />
            </button>
          </div>
        </div>
      </header>

      
      <section
        className="hero"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.1) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Shield size={16} />
            <ClickableText translationKey="hero.badge" />
          </div>

          <h1 className="hero-title animate-slide-up">
            <ClickableText translationKey="hero.title" />
          </h1>
          <p className="hero-description animate-slide-up-delay">
            <ClickableText translationKey="hero.description" />
          </p>
          <div className="hero-buttons animate-fade-in-delay">
            <button className="btn-primary btn-lg" onClick={handleSignup}>
              <ClickableText translationKey="createAccountBtn" />
            </button>
            <button
              className="btn-secondary btn-lg"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ClickableText translationKey="learnMore" />
            </button>
          </div>
          <div className="hero-features animate-fade-in-delay-2">
            <div className="feature-badge">
              <CheckCircle className="feature-icon" size={20} />
              <ClickableText translationKey="secureAnonymous" />
            </div>
            <div className="feature-badge">
              <Activity className="feature-icon" size={20} />
              <ClickableText translationKey="realTimeTracking" />
            </div>
            <div className="feature-badge">
              <Users className="feature-icon" size={20} />
              <ClickableText translationKey="communityDriven" />
            </div>
          </div>
        </div>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/assets/ireporter-hero.png" 
              alt="iReporter app illustration" 
              style={{ maxWidth: 340, width: '100%', borderRadius: 18, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }} 
            />
          </div>
        <div className="hero-visual">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
            <div className="shape shape-6"></div>
            <div className="shape shape-7"></div>
            <div className="shape shape-8"></div>
            <div className="shape shape-9"></div>
            <div className="shape shape-10"></div>
            <div className="shape shape-11"></div>
            <div className="shape shape-12"></div>
          </div>
        </div>
      </section>

      
      <section id="impact" className="stats-section">
        <h2 className="section-title"><ClickableText translationKey="trustedBy" /></h2>
        <p className="section-subtitle">
          <ClickableText translationKey="stats.subtitle" />
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
            <p className="stat-label"><ClickableText translationKey="activeCitizens" /></p>
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
            <p className="stat-label"><ClickableText translationKey="reportsSubmitted" /></p>
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
            <p className="stat-label"><ClickableText translationKey="issuesResolved" /></p>
          </div>
        </div>
      </section>

      
      <section id="how-it-works" className="process-section">
        <h2 className="section-title"><ClickableText translationKey="simpleProcess" /></h2>
        <p className="section-subtitle">
          <ClickableText translationKey="process.subtitle" />
        </p>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <h3 className="step-title"><ClickableText translationKey="createAccount" /></h3>
            <p className="step-description">
              <ClickableText translationKey="process.step1.detail" />
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <h3 className="step-title"><ClickableText translationKey="submitReport" /></h3>
            <p className="step-description">
              <ClickableText translationKey="process.step2.detail" />
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <h3 className="step-title"><ClickableText translationKey="trackProgress" /></h3>
            <p className="step-description">
              <ClickableText translationKey="process.step3.detail" />
            </p>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <h3 className="step-title"><ClickableText translationKey="seeChange" /></h3>
            <p className="step-description">
              <ClickableText translationKey="process.step4.detail" />
            </p>
          </div>
        </div>
      </section>

      <section className="corruption-awareness-section" style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%), url('https://img.freepik.com/premium-photo/steel-handcuffs-credit-cards-lying-background-american-dollars_416256-7100.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}>
            Fight Corruption Together
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            lineHeight: 1.6
          }}>
            Join the movement to expose corruption and build transparent communities. Your voice matters in creating accountability and positive change.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary btn-lg"
              onClick={() => navigate("/login", { state: { mode: "signup" } })}
              style={{
                background: 'hsl(var(--destructive))',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              Report Corruption Now
            </button>
            <button
              className="btn-secondary btn-lg"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="report-types-section">
        <h2 className="section-title"><ClickableText translationKey="twoWays" /></h2>
        <p className="section-subtitle">
          <ClickableText translationKey="reportTypes.subtitle" />
        </p>
        <div className="report-types-grid">
          <div className="report-type-card">
            <div className="report-type-icon red-flag-icon">
              <Flag size={32} />
            </div>
            <h3 className="report-type-title"><ClickableText translationKey="redFlagReports" /></h3>
            <p className="report-type-description">
              <ClickableText translationKey="redFlagDesc" />
            </p>

            <ul className="report-type-features">
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="anonymousReporting" />
              </li>
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="uploadEvidence" />
              </li>
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="trackStatus" />
              </li>
            </ul>
          </div>
          <div className="report-type-card intervention-card">
            <div className="report-type-icon intervention-icon">
              <MapPin size={32} />
            </div>
            <h3 className="report-type-title"><ClickableText translationKey="interventionRequests" /></h3>
            <p className="report-type-description">
              <ClickableText translationKey="interventionDesc" />
            </p>
            <ul className="report-type-features">
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="preciseMapping" />
              </li>
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="visualDoc" />
              </li>
              <li>
                <CheckCircle size={18} /> <ClickableText translationKey="resolutionUpdates" />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="success-stories-section">
        <div className="success-stories-content">
          <h2 className="success-stories-title"><ClickableText translationKey="recentSuccess" /></h2>
          <p className="success-stories-subtitle">
            <ClickableText translationKey="seeChangeCommunity" />
          </p>
          <div className="success-stories-grid">
            <div className="success-story-card">
              <div className="success-story-status" style={{ position: 'relative', top: '-20px' }}><ClickableText translationKey="resolved" /></div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <Flag size={24} />
                </div>
                <div>
                  <div className="success-story-category"><ClickableText translationKey="redFlagReport" /></div>
                  <div className="success-story-location"><ClickableText translationKey="story1.location" /></div>
                </div>
              </div>
              <h3 className="success-story-title"><ClickableText translationKey="story1.title" /></h3>
              <p className="success-story-description">
                <ClickableText translationKey="story1.desc" />
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">₦2.5M</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="fundsRecovered" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">3</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="officialsCharged" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">45</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="daysToResolution" /></div>
                </div>
              </div>
            </div>

            <div className="success-story-card">
              <div className="success-story-status" style={{ position: 'relative', top: '-20px' }}><ClickableText translationKey="resolved" /></div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="success-story-category"><ClickableText translationKey="interventionRequest" /></div>
                  <div className="success-story-location"><ClickableText translationKey="story2.location" /></div>
                </div>
              </div>
              <h3 className="success-story-title"><ClickableText translationKey="story2.title" /></h3>
              <p className="success-story-description">
                <ClickableText translationKey="story2.desc" />
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">15</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="lightsRepaired" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">48hrs</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="responseTime" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">200+</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="citizensBenefited" /></div>
                </div>
              </div>
            </div>

            <div className="success-story-card">
              <div className="success-story-status" style={{ position: 'relative', top: '-20px' }}><ClickableText translationKey="resolved" /></div>
              <div className="success-story-header">
                <div className="success-story-icon">
                  <Heart size={24} />
                </div>
                <div>
                  <div className="success-story-category"><ClickableText translationKey="healthcareIssue" /></div>
                  <div className="success-story-location"><ClickableText translationKey="story3.location" /></div>
                </div>
              </div>
              <h3 className="success-story-title"><ClickableText translationKey="story3.title" /></h3>
              <p className="success-story-description">
                <ClickableText translationKey="story3.desc" />
              </p>
              <div className="success-story-stats">
                <div className="success-story-stat">
                  <div className="success-story-stat-number">8</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="equipmentFixed" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">24hrs</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="responseTime" /></div>
                </div>
                <div className="success-story-stat">
                  <div className="success-story-stat-number">500+</div>
                  <div className="success-story-stat-label"><ClickableText translationKey="patientsHelped" /></div>
                </div>
              </div>
            </div>
          </div>
          <a href="/reports" className="view-all-stories">
            <ClickableText translationKey="viewAllStories" />
          </a>
        </div>
      </section>

      <section className="features-grid-section">
        <h2 className="section-title"><ClickableText translationKey="nav.features" /></h2>
        <p className="section-subtitle">
          Discover the powerful features that make iReporter the leading platform for citizen reporting
        </p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Shield size={32} />
            </div>
            <h3>Secure & Anonymous</h3>
            <p>Report with confidence knowing your identity is protected and your data is encrypted.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Activity size={32} />
            </div>
            <h3>Real-time Tracking</h3>
            <p>Monitor your report's progress from submission to resolution with live updates.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <MapPin size={32} />
            </div>
            <h3>Precise Location Mapping</h3>
            <p>Pinpoint exact locations with our advanced mapping technology for accurate reporting.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <FileText size={32} />
            </div>
            <h3>Evidence Upload</h3>
            <p>Attach photos, videos, and documents to strengthen your reports and investigations.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Users size={32} />
            </div>
            <h3>Community Driven</h3>
            <p>Join thousands of citizens working together to create transparent and accountable communities.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <TrendingUp size={32} />
            </div>
            <h3>Impact Tracking</h3>
            <p>See the real-world impact of your reports with detailed analytics and success stories.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title"><ClickableText translationKey="testimonials.title" /></h2>
        <p className="section-subtitle">
          <ClickableText translationKey="testimonials.subtitle" />
        </p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <Quote className="quote-icon" size={32} />
              <p className="testimonial-text">
                <ClickableText translationKey="testimonial1.quote" />
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <Star size={20} />
              </div>
              <div className="author-info">
                <h4><ClickableText translationKey="testimonial1.name" /></h4>
                <p><ClickableText translationKey="testimonial1.role" /></p>
              </div>
              <div className="author-rating">
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <Quote className="quote-icon" size={32} />
              <p className="testimonial-text">
                <ClickableText translationKey="testimonial2.quote" />
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <Star size={20} />
              </div>
              <div className="author-info">
                <h4><ClickableText translationKey="testimonial2.name" /></h4>
                <p><ClickableText translationKey="testimonial2.role" /></p>
              </div>
              <div className="author-rating">
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <Quote className="quote-icon" size={32} />
              <p className="testimonial-text">
                <ClickableText translationKey="testimonial3.quote" />
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <Star size={20} />
              </div>
              <div className="author-info">
                <h4><ClickableText translationKey="testimonial3.name" /></h4>
                <p><ClickableText translationKey="testimonial3.role" /></p>
              </div>
              <div className="author-rating">
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <h2 className="section-title"><ClickableText translationKey="trustedPartners" /></h2>
        <p className="section-subtitle"><ClickableText translationKey="workingTogether" /></p>
        <div className="partners-grid">
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Shield size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner1" />
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Heart size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner2" />
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Globe size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner3" />
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Award size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner4" />
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Eye size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner5" />
            </div>
          </div>
          <div className="partner-logo">
            <div className="partner-placeholder">
              <Target size={32} style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }} />
              <ClickableText translationKey="partner6" />
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-app-section">
        <div className="mobile-app-content">
          <h2 className="mobile-app-title"><ClickableText translationKey="getApp" /></h2>
          <p className="mobile-app-description">
            <ClickableText translationKey="appDesc" />
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
                <span className="app-store-label"><ClickableText translationKey="downloadOnThe" /></span>
                <span className="app-store-name"><ClickableText translationKey="appStore" /></span>
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
                <span className="app-store-label"><ClickableText translationKey="getItOn" /></span>
                <span className="app-store-name"><ClickableText translationKey="googlePlay" /></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="cta-mid-section">
        <div className="cta-mid-content">
          <h2 className="cta-mid-title"><ClickableText translationKey="readyToMakeDifference" /></h2>
          <p className="cta-mid-description">
            <ClickableText translationKey="joinThousands" />
          </p>
          <div className="cta-final-buttons" style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn-primary btn-lg"
              onClick={handleSignup}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.7em', paddingBottom: '0.5em', minHeight: 48 }}
            >
              <span style={{ lineHeight: 1, fontWeight: 600 }}><ClickableText translationKey="createAccountBtn" /></span>
            </button>
            <button
              className="btn-secondary btn-lg"
              onClick={() => navigate("/login", { state: { mode: "login" } })}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.7em', paddingBottom: '0.5em', minHeight: 48 }}
            >
              <span style={{ lineHeight: 1, fontWeight: 600 }}><ClickableText translationKey="loginBtn" /></span>
            </button>
          </div>
        </div>
      </section>

      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flag size={32} style={{ color: "hsl(var(--destructive))" }} />
              <h3 style={{ margin: 0 }}>iReporter</h3>
            </div>
            <p style={{ margin: '0.5rem 0 1rem 0', maxWidth: 320 }}>Empowering citizens to drive change and build transparent communities across Africa.</p>
            <div className="footer-contact" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.7rem' }}>
              <a href="mailto:support@ireporter.com" className="footer-contact-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '1rem' }}>
                <Mail size={18} /> support@ireporter.com
              </a>
              <a href="tel:+1234567890" className="footer-contact-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '1rem' }}>
                <Phone size={18} /> +1 234 567 890
              </a>
              <span className="footer-location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '1rem' }}>
                <MapIcon size={18} /> 123 Civic Drive, Lagos, Nigeria
              </span>
            </div>
            <div className="footer-newsletter" style={{ margin: '1.2rem 0 0.5rem 0' }}>
              <form style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onSubmit={e => { e.preventDefault(); }}>
                <Mail size={18} style={{ color: 'hsl(var(--primary))' }} />
                <input type="email" placeholder="Subscribe to newsletter" required style={{ padding: '0.4rem 0.7rem', borderRadius: 4, border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none' }} />
                <button type="submit" style={{ background: 'hsl(var(--primary))', color: '#fff', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 600, cursor: 'pointer' }}>Subscribe</button>
              </form>
            </div>
            <div className="footer-app-badges" style={{ display: 'flex', gap: '0.7rem', margin: '0.7rem 0' }}>
              <a href="https://apps.apple.com/app/ireporter/id1234567890" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', background: '#222', color: '#fff', borderRadius: 6, padding: '0.3rem 0.8rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.98rem', gap: '0.5rem' }}>
                <Apple size={20} /> App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.ireporter.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', background: '#1a73e8', color: '#fff', borderRadius: 6, padding: '0.3rem 0.8rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.98rem', gap: '0.5rem' }}>
                <Play size={20} /> Google Play
              </a>
            </div>
            <div className="footer-trust-badges" style={{ display: 'flex', gap: '0.7rem', margin: '0.7rem 0' }}>
              <span title="Secure & Private" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 500 }}><Lock size={17} /> Secure</span>
              <span title="Verified Platform" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontWeight: 500 }}><Shield size={17} /> Verified</span>
              <span title="Trusted by Community" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e42', fontWeight: 500 }}><Check size={17} /> Trusted</span>
            </div>
            <div className="footer-social" style={{ display: 'flex', gap: '1rem', marginTop: 8 }}>
              <a href="#" className="social-link" aria-label="Facebook"><Facebook size={22} /></a>
              <a href="#" className="social-link" aria-label="Twitter"><Twitter size={22} /></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin size={22} /></a>
              <a href="#" className="social-link" aria-label="Instagram"><Instagram size={22} /></a>
              <a href="#" className="social-link" aria-label="YouTube"><Youtube size={22} /></a>
            </div>
          </div>
          <div className="footer-links" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#features"><FileIcon size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Features</a>
              <a href="#how-it-works"><Zap size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> How It Works</a>
              <a href="#impact"><TrendingUp size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Impact</a>
              <a href="/reports"><Eye size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> View Reports</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="/support"><Shield size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Help Center</a>
              <a href="/support"><CheckCircle size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> FAQ</a>
              <a href="/support"><Mail size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Contact Us</a>
              <a href="/support"><Flag size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Report Issue</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="/about"><Users size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> About Us</a>
              <a href="/privacy"><Lock size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Privacy Policy</a>
              <a href="/terms"><FileText size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Terms of Service</a>
              <a href="/careers"><Award size={15} style={{marginRight: 6, verticalAlign: 'middle'}} /> Careers</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' }}>
          <p style={{ margin: 0 }}>&copy; 2024 iReporter. All rights reserved. Made with <span style={{color: 'hsl(var(--destructive))', fontWeight: 700}}>❤️</span> for transparent communities.</p>
          <a href="/accessibility" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.98rem', marginTop: 4 }}>
            <Users size={15} /> Accessibility Statement
          </a>
          <div className="footer-language-switcher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 8, justifyContent: 'center' }}>
            <Globe size={15} />
            <LanguageSelector />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
