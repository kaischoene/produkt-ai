import React, { useState, useEffect, useRef } from 'react';
import './NooviLandingPage.css';

// ============================================================
// NOOVI.CH - MODERN WEBSITE REDESIGN 2026
// Swiss SaaS for Craftspeople & Construction SMEs
// Design: Clean, bold, Swiss-minimal with micro-animations
// ============================================================

// --- ICON COMPONENTS ---
const Icons = {
  Clock: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  Calendar: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  MessageSquare: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  FileText: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14,2 14,8 20,8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10,9 9,9 8,9"/>
    </svg>
  ),
  Truck: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
    </svg>
  ),
  Mic: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  ),
  Shield: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Smartphone: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>
    </svg>
  ),
  Users: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  BarChart: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
    </svg>
  ),
  Zap: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
  Check: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  CheckCircle: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  ),
  ArrowRight: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" x2="19" y1="12" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  Play: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21 5,3"/>
    </svg>
  ),
  Star: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  Menu: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  ),
  X: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
    </svg>
  ),
  ChevronDown: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  Package: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  Wrench: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  Leaf: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  Sun: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  ),
  Droplets: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 14.69c1.47 0 2.67-1.22 2.67-2.7 0-.78-.38-1.51-1.14-2.13-.76-.62-1.3-1.37-1.53-2.17-.23.8-.77 1.55-1.53 2.17-.76.62-1.14 1.35-1.14 2.13 0 1.48 1.2 2.7 2.67 2.7z"/>
    </svg>
  ),
  Paintbrush: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/>
    </svg>
  ),
  Bolt: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5,4.21 12,6.81 16.5,4.21"/><polyline points="7.5,19.79 7.5,14.6 3,12"/><polyline points="21,12 16.5,14.6 16.5,19.79"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/>
    </svg>
  ),
  Home: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  Hammer: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>
    </svg>
  ),
  Phone: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Mail: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  MapPin: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Globe: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Layers: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>
    </svg>
  ),
};


// --- TYPEWRITER HOOK ---
const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, isDeleting ? text.length - 1 : text.length + 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};


// --- INTERSECTION OBSERVER HOOK ---
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};


// --- ANIMATED COUNTER ---
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};


// ============================================================
// SECTION COMPONENTS
// ============================================================

// --- NAVIGATION ---
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Funktionen', href: '#funktionen' },
    { label: 'Branchen', href: '#branchen' },
    { label: 'Preise', href: '#preise' },
    { label: 'Referenzen', href: '#referenzen' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`noovi-nav ${scrolled ? 'noovi-nav--scrolled' : ''}`}>
      <div className="noovi-nav__inner">
        <a href="#hero" className="noovi-nav__logo">
          <div className="noovi-nav__logo-icon">n</div>
          <span className="noovi-nav__logo-text">noovi</span>
        </a>

        <div className="noovi-nav__links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="noovi-nav__link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="noovi-nav__actions">
          <a href="#demo" className="noovi-btn noovi-btn--ghost">Demo buchen</a>
          <a href="#trial" className="noovi-btn noovi-btn--primary">Kostenlos testen</a>
        </div>

        <button
          className="noovi-nav__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="noovi-nav__mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="noovi-nav__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="noovi-nav__mobile-actions">
            <a href="#demo" className="noovi-btn noovi-btn--ghost noovi-btn--full">Demo buchen</a>
            <a href="#trial" className="noovi-btn noovi-btn--primary noovi-btn--full">Kostenlos testen</a>
          </div>
        </div>
      )}
    </nav>
  );
};


// --- HERO SECTION ---
const HeroSection = () => {
  const trades = [
    'Schreiner', 'Elektriker', 'Maler', 'Dachdecker',
    'Sanitaer', 'Gartenbauer', 'Bodenleger', 'Solarinstallateur',
    'Reinigungsunternehmen', 'Metallbauer'
  ];
  const typedText = useTypewriter(trades, 80, 50, 1800);

  return (
    <section id="hero" className="noovi-hero">
      <div className="noovi-hero__bg">
        <div className="noovi-hero__gradient-1" />
        <div className="noovi-hero__gradient-2" />
        <div className="noovi-hero__grid-pattern" />
      </div>

      <div className="noovi-container noovi-hero__content">
        <div className="noovi-hero__badge">
          <Icons.Zap size={14} />
          <span>Von Handwerkern fuer Handwerker</span>
        </div>

        <h1 className="noovi-hero__title">
          Die Software fuer<br />
          <span className="noovi-hero__typed">
            {typedText}<span className="noovi-hero__cursor">|</span>
          </span>
        </h1>

        <p className="noovi-hero__subtitle">
          Einfach. Digital. Zeitsparend. Die All-in-One App fuer Schweizer
          Handwerksbetriebe - von der Zeiterfassung bis zur Rapportierung.
        </p>

        <div className="noovi-hero__cta-group">
          <a href="#trial" className="noovi-btn noovi-btn--primary noovi-btn--lg">
            30 Tage kostenlos testen
            <Icons.ArrowRight size={18} />
          </a>
          <a href="#video" className="noovi-btn noovi-btn--outline noovi-btn--lg">
            <Icons.Play size={18} />
            noovi in 90 Sekunden
          </a>
        </div>

        <div className="noovi-hero__trust">
          <div className="noovi-hero__trust-avatars">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="noovi-hero__avatar" style={{ backgroundColor: `hsl(${210 + i * 20}, 70%, ${55 + i * 5}%)` }}>
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="noovi-hero__trust-text">
            <div className="noovi-hero__trust-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Icons.Star key={i} size={14} />
              ))}
            </div>
            <span>Vertraut von ueber 1'000 KMU in der Schweiz</span>
          </div>
        </div>

        <div className="noovi-hero__mockup">
          <div className="noovi-hero__mockup-browser">
            <div className="noovi-hero__mockup-toolbar">
              <div className="noovi-hero__mockup-dots">
                <span /><span /><span />
              </div>
              <div className="noovi-hero__mockup-url">app.noovi.ch</div>
            </div>
            <div className="noovi-hero__mockup-screen">
              <div className="noovi-hero__mockup-sidebar">
                <div className="noovi-hero__mockup-sidebar-item active" />
                <div className="noovi-hero__mockup-sidebar-item" />
                <div className="noovi-hero__mockup-sidebar-item" />
                <div className="noovi-hero__mockup-sidebar-item" />
                <div className="noovi-hero__mockup-sidebar-item" />
              </div>
              <div className="noovi-hero__mockup-main">
                <div className="noovi-hero__mockup-header-bar" />
                <div className="noovi-hero__mockup-cards">
                  <div className="noovi-hero__mockup-card">
                    <div className="noovi-hero__mockup-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }} />
                    <div className="noovi-hero__mockup-card-lines">
                      <div className="noovi-hero__mockup-line w60" />
                      <div className="noovi-hero__mockup-line w40" />
                    </div>
                  </div>
                  <div className="noovi-hero__mockup-card">
                    <div className="noovi-hero__mockup-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }} />
                    <div className="noovi-hero__mockup-card-lines">
                      <div className="noovi-hero__mockup-line w70" />
                      <div className="noovi-hero__mockup-line w50" />
                    </div>
                  </div>
                  <div className="noovi-hero__mockup-card">
                    <div className="noovi-hero__mockup-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }} />
                    <div className="noovi-hero__mockup-card-lines">
                      <div className="noovi-hero__mockup-line w55" />
                      <div className="noovi-hero__mockup-line w35" />
                    </div>
                  </div>
                </div>
                <div className="noovi-hero__mockup-table">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="noovi-hero__mockup-table-row">
                      <div className="noovi-hero__mockup-line w30" />
                      <div className="noovi-hero__mockup-line w20" />
                      <div className="noovi-hero__mockup-line w25" />
                      <div className="noovi-hero__mockup-badge" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- SOCIAL PROOF / STATS ---
const StatsSection = () => {
  const [ref, isInView] = useInView();

  const stats = [
    { value: 1000, suffix: '+', label: 'Handwerksbetriebe' },
    { value: 18, suffix: '', label: 'Kernfunktionen' },
    { value: 13, suffix: '', label: 'Branchen' },
    { value: 99.9, suffix: '%', label: 'Verfuegbarkeit' },
  ];

  return (
    <section className="noovi-stats" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-stats__grid ${isInView ? 'noovi-animate-in' : ''}`}>
          {stats.map((stat, i) => (
            <div key={i} className="noovi-stats__item" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="noovi-stats__value">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="noovi-stats__label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={`noovi-stats__logos ${isInView ? 'noovi-animate-in' : ''}`}>
          <p className="noovi-stats__logos-label">Integriert mit</p>
          <div className="noovi-stats__logos-grid">
            {['Bexio', 'Sage', 'sevDesk', 'Abacus', 'KLARA'].map((name, i) => (
              <div key={i} className="noovi-stats__logo-item">
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// --- FEATURES SECTION ---
const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [ref, isInView] = useInView();

  const features = [
    {
      icon: <Icons.Clock size={24} />,
      title: 'Zeiterfassung',
      description: 'Erfasse Arbeitszeiten mobil und in Echtzeit. Mit GPS-Tracking und automatischer Projektzuordnung.',
      highlights: ['GPS-Tracking', 'Projektzuordnung', 'Export-Funktion'],
    },
    {
      icon: <Icons.Calendar size={24} />,
      title: 'Einsatzplanung',
      description: 'Plane deine Mitarbeiter und Teams effizient ein. Drag & Drop Kalender mit Echtzeit-Updates.',
      highlights: ['Drag & Drop', 'Team-Kalender', 'Push-Benachrichtigungen'],
    },
    {
      icon: <Icons.MessageSquare size={24} />,
      title: 'Baustellenchat',
      description: 'Kommuniziere direkt mit deinem Team auf der Baustelle. Fotos, Sprachnachrichten und Dokumente teilen.',
      highlights: ['Gruppen-Chat', 'Datei-Sharing', 'Lesebestaetigungen'],
    },
    {
      icon: <Icons.FileText size={24} />,
      title: 'Digitale Rapporte',
      description: 'Erstelle Rapporte digital mit E-Signatur. Keine Papierformulare mehr, alles in einer App.',
      highlights: ['E-Signatur', 'Foto-Dokumentation', 'PDF-Export'],
    },
    {
      icon: <Icons.Package size={24} />,
      title: 'Materialverwaltung',
      description: 'Behalte den Ueberblick ueber Material und Lagerbestand. Automatische Nachbestellung bei Bedarf.',
      highlights: ['Lagerbestand', 'Bestellvorschlaege', 'Barcode-Scan'],
    },
    {
      icon: <Icons.Mic size={24} />,
      title: 'KI-Spracherkennung',
      description: 'Diktiere Rapporte und Notizen per Sprache. Unsere KI wandelt alles in Text um - auch im Dialekt.',
      highlights: ['Dialekt-Erkennung', 'Auto-Formatierung', 'Offline-Modus'],
    },
    {
      icon: <Icons.Truck size={24} />,
      title: 'Fahrzeugverwaltung',
      description: 'Verwalte deinen Fuhrpark digital. Kilometerstand, Wartung und Fahrtenbuch an einem Ort.',
      highlights: ['Fahrtenbuch', 'Wartungsplanung', 'Kostenanalyse'],
    },
    {
      icon: <Icons.BarChart size={24} />,
      title: 'Auswertungen',
      description: 'Verstehe dein Geschaeft mit intelligenten Dashboards. Umsatz, Zeiten und Projekte auf einen Blick.',
      highlights: ['Live-Dashboard', 'PDF-Reports', 'Trend-Analyse'],
    },
  ];

  return (
    <section id="funktionen" className="noovi-features" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Funktionen</span>
          <h2 className="noovi-section-title">
            Alles was dein Betrieb braucht.<br />
            <span className="noovi-text-gradient">In einer App.</span>
          </h2>
          <p className="noovi-section-subtitle">
            18 Kernfunktionen, die deinen Arbeitsalltag vereinfachen.
            Von der Zeiterfassung bis zur Rapportierung.
          </p>
        </div>

        <div className="noovi-features__layout">
          <div className="noovi-features__list">
            {features.map((feature, i) => (
              <button
                key={i}
                className={`noovi-features__item ${activeFeature === i ? 'noovi-features__item--active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
                <div className="noovi-features__item-icon">{feature.icon}</div>
                <div className="noovi-features__item-content">
                  <h3>{feature.title}</h3>
                  {activeFeature === i && (
                    <p className="noovi-features__item-desc">{feature.description}</p>
                  )}
                </div>
                <Icons.ChevronDown size={18} />
              </button>
            ))}
          </div>

          <div className="noovi-features__preview">
            <div className="noovi-features__preview-card">
              <div className="noovi-features__preview-icon">
                {features[activeFeature].icon}
              </div>
              <h3 className="noovi-features__preview-title">
                {features[activeFeature].title}
              </h3>
              <p className="noovi-features__preview-desc">
                {features[activeFeature].description}
              </p>
              <div className="noovi-features__preview-highlights">
                {features[activeFeature].highlights.map((h, i) => (
                  <div key={i} className="noovi-features__highlight">
                    <Icons.CheckCircle size={16} />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="noovi-features__preview-mockup">
                <div className="noovi-features__phone">
                  <div className="noovi-features__phone-notch" />
                  <div className="noovi-features__phone-screen">
                    <div className="noovi-features__phone-header">
                      <div className="noovi-hero__mockup-line w40" />
                    </div>
                    <div className="noovi-features__phone-content">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="noovi-features__phone-row">
                          <div className="noovi-features__phone-row-icon" style={{ background: `hsl(${200 + i * 30}, 70%, 60%)` }} />
                          <div className="noovi-features__phone-row-lines">
                            <div className="noovi-hero__mockup-line w70" />
                            <div className="noovi-hero__mockup-line w50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- THREE PILLARS SECTION ---
const PillarsSection = () => {
  const [ref, isInView] = useInView();

  const pillars = [
    {
      icon: <Icons.Hammer size={32} />,
      title: 'Fuer Handwerker gebaut',
      description: 'Entwickelt mit echten Handwerkern aus der Schweiz. Jede Funktion loest ein reales Problem aus dem Arbeitsalltag.',
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    },
    {
      icon: <Icons.Layers size={32} />,
      title: 'Alles in einer App',
      description: 'Schluss mit 10 verschiedenen Tools. noovi vereint Zeiterfassung, Planung, Chat, Rapporte und mehr in einer einzigen App.',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    {
      icon: <Icons.Shield size={32} />,
      title: 'Schweizer Datenschutz',
      description: 'Deine Daten bleiben in der Schweiz. Gehostet auf Schweizer Servern, DSGVO-konform und SSL-verschluesselt.',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    },
  ];

  return (
    <section className="noovi-pillars" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-pillars__grid ${isInView ? 'noovi-animate-in' : ''}`}>
          {pillars.map((pillar, i) => (
            <div key={i} className="noovi-pillars__card" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="noovi-pillars__icon" style={{ background: pillar.gradient }}>
                {pillar.icon}
              </div>
              <h3 className="noovi-pillars__title">{pillar.title}</h3>
              <p className="noovi-pillars__desc">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- INDUSTRIES SECTION ---
const IndustriesSection = () => {
  const [ref, isInView] = useInView();

  const industries = [
    { icon: <Icons.Hammer size={28} />, name: 'Schreiner', color: '#8B5E3C' },
    { icon: <Icons.Bolt size={28} />, name: 'Elektriker', color: '#F59E0B' },
    { icon: <Icons.Paintbrush size={28} />, name: 'Maler & Gipser', color: '#EC4899' },
    { icon: <Icons.Home size={28} />, name: 'Dachdecker', color: '#EF4444' },
    { icon: <Icons.Droplets size={28} />, name: 'Sanitaer', color: '#3B82F6' },
    { icon: <Icons.Leaf size={28} />, name: 'Gartenbauer', color: '#10B981' },
    { icon: <Icons.Layers size={28} />, name: 'Bodenleger', color: '#8B5CF6' },
    { icon: <Icons.Sun size={28} />, name: 'Solar', color: '#F97316' },
    { icon: <Icons.Wrench size={28} />, name: 'Metallbauer', color: '#6B7280' },
    { icon: <Icons.Home size={28} />, name: 'Bauunternehmer', color: '#78716C' },
    { icon: <Icons.Users size={28} />, name: 'Reinigung', color: '#06B6D4' },
    { icon: <Icons.Wrench size={28} />, name: 'Dienstleister', color: '#6366F1' },
    { icon: <Icons.Package size={28} />, name: 'Zimmerleute', color: '#A16207' },
  ];

  return (
    <section id="branchen" className="noovi-industries" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Branchen</span>
          <h2 className="noovi-section-title">
            Massgeschneidert fuer<br />
            <span className="noovi-text-gradient">deine Branche.</span>
          </h2>
          <p className="noovi-section-subtitle">
            noovi versteht die spezifischen Anforderungen von 13 verschiedenen
            Handwerks- und Baugewerbe-Branchen.
          </p>
        </div>

        <div className={`noovi-industries__grid ${isInView ? 'noovi-animate-in' : ''}`}>
          {industries.map((ind, i) => (
            <div
              key={i}
              className="noovi-industries__card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="noovi-industries__icon" style={{ color: ind.color, backgroundColor: `${ind.color}15` }}>
                {ind.icon}
              </div>
              <span className="noovi-industries__name">{ind.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- PRODUCT DEMO SECTION ---
const ProductDemoSection = () => {
  const [ref, isInView] = useInView();

  return (
    <section id="video" className="noovi-demo" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Demo</span>
          <h2 className="noovi-section-title">
            Erlebe noovi<br />
            <span className="noovi-text-gradient">in Aktion.</span>
          </h2>
          <p className="noovi-section-subtitle">
            Schau dir an, wie noovi deinen Arbeitsalltag revolutioniert.
            In nur 90 Sekunden.
          </p>
        </div>

        <div className={`noovi-demo__player ${isInView ? 'noovi-animate-in' : ''}`}>
          <div className="noovi-demo__video-wrapper">
            <div className="noovi-demo__video-placeholder">
              <div className="noovi-demo__play-btn">
                <Icons.Play size={32} />
              </div>
              <div className="noovi-demo__video-overlay">
                <div className="noovi-demo__video-ui">
                  <div className="noovi-demo__video-topbar">
                    <div className="noovi-hero__mockup-line w30" />
                    <div className="noovi-hero__mockup-line w20" />
                  </div>
                  <div className="noovi-demo__video-content">
                    <div className="noovi-demo__video-sidebar">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`noovi-demo__video-nav-item ${i === 1 ? 'active' : ''}`} />
                      ))}
                    </div>
                    <div className="noovi-demo__video-main">
                      <div className="noovi-demo__video-chart">
                        <div className="noovi-demo__video-bar" style={{ height: '60%' }} />
                        <div className="noovi-demo__video-bar" style={{ height: '80%' }} />
                        <div className="noovi-demo__video-bar" style={{ height: '45%' }} />
                        <div className="noovi-demo__video-bar" style={{ height: '90%' }} />
                        <div className="noovi-demo__video-bar" style={{ height: '70%' }} />
                        <div className="noovi-demo__video-bar" style={{ height: '55%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="noovi-demo__caption">noovi Dashboard - Alle Funktionen auf einen Blick</p>
        </div>
      </div>
    </section>
  );
};


// --- TESTIMONIALS SECTION ---
const TestimonialsSection = () => {
  const [ref, isInView] = useInView();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote: 'Mit noovi sparen wir pro Woche mindestens 5 Stunden an administrativer Arbeit. Die Zeiterfassung und Rapportierung laufen jetzt komplett digital.',
      author: 'Marco Brunner',
      role: 'Geschaeftsfuehrer',
      company: 'Brunner Elektro AG',
      rating: 5,
    },
    {
      quote: 'Die App ist so einfach, dass selbst unsere aelteren Mitarbeiter sofort damit arbeiten konnten. Der Support ist erstklassig und antwortet immer schnell.',
      author: 'Sandra Mueller',
      role: 'Inhaberin',
      company: 'Mueller Malergeschaeft GmbH',
      rating: 5,
    },
    {
      quote: 'Endlich eine Software, die fuer Schweizer Handwerker gemacht ist. Die Spracherkennung versteht sogar Schweizerdeutsch - das ist einmalig.',
      author: 'Thomas Keller',
      role: 'Betriebsleiter',
      company: 'Keller Holzbau',
      rating: 5,
    },
  ];

  return (
    <section id="referenzen" className="noovi-testimonials" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Referenzen</span>
          <h2 className="noovi-section-title">
            Das sagen unsere<br />
            <span className="noovi-text-gradient">Kunden.</span>
          </h2>
        </div>

        <div className={`noovi-testimonials__content ${isInView ? 'noovi-animate-in' : ''}`}>
          <div className="noovi-testimonials__card">
            <div className="noovi-testimonials__stars">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Icons.Star key={i} size={20} />
              ))}
            </div>
            <blockquote className="noovi-testimonials__quote">
              "{testimonials[activeTestimonial].quote}"
            </blockquote>
            <div className="noovi-testimonials__author">
              <div className="noovi-testimonials__avatar">
                {testimonials[activeTestimonial].author.charAt(0)}
              </div>
              <div>
                <div className="noovi-testimonials__name">
                  {testimonials[activeTestimonial].author}
                </div>
                <div className="noovi-testimonials__role">
                  {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                </div>
              </div>
            </div>
          </div>

          <div className="noovi-testimonials__dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`noovi-testimonials__dot ${activeTestimonial === i ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// --- PRICING SECTION ---
const PricingSection = () => {
  const [ref, isInView] = useInView();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Fuer Einzelunternehmer und kleine Teams',
      price: annual ? 39 : 49,
      period: annual ? '/Mt. (jaehrlich)' : '/Mt.',
      features: [
        'Bis 5 Benutzer',
        'Zeiterfassung',
        'Einsatzplanung',
        'Baustellenchat',
        'Mobile App',
        'E-Mail Support',
      ],
      cta: 'Kostenlos testen',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'Fuer wachsende Handwerksbetriebe',
      price: annual ? 79 : 99,
      period: annual ? '/Mt. (jaehrlich)' : '/Mt.',
      features: [
        'Bis 20 Benutzer',
        'Alle Starter-Funktionen',
        'Digitale Rapporte & E-Signatur',
        'Materialverwaltung',
        'Fahrzeugverwaltung',
        'KI-Spracherkennung',
        'Integrationen (Bexio, etc.)',
        'Prioritaets-Support',
      ],
      cta: 'Kostenlos testen',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Fuer grosse Unternehmen',
      price: annual ? 149 : 189,
      period: annual ? '/Mt. (jaehrlich)' : '/Mt.',
      features: [
        'Unbegrenzte Benutzer',
        'Alle Professional-Funktionen',
        'Erweiterte Auswertungen',
        'API-Zugang',
        'Dedicated Account Manager',
        'Custom Integrationen',
        'SLA-Garantie',
        'Onboarding & Schulung',
      ],
      cta: 'Kontakt aufnehmen',
      popular: false,
    },
  ];

  return (
    <section id="preise" className="noovi-pricing" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Preise</span>
          <h2 className="noovi-section-title">
            Transparente Preise.<br />
            <span className="noovi-text-gradient">Keine versteckten Kosten.</span>
          </h2>
          <p className="noovi-section-subtitle">
            30 Tage kostenlos testen. Keine Kreditkarte erforderlich.
          </p>
        </div>

        <div className="noovi-pricing__toggle">
          <span className={!annual ? 'active' : ''}>Monatlich</span>
          <button
            className={`noovi-pricing__switch ${annual ? 'active' : ''}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle billing period"
          >
            <div className="noovi-pricing__switch-thumb" />
          </button>
          <span className={annual ? 'active' : ''}>
            Jaehrlich <span className="noovi-pricing__save">-20%</span>
          </span>
        </div>

        <div className={`noovi-pricing__grid ${isInView ? 'noovi-animate-in' : ''}`}>
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`noovi-pricing__card ${plan.popular ? 'noovi-pricing__card--popular' : ''}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {plan.popular && <div className="noovi-pricing__popular-badge">Beliebteste Wahl</div>}
              <div className="noovi-pricing__card-header">
                <h3 className="noovi-pricing__plan-name">{plan.name}</h3>
                <p className="noovi-pricing__plan-desc">{plan.description}</p>
              </div>
              <div className="noovi-pricing__price">
                <span className="noovi-pricing__currency">CHF</span>
                <span className="noovi-pricing__amount">{plan.price}</span>
                <span className="noovi-pricing__period">{plan.period}</span>
              </div>
              <ul className="noovi-pricing__features">
                {plan.features.map((feature, j) => (
                  <li key={j}>
                    <Icons.Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#trial"
                className={`noovi-btn ${plan.popular ? 'noovi-btn--primary' : 'noovi-btn--outline'} noovi-btn--full`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- INTEGRATIONS SECTION ---
const IntegrationsSection = () => {
  const [ref, isInView] = useInView();

  const integrations = [
    { name: 'Bexio', category: 'Buchhaltung' },
    { name: 'Sage', category: 'ERP' },
    { name: 'sevDesk', category: 'Buchhaltung' },
    { name: 'Abacus', category: 'ERP' },
    { name: 'KLARA', category: 'Business' },
    { name: 'Atlanto', category: 'Business' },
    { name: 'Microsoft 365', category: 'Produktivitaet' },
    { name: 'Google Workspace', category: 'Produktivitaet' },
  ];

  return (
    <section className="noovi-integrations" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">Integrationen</span>
          <h2 className="noovi-section-title">
            Verbindet sich mit deinen<br />
            <span className="noovi-text-gradient">bestehenden Tools.</span>
          </h2>
          <p className="noovi-section-subtitle">
            noovi laesst sich nahtlos in deine bestehende Software-Landschaft integrieren.
          </p>
        </div>

        <div className={`noovi-integrations__grid ${isInView ? 'noovi-animate-in' : ''}`}>
          {integrations.map((integration, i) => (
            <div key={i} className="noovi-integrations__card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="noovi-integrations__icon">
                <Icons.Globe size={24} />
              </div>
              <div className="noovi-integrations__name">{integration.name}</div>
              <div className="noovi-integrations__category">{integration.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- FAQ SECTION ---
const FAQSection = () => {
  const [ref, isInView] = useInView();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Kann ich noovi 30 Tage kostenlos testen?',
      answer: 'Ja, du kannst noovi 30 Tage lang kostenlos und unverbindlich testen. Es wird keine Kreditkarte benoetigt. Nach Ablauf der Testphase kannst du dich fuer einen passenden Plan entscheiden.',
    },
    {
      question: 'Wo werden meine Daten gespeichert?',
      answer: 'Alle Daten werden ausschliesslich auf Schweizer Servern gespeichert. Wir sind DSGVO-konform und verwenden SSL-Verschluesselung fuer alle Datenuebertragungen.',
    },
    {
      question: 'Funktioniert noovi auch offline?',
      answer: 'Ja, die noovi App funktioniert auch ohne Internetverbindung. Alle Daten werden lokal gespeichert und automatisch synchronisiert, sobald wieder eine Verbindung besteht.',
    },
    {
      question: 'Wie lange dauert die Einrichtung?',
      answer: 'Die Einrichtung dauert in der Regel weniger als 15 Minuten. Unser Onboarding-Team unterstuetzt dich bei jedem Schritt und sorgt dafuer, dass du schnell loslegen kannst.',
    },
    {
      question: 'Kann ich von einer anderen Software wechseln?',
      answer: 'Ja, wir unterstuetzen den Import von Daten aus den gaengigsten Handwerker-Softwares. Unser Support-Team hilft dir beim Umstieg und sorgt fuer eine reibungslose Migration.',
    },
    {
      question: 'Gibt es einen Mengenrabatt fuer groessere Teams?',
      answer: 'Ja, fuer Teams ab 20 Personen bieten wir individuelle Konditionen an. Kontaktiere unser Vertriebsteam fuer ein massgeschneidertes Angebot.',
    },
  ];

  return (
    <section id="faq" className="noovi-faq" ref={ref}>
      <div className="noovi-container">
        <div className={`noovi-section-header ${isInView ? 'noovi-animate-in' : ''}`}>
          <span className="noovi-section-badge">FAQ</span>
          <h2 className="noovi-section-title">
            Haeufig gestellte<br />
            <span className="noovi-text-gradient">Fragen.</span>
          </h2>
        </div>

        <div className={`noovi-faq__list ${isInView ? 'noovi-animate-in' : ''}`}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`noovi-faq__item ${openIndex === i ? 'noovi-faq__item--open' : ''}`}
            >
              <button
                className="noovi-faq__question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.question}</span>
                <Icons.ChevronDown size={20} />
              </button>
              {openIndex === i && (
                <div className="noovi-faq__answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- CTA SECTION ---
const CTASection = () => {
  const [ref, isInView] = useInView();

  return (
    <section id="trial" className="noovi-cta" ref={ref}>
      <div className="noovi-cta__bg">
        <div className="noovi-cta__gradient-1" />
        <div className="noovi-cta__gradient-2" />
      </div>
      <div className="noovi-container">
        <div className={`noovi-cta__content ${isInView ? 'noovi-animate-in' : ''}`}>
          <h2 className="noovi-cta__title">
            Bereit, deinen Betrieb zu digitalisieren?
          </h2>
          <p className="noovi-cta__subtitle">
            Starte jetzt mit noovi und spare bis zu 10 Stunden pro Woche
            an administrativer Arbeit.
          </p>
          <div className="noovi-cta__buttons">
            <a href="#trial" className="noovi-btn noovi-btn--white noovi-btn--lg">
              30 Tage kostenlos testen
              <Icons.ArrowRight size={18} />
            </a>
            <a href="#demo" className="noovi-btn noovi-btn--ghost-white noovi-btn--lg">
              Demo vereinbaren
            </a>
          </div>
          <div className="noovi-cta__note">
            Keine Kreditkarte erforderlich &middot; Kostenloser Support &middot; Jederzeit kuendbar
          </div>
        </div>
      </div>
    </section>
  );
};


// --- FOOTER ---
const Footer = () => (
  <footer className="noovi-footer">
    <div className="noovi-container">
      <div className="noovi-footer__grid">
        <div className="noovi-footer__brand">
          <div className="noovi-nav__logo">
            <div className="noovi-nav__logo-icon">n</div>
            <span className="noovi-nav__logo-text">noovi</span>
          </div>
          <p className="noovi-footer__brand-desc">
            Die All-in-One Software fuer Schweizer Handwerksbetriebe.
            Von Handwerkern fuer Handwerker.
          </p>
          <div className="noovi-footer__social">
            <a href="https://linkedin.com" className="noovi-footer__social-link" aria-label="LinkedIn">in</a>
            <a href="https://instagram.com" className="noovi-footer__social-link" aria-label="Instagram">ig</a>
            <a href="https://youtube.com" className="noovi-footer__social-link" aria-label="YouTube">yt</a>
          </div>
        </div>

        <div className="noovi-footer__links">
          <h4>Produkt</h4>
          <a href="#funktionen">Funktionen</a>
          <a href="#branchen">Branchen</a>
          <a href="#preise">Preise</a>
          <a href="#integrations">Integrationen</a>
        </div>

        <div className="noovi-footer__links">
          <h4>Unternehmen</h4>
          <a href="#about">Ueber uns</a>
          <a href="#careers">Karriere</a>
          <a href="#blog">Blog</a>
          <a href="#press">Presse</a>
        </div>

        <div className="noovi-footer__links">
          <h4>Support</h4>
          <a href="#help">Hilfe-Center</a>
          <a href="#contact">Kontakt</a>
          <a href="#status">System-Status</a>
          <a href="#api">API Docs</a>
        </div>

        <div className="noovi-footer__contact">
          <h4>Kontakt</h4>
          <div className="noovi-footer__contact-item">
            <Icons.Phone size={16} />
            <span>+41 41 244 11 22</span>
          </div>
          <div className="noovi-footer__contact-item">
            <Icons.Mail size={16} />
            <span>info@noovi.ch</span>
          </div>
          <div className="noovi-footer__contact-item">
            <Icons.MapPin size={16} />
            <span>Schweiz</span>
          </div>
          <div className="noovi-footer__hours">
            Mo-Do: 08:00-16:30<br />
            Fr: 08:00-14:00
          </div>
        </div>
      </div>

      <div className="noovi-footer__bottom">
        <p>&copy; {new Date().getFullYear()} noovi. Alle Rechte vorbehalten.</p>
        <div className="noovi-footer__legal">
          <a href="#privacy">Datenschutz</a>
          <a href="#terms">AGB</a>
          <a href="#imprint">Impressum</a>
        </div>
      </div>
    </div>
  </footer>
);


// ============================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================
const NooviLandingPage = () => {
  useEffect(() => {
    document.title = 'noovi - Die Software fuer Schweizer Handwerker';
  }, []);

  return (
    <div className="noovi-page">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <PillarsSection />
      <FeaturesSection />
      <IndustriesSection />
      <ProductDemoSection />
      <TestimonialsSection />
      <PricingSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default NooviLandingPage;
