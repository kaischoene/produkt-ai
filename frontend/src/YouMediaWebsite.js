import React, { useState, useEffect, useRef, useCallback } from 'react';
import './YouMediaWebsite.css';

/* ============================================================
   YOU MEDIA GmbH – Agency Website
   Inspired by Pixora Creative Agency Template
   ============================================================ */

// ─── SVG Icon Components ─────────────────────────────────────
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconPalette = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);

const IconVideo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
);

const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const IconMegaphone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
  </svg>
);

const IconPenTool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>
  </svg>
);

const IconPrint = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
  </svg>
);

const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const IconArrowUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

const IconTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
);


// ─── Image Placeholder Component ─────────────────────────────
const ImagePlaceholder = ({ text, height = '100%', gradient }) => {
  const gradients = {
    brand: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    creative: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
    modern: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2a2a2a 100%)',
    warm: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    accent: 'linear-gradient(135deg, #1a1a0a 0%, #2a2a1a 50%, #3a3a0a 100%)',
    photo: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  };

  return (
    <div
      style={{
        width: '100%',
        height,
        background: gradients[gradient] || gradients.modern,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />
      {text && (
        <span style={{
          color: 'rgba(255,255,255,0.15)',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          position: 'relative',
          zIndex: 1,
        }}>
          {text}
        </span>
      )}
    </div>
  );
};


// ─── useInView Hook ──────────────────────────────────────────
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [options]);

  return [ref, isVisible];
};

// ─── AnimatedSection Component ───────────────────────────────
const AnimatedSection = ({ children, className = '', animation = 'fade-up' }) => {
  const [ref, isVisible] = useInView();
  const animClass = `ym-${animation}${isVisible ? ' visible' : ''}`;
  return (
    <div ref={ref} className={`${animClass} ${className}`}>
      {children}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const YouMediaWebsite = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Preloader
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ───────── Services Data ─────────
  const services = [
    { icon: <IconGlobe />, title: 'Webdesign & Webentwicklung', desc: 'Massgeschneiderte Websites und E-Commerce-Lösungen mit modernster Technologie, SEO und CMS-Integration.' },
    { icon: <IconPalette />, title: 'Grafikdesign & Visuelle Gestaltung', desc: 'Von Logos bis zum kompletten visuellen Auftritt – individuell gestaltete Lösungen für Print und Digital.' },
    { icon: <IconPenTool />, title: 'Branding & Corporate Design', desc: 'Wir entwickeln Ihre Markenidentität von Grund auf – unverkennbar, authentisch und professionell.' },
    { icon: <IconCamera />, title: 'Fotografie', desc: 'Professionelle Produktfotografie, Porträts und Eventfotografie für Ihren überzeugenden Auftritt.' },
  ];

  const servicesList = [
    'Webdesign & Webentwicklung',
    'Branding & Corporate Design',
    'Grafikdesign & Visuelle Gestaltung',
    'Fotografie',
    'Eventfotografie',
    'Videografie',
    'Hochzeitsvideografie',
    'Künstliche Intelligenz',
    'Social Media',
    'Gestaltung von Printmedien',
    'Illustrationen',
  ];

  // ───────── Portfolio Data ─────────
  const portfolioItems = [
    { title: 'Brand Identity Design', category: 'Branding', gradient: 'brand' },
    { title: 'E-Commerce Webshop', category: 'Webdesign', gradient: 'creative' },
    { title: 'Social Media Kampagne', category: 'Social Media', gradient: 'modern' },
    { title: 'Corporate Photography', category: 'Fotografie', gradient: 'photo' },
    { title: 'Produktvideo Produktion', category: 'Videografie', gradient: 'warm' },
    { title: 'Print & Packaging Design', category: 'Grafikdesign', gradient: 'accent' },
  ];

  // ───────── Testimonials Data ─────────
  const testimonials = [
    {
      text: 'YOU MEDIA hat unsere komplette Markenidentität überarbeitet. Das Ergebnis hat unsere Erwartungen weit übertroffen – professionell, kreativ und termingerecht.',
      name: 'Marco B.',
      role: 'Geschäftsführer, Tech Startup',
      initials: 'MB',
    },
    {
      text: 'Die Zusammenarbeit mit Kai und seinem Team war hervorragend. Unsere neue Website generiert deutlich mehr Anfragen als zuvor.',
      name: 'Sandra K.',
      role: 'Marketing Leiterin, KMU Luzern',
      initials: 'SK',
    },
    {
      text: 'Qualität, Schnelligkeit und Zuverlässigkeit – genau das haben wir bei YOU MEDIA bekommen. Unser neuer Markenauftritt hebt uns klar von der Konkurrenz ab.',
      name: 'Thomas W.',
      role: 'Inhaber, Gastronomiebetrieb',
      initials: 'TW',
    },
  ];

  // ───────── Client Brands ─────────
  const clients = [
    'Volkswagen', 'Red Bull', 'Werder Bremen',
    'Teekanne', 'Milka', 'Diverse KMUs',
  ];


  return (
    <div className="ym-website">
      {/* ===================== PRELOADER ===================== */}
      <div className={`ym-preloader${isLoaded ? ' loaded' : ''}`}>
        <div className="ym-preloader-content">
          <div className="ym-preloader-count">{Math.min(Math.round(loadProgress), 100)}%</div>
          <div className="ym-preloader-bar">
            <div className="ym-preloader-bar-fill" style={{ width: `${Math.min(loadProgress, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ===================== HEADER ===================== */}
      <header className={`ym-header${isScrolled ? ' scrolled' : ''}`}>
        <div className="ym-container">
          <div className="ym-header-inner">
            <a href="#home" className="ym-logo" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
              <div className="ym-logo-text">YOU<span>MEDIA</span></div>
            </a>

            <nav className="ym-nav">
              <div className="ym-nav-links">
                {[
                  ['home', 'Home'],
                  ['about', 'Über Uns'],
                  ['services', 'Services'],
                  ['portfolio', 'Portfolio'],
                  ['process', 'Prozess'],
                  ['contact', 'Kontakt'],
                ].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
                  >
                    {label}
                  </a>
                ))}
              </div>

              <div className="ym-header-cta">
                <a
                  href="#contact"
                  className="ym-btn ym-btn-primary"
                  onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                >
                  Projekt starten
                </a>
              </div>

              <button
                className={`ym-menu-toggle${mobileMenuOpen ? ' active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                <span /><span /><span />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`ym-mobile-menu${mobileMenuOpen ? ' active' : ''}`}>
        {[
          ['home', 'Home'],
          ['about', 'Über Uns'],
          ['services', 'Services'],
          ['portfolio', 'Portfolio'],
          ['process', 'Prozess'],
          ['contact', 'Kontakt'],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* ===================== HERO ===================== */}
      <section id="home" className="ym-hero">
        <div className="ym-hero-bg">
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111 40%, #1a1a1a 100%)',
          }}>
            <ImagePlaceholder gradient="photo" />
          </div>
          <div className="ym-hero-bg-overlay" />
        </div>

        <div className="ym-hero-shape ym-hero-shape-1" />
        <div className="ym-hero-shape ym-hero-shape-2" />

        <div className="ym-container">
          <div className="ym-hero-content">
            <AnimatedSection>
              <div className="ym-hero-tag">
                <span className="ym-hero-tag-dot" />
                Werbeagentur Luzern
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h1 className="ym-hero-title">
                Wir erschaffen<br />
                <span className="ym-serif">Marken</span> die{' '}
                <span className="ym-accent">wirken.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection>
              <p className="ym-hero-subtitle">
                YOU MEDIA ist Ihre vertrauenswürdige Agentur für Branding, Design und Marketing in Luzern.
                Wir bieten kreative Lösungen für Ihren erfolgreichen Markenauftritt.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="ym-hero-actions">
                <a
                  href="#contact"
                  className="ym-btn ym-btn-primary ym-btn-large"
                  onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                >
                  Projekt starten <IconArrowRight />
                </a>
                <a
                  href="#services"
                  className="ym-btn ym-btn-outline ym-btn-large"
                  onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
                >
                  Unsere Services
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="ym-hero-stats">
                <div>
                  <div className="ym-hero-stat-number">10+</div>
                  <div className="ym-hero-stat-label">Jahre Erfahrung</div>
                </div>
                <div>
                  <div className="ym-hero-stat-number">200+</div>
                  <div className="ym-hero-stat-label">Projekte</div>
                </div>
                <div>
                  <div className="ym-hero-stat-number">100%</div>
                  <div className="ym-hero-stat-label">Kundenzufriedenheit</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <div className="ym-marquee-section">
        <div className="ym-marquee-track">
          {[1, 2].map(set => (
            <React.Fragment key={set}>
              {['Branding', 'Webdesign', 'Fotografie', 'Videografie', 'Social Media', 'KI'].map((text, i) => (
                <div className="ym-marquee-item" key={`${set}-${i}`}>
                  <span className="ym-marquee-dot" />
                  <span className={`ym-marquee-text${i % 2 === 0 ? ' filled' : ''}`}>{text}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===================== ABOUT ===================== */}
      <section id="about" className="ym-about">
        <div className="ym-container">
          <div className="ym-about-grid">
            <div>
              <AnimatedSection animation="fade-left">
                <div className="ym-section-tag">Über Uns</div>
                <h2 className="ym-about-title">
                  Kreative Werbeagentur mit Leidenschaft in Luzern
                </h2>
                <p className="ym-about-text">
                  Sind Sie auf der Suche nach einer kreativen und innovativen Werbeagentur in Luzern?
                  Dann sind Sie bei YOU MEDIA genau richtig. Der Inhaber Kai Schöne und sein Team
                  erarbeiten wirksame Kampagnen, um Ihr Unternehmen, Ihre Produkte oder
                  Dienstleistungen bekannter zu machen.
                </p>
                <p className="ym-about-text">
                  Mit über 10 Jahren Erfahrung als professioneller Web- und Grafikdesigner,
                  Videograf und Fotograf bieten wir Ihnen ein umfassendes Leistungsspektrum.
                  Als ehemaliger Senior Art Director hat Kai für namhafte Marken wie
                  Volkswagen, Red Bull, Werder Bremen, Teekanne und Milka gearbeitet.
                </p>
                <p className="ym-about-text">
                  Qualität, Schnelligkeit und Zuverlässigkeit – das können Sie von uns erwarten.
                  Ihr Erfolg ist unser Erfolg.
                </p>
                <div className="ym-about-founder">
                  <div className="ym-about-founder-avatar" style={{
                    background: 'linear-gradient(135deg, #dbf227, #a8e010)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#0a0a0a',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                  }}>
                    KS
                  </div>
                  <div>
                    <div className="ym-about-founder-name">Kai Schöne</div>
                    <div className="ym-about-founder-role">Gründer & Creative Director</div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fade-right">
              <div className="ym-about-image-wrapper">
                <div style={{ height: '500px', borderRadius: '20px', overflow: 'hidden' }}>
                  <ImagePlaceholder text="Kai Schöne – Founder" height="500px" gradient="photo" />
                </div>
                <div className="ym-about-image-badge">
                  <div className="ym-about-image-badge-number">10+</div>
                  <div className="ym-about-image-badge-text">Jahre<br />Erfahrung</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section id="services" className="ym-services">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-services-header">
              <div>
                <div className="ym-section-tag">Services</div>
                <h2 className="ym-section-title">
                  Kreative Lösungen für<br />Ihre Markenkommunikation
                </h2>
              </div>
              <p className="ym-services-subtitle">
                Wir entwickeln massgeschneiderte Strategien und kreative Konzepte,
                die Ihre Marke klar positionieren und Ihre Zielgruppe effektiv erreichen.
              </p>
            </div>
          </AnimatedSection>

          <div className="ym-services-grid ym-stagger" ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                  el.classList.add('visible');
                  observer.unobserve(entry.target);
                }
              }, { threshold: 0.1 });
              observer.observe(el);
            }
          }}>
            {services.map((service, i) => (
              <div className="ym-service-card" key={i}>
                <div className="ym-service-number">0{i + 1}</div>
                <div className="ym-service-icon">{service.icon}</div>
                <h3 className="ym-service-title">{service.title}</h3>
                <p className="ym-service-desc">{service.desc}</p>
              </div>
            ))}
          </div>

          {/* Service List */}
          <div className="ym-service-list">
            <AnimatedSection>
              <div className="ym-section-tag">Alle Dienstleistungen</div>
              <h3 className="ym-section-title" style={{ marginBottom: '40px', fontSize: 'clamp(28px, 3vw, 40px)' }}>
                Unser komplettes Leistungsspektrum
              </h3>
            </AnimatedSection>

            <div className="ym-service-list-items">
              {servicesList.map((name, i) => (
                <AnimatedSection key={i}>
                  <div className="ym-service-list-item">
                    <div className="ym-service-list-left">
                      <span className="ym-service-list-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="ym-service-list-name">{name}</span>
                    </div>
                    <span className="ym-service-list-arrow">
                      <IconArrowRight />
                    </span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PORTFOLIO ===================== */}
      <section id="portfolio" className="ym-portfolio">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-portfolio-header">
              <div className="ym-section-tag" style={{ justifyContent: 'center' }}>Portfolio</div>
              <h2 className="ym-section-title">Ausgewählte Projekte</h2>
              <p style={{ color: 'var(--ym-gray-light)', maxWidth: '560px', margin: '16px auto 0', fontSize: '17px', lineHeight: '1.7' }}>
                Ein Auszug unserer Arbeiten – von Branding über Webdesign bis hin zu Videoproduktionen.
              </p>
            </div>
          </AnimatedSection>

          <div className="ym-portfolio-grid">
            {portfolioItems.map((item, i) => (
              <AnimatedSection key={i}>
                <div className="ym-portfolio-item">
                  <div style={{ height: '380px', overflow: 'hidden' }}>
                    <div className="ym-portfolio-item-image" style={{ width: '100%', height: '100%' }}>
                      <ImagePlaceholder text={item.title} height="380px" gradient={item.gradient} />
                    </div>
                  </div>
                  <div className="ym-portfolio-item-overlay">
                    <div className="ym-portfolio-item-cat">{item.category}</div>
                    <div className="ym-portfolio-item-title">{item.title}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CLIENTS ===================== */}
      <section className="ym-clients">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-clients-header">
              <div className="ym-section-tag" style={{ justifyContent: 'center' }}>Referenzen</div>
              <h2 className="ym-section-title">Vertraut von namhaften Marken</h2>
              <p style={{ color: 'var(--ym-gray-light)', maxWidth: '500px', margin: '16px auto 0', fontSize: '17px' }}>
                Kai Schöne hat für einige der grössten Marken der Welt als Senior Art Director gearbeitet.
              </p>
            </div>
          </AnimatedSection>

          <div className="ym-clients-grid ym-stagger" ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                  el.classList.add('visible');
                  observer.unobserve(entry.target);
                }
              }, { threshold: 0.1 });
              observer.observe(el);
            }
          }}>
            {clients.map((name, i) => (
              <div className="ym-client-item" key={i}>
                <span className="ym-client-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PROCESS ===================== */}
      <section id="process" className="ym-process">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-process-header">
              <div className="ym-section-tag">Unser Prozess</div>
              <h2 className="ym-section-title">Wie wir arbeiten</h2>
              <p style={{ color: 'var(--ym-gray-light)', maxWidth: '560px', marginTop: '16px', fontSize: '17px', lineHeight: '1.7' }}>
                Von der ersten Beratung bis zum fertigen Projekt – wir begleiten Sie bei jedem Schritt.
              </p>
            </div>
          </AnimatedSection>

          <div className="ym-process-grid">
            {[
              {
                step: '01',
                title: 'Beratung & Strategie',
                text: 'Wir lernen Ihr Unternehmen, Ihre Ziele und Ihre Zielgruppe kennen. Gemeinsam entwickeln wir eine massgeschneiderte Strategie, die Ihre Marke klar positioniert.',
              },
              {
                step: '02',
                title: 'Kreation & Design',
                text: 'Unser kreatives Team setzt die Strategie in beeindruckende Designs um. Von Branding über Webdesign bis hin zu Foto- und Videoproduktionen.',
              },
              {
                step: '03',
                title: 'Development & Launch',
                text: 'Wir entwickeln und implementieren Ihre Lösung mit modernster Technologie. Nach gründlicher Qualitätsprüfung gehen wir live und begleiten den Launch.',
              },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <div className="ym-process-card">
                  <div className="ym-process-step">{item.step}</div>
                  <h3 className="ym-process-title">{item.title}</h3>
                  <p className="ym-process-text">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="ym-testimonials">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-testimonials-header">
              <div className="ym-section-tag" style={{ justifyContent: 'center' }}>Testimonials</div>
              <h2 className="ym-section-title">Was unsere Kunden sagen</h2>
            </div>
          </AnimatedSection>

          <div className="ym-testimonials-grid">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i}>
                <div className="ym-testimonial-card">
                  <div className="ym-testimonial-stars">
                    {[...Array(5)].map((_, si) => (
                      <span className="ym-testimonial-star" key={si}><IconStar /></span>
                    ))}
                  </div>
                  <p className="ym-testimonial-text">"{t.text}"</p>
                  <div className="ym-testimonial-author">
                    <div className="ym-testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="ym-testimonial-name">{t.name}</div>
                      <div className="ym-testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="ym-cta">
        <div className="ym-container">
          <AnimatedSection>
            <div className="ym-cta-inner">
              <div className="ym-cta-pattern" />
              <h2 className="ym-cta-title">Lassen Sie uns Ihre<br />Marke zum Leben erwecken!</h2>
              <p className="ym-cta-text">
                Ob Start-up, KMU oder Konzern – wir schaffen wirksame und erfolgreiche Kampagnen.
                Kontaktieren Sie uns für ein unverbindliches Erstgespräch.
              </p>
              <a
                href="#contact"
                className="ym-btn ym-btn-dark ym-btn-large"
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
              >
                Kontakt aufnehmen <IconArrowRight />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <section id="contact" className="ym-contact">
        <div className="ym-container">
          <div className="ym-contact-grid">
            <div>
              <AnimatedSection animation="fade-left">
                <div className="ym-section-tag">Kontakt</div>
                <h2 className="ym-section-title" style={{ marginBottom: '16px' }}>
                  Wir sind immer<br />für Sie da
                </h2>
                <p style={{ color: 'var(--ym-gray-light)', fontSize: '17px', lineHeight: '1.7', marginBottom: '10px' }}>
                  Haben Sie Fragen oder möchten mehr über unsere Dienstleistungen erfahren?
                  Kontaktieren Sie uns, wir helfen Ihnen gerne weiter.
                </p>

                <div className="ym-contact-info-items">
                  <div className="ym-contact-info-item">
                    <div className="ym-contact-info-icon"><IconPhone /></div>
                    <div>
                      <div className="ym-contact-info-label">Telefon</div>
                      <div className="ym-contact-info-value">
                        <a href="tel:+41797922133">+41 79 792 21 33</a>
                      </div>
                    </div>
                  </div>
                  <div className="ym-contact-info-item">
                    <div className="ym-contact-info-icon"><IconMail /></div>
                    <div>
                      <div className="ym-contact-info-label">E-Mail</div>
                      <div className="ym-contact-info-value">
                        <a href="mailto:info@you-media.ch">info@you-media.ch</a>
                      </div>
                    </div>
                  </div>
                  <div className="ym-contact-info-item">
                    <div className="ym-contact-info-icon"><IconMapPin /></div>
                    <div>
                      <div className="ym-contact-info-label">Adresse</div>
                      <div className="ym-contact-info-value">
                        Gemeindehausplatz 6<br />6048 Horw, Schweiz
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ym-contact-socials">
                  <a href="https://www.linkedin.com/company/you-media-gmbh" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="LinkedIn">
                    <IconLinkedin />
                  </a>
                  <a href="https://www.instagram.com/youmedia.ch" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="Instagram">
                    <IconInstagram />
                  </a>
                  <a href="https://www.facebook.com/youmedia.ch" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="Facebook">
                    <IconFacebook />
                  </a>
                  <a href="https://www.youtube.com/channel/UCH-xvhDXIe9aKlAMwvBEBcQ" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="YouTube">
                    <IconYoutube />
                  </a>
                  <a href="https://www.tiktok.com/@you.media.gmbh" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="TikTok">
                    <IconTiktok />
                  </a>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fade-right">
              <div className="ym-contact-form">
                <h3 style={{ fontFamily: 'var(--ym-font-heading)', fontSize: '24px', fontWeight: 600, marginBottom: '30px' }}>
                  Nachricht senden
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); alert('Vielen Dank für Ihre Nachricht! Wir melden uns bei Ihnen.'); }}>
                  <div className="ym-form-row">
                    <div className="ym-form-group">
                      <label className="ym-form-label">Vollständiger Name *</label>
                      <input type="text" className="ym-form-input" placeholder="Ihr Name" required />
                    </div>
                    <div className="ym-form-group">
                      <label className="ym-form-label">E-Mail-Adresse *</label>
                      <input type="email" className="ym-form-input" placeholder="ihre@email.ch" required />
                    </div>
                  </div>
                  <div className="ym-form-group">
                    <label className="ym-form-label">Betreff *</label>
                    <input type="text" className="ym-form-input" placeholder="Wie können wir helfen?" required />
                  </div>
                  <div className="ym-form-group">
                    <label className="ym-form-label">Nachricht</label>
                    <textarea className="ym-form-textarea" placeholder="Beschreiben Sie Ihr Projekt..." rows="5" />
                  </div>
                  <button type="submit" className="ym-btn ym-btn-primary ym-btn-large" style={{ width: '100%', justifyContent: 'center' }}>
                    Nachricht senden <IconArrowRight />
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="ym-footer">
        <div className="ym-container">
          <div className="ym-footer-grid">
            <div>
              <div className="ym-logo-text" style={{ fontSize: '28px' }}>YOU<span style={{ color: 'var(--ym-accent)' }}>MEDIA</span></div>
              <p className="ym-footer-brand-text">
                Ihre vertrauenswürdige Agentur für Branding, Design und Marketing in Luzern.
                Kreative Lösungen für Ihren erfolgreichen Markenauftritt.
              </p>
              <div className="ym-contact-socials" style={{ marginTop: '24px' }}>
                <a href="https://www.linkedin.com/company/you-media-gmbh" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="LinkedIn"><IconLinkedin /></a>
                <a href="https://www.instagram.com/youmedia.ch" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="Instagram"><IconInstagram /></a>
                <a href="https://www.facebook.com/youmedia.ch" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="Facebook"><IconFacebook /></a>
                <a href="https://www.youtube.com/channel/UCH-xvhDXIe9aKlAMwvBEBcQ" target="_blank" rel="noopener noreferrer" className="ym-contact-social" aria-label="YouTube"><IconYoutube /></a>
              </div>
            </div>

            <div>
              <h4 className="ym-footer-col-title">Angebot</h4>
              <div className="ym-footer-links">
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Beratung</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Kreation</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Development</a>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }}>Portfolio</a>
              </div>
            </div>

            <div>
              <h4 className="ym-footer-col-title">Leistungen</h4>
              <div className="ym-footer-links">
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Webdesign & Webentwicklung</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Branding & Corporate Design</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Grafikdesign</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Fotografie & Videografie</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Künstliche Intelligenz</a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Social Media</a>
              </div>
            </div>

            <div>
              <h4 className="ym-footer-col-title">Kontakt</h4>
              <div className="ym-footer-links">
                <a href="tel:+41797922133">+41 79 792 21 33</a>
                <a href="mailto:info@you-media.ch">info@you-media.ch</a>
                <span style={{ color: 'var(--ym-gray)', fontSize: '15px' }}>
                  Gemeindehausplatz 6<br />6048 Horw, Schweiz
                </span>
              </div>
            </div>
          </div>

          <div className="ym-footer-bottom">
            <div className="ym-footer-copyright">
              &copy; {new Date().getFullYear()} YOU MEDIA GmbH. Alle Rechte vorbehalten.
            </div>
            <div className="ym-footer-legal">
              <a href="https://you-media.ch/impressum/" target="_blank" rel="noopener noreferrer">Impressum</a>
              <a href="https://you-media.ch/datenschutzerklarung/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>
              <a href="https://you-media.ch/agb/" target="_blank" rel="noopener noreferrer">AGB</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== BACK TO TOP ===================== */}
      <button
        className={`ym-back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Nach oben"
      >
        <IconArrowUp />
      </button>
    </div>
  );
};

export default YouMediaWebsite;
