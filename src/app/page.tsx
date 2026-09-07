import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Image as ImageIcon,
  LockKeyhole,
  Menu,
  MoveRight,
  Play,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85', alt: 'Couple walking through a sunlit wedding venue', className: 'hero-image hero-image-tall' },
  { src: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=85', alt: 'Wedding table set for an evening celebration', className: 'hero-image hero-image-small' },
  { src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=85', alt: 'Bride and groom embracing outdoors', className: 'hero-image hero-image-mid' },
];

const steps = [
  { number: '01', title: 'Collect', copy: 'Give your whole team one beautiful place to upload every frame.' },
  { number: '02', title: 'Curate', copy: 'Review, select, and shape the story before it reaches your client.' },
  { number: '03', title: 'Deliver', copy: 'Publish a private, PIN-protected gallery with one elegant link.' },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <nav className="site-nav page-width" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="PhotoShare home"><span className="brand-mark">P</span><span>PhotoShare</span></Link>
        <div className="nav-links"><a href="#workflow">How it works</a><a href="#security">Security</a><a href="#stories">For teams</a></div>
        <div className="nav-actions"><Link href="/auth/login" className="text-link">Sign in</Link><Link href="/auth/register" className="button button-dark button-compact">Start free <ArrowUpRight size={15} /></Link></div>
        <button className="mobile-menu" aria-label="Open navigation"><Menu size={21} /></button>
      </nav>

      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> The calm after the shoot</p>
          <h1>From thousands of moments to the photographs <em>worth sharing.</em></h1>
          <p className="hero-intro">PhotoShare gives creative teams a considered way to collect, curate, and deliver the work their clients will keep forever.</p>
          <div className="hero-actions"><Link href="/auth/register" className="button button-accent">Create an event <MoveRight size={18} /></Link><a href="#workflow" className="play-link"><span className="play-icon"><Play size={13} fill="currentColor" /></span> See how it works</a></div>
          <div className="trust-line"><span className="avatar-stack"><i /><i /><i /></span><span>Trusted by thoughtful teams<br /><strong>who care about the details.</strong></span></div>
        </div>
        <div className="hero-visual" aria-label="Editorial wedding photography collage">
          <div className="visual-note">ARJUN <span>&amp;</span> PRIYA <small>WEDDING / 24</small></div>
          {galleryImages.map((image) => <div key={image.src} className={image.className} style={{ backgroundImage: `url(${image.src})` }} role="img" aria-label={image.alt} />)}
          <div className="visual-stamp"><span>Private</span><strong>Gallery</strong><small>est. 2024</small></div>
        </div>
      </section>

      <section className="proof-strip page-width" aria-label="Product highlights">
        <p>Made for the work<br /><em>behind the work.</em></p>
        <div><Users size={20} /><span>One workspace<br /><strong>for every contributor.</strong></span></div>
        <div><ImageIcon size={20} /><span>Proofing that feels<br /><strong>as good as the final cut.</strong></span></div>
        <div><LockKeyhole size={20} /><span>Private by design<br /><strong>from upload to delivery.</strong></span></div>
      </section>

      <section className="workflow page-width" id="workflow"><div className="section-heading"><p className="eyebrow">A better handoff</p><h2>Less logistics.<br /><em>More looking.</em></h2><p>Bring the whole journey into focus, from the first upload to the final reveal.</p></div><div className="step-grid">{steps.map((step) => <article className="step" key={step.number}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p><span className="step-line" /></article>)}</div></section>

      <section className="feature-band page-width" id="stories"><div className="feature-photo" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85)' }} role="img" aria-label="Photographer reviewing a wedding gallery" /><div className="feature-copy"><p className="eyebrow">The proofing room</p><h2>Your best work deserves a <em>better review.</em></h2><p>See every upload in one visual workspace. Filter by photographer, mark the keepers, and make decisions without losing the feeling of the day.</p><ul><li><Check size={16} /> Fast, focused photo review</li><li><Check size={16} /> Team uploads without the chaos</li><li><Check size={16} /> High-resolution delivery, beautifully private</li></ul><Link href="/auth/register" className="arrow-link">Build your first event <ArrowUpRight size={17} /></Link></div></section>

      <section className="security-section page-width" id="security"><div><p className="eyebrow">Quietly secure</p><h2>The link is simple.<br /><em>The protection is serious.</em></h2></div><div className="security-detail"><LockKeyhole size={28} /><p>Every gallery is private, PIN-protected, and served through short-lived access. Your clients see the photographs. Nothing else.</p><span>Designed for client trust <Plus size={15} /></span></div></section>

      <section className="cta-band page-width"><div><p className="eyebrow">Your next story starts here</p><h2>Make room for the<br /><em>good part.</em></h2></div><Link href="/auth/register" className="button button-light">Create an event <MoveRight size={18} /></Link></section>

      <footer className="site-footer page-width"><Link href="/" className="brand"><span className="brand-mark">P</span><span>PhotoShare</span></Link><span>© 2026 PhotoShare</span><div><Link href="/auth/login">Sign in</Link><Link href="/auth/register">Create account</Link></div></footer>
    </main>
  );
}