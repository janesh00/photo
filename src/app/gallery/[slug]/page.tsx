'use client';

import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Gallery = { name: string; photos: { id: string; filename: string; url: string }[] };

export default function PublicGalleryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pin, setPin] = useState('');
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [requiresPin, setRequiresPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/public/galleries/${slug}`).then(async (response) => { if (response.ok) setGallery((await response.json()).gallery); else if (response.status === 401) setRequiresPin(true); setLoading(false); }); }, [slug]);
  async function verify(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const response = await fetch(`/api/public/galleries/${slug}/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
    if (!response.ok) { setError((await response.json()).error || 'Invalid gallery PIN.'); return; }
    const galleryResponse = await fetch(`/api/public/galleries/${slug}`); setGallery((await galleryResponse.json()).gallery); setRequiresPin(false);
  }

  if (loading) return <main className="public-gallery"><p className="eyebrow">Loading gallery</p></main>;
  if (requiresPin) return <main className="public-gallery public-gallery-gate"><p className="eyebrow">Private gallery</p><h1>Enter the<br /><em>secret.</em></h1><p className="gallery-gate-copy">This gallery was made for a private viewing.</p><PinGate onSubmit={verify} pin={pin} setPin={setPin} error={error} /></main>;
  if (!gallery) return <main className="public-gallery public-gallery-gate"><p className="eyebrow">Private gallery</p><h1>This gallery is<br /><em>not available.</em></h1><Link href="/" className="arrow-link">Back to PhotoShare <ArrowRight size={16} /></Link></main>;
  if (!gallery.photos.length) return null;
  return <main className="public-gallery">{gallery.photos.length && <><header className="public-gallery-header"><Link href="/" className="brand"><span className="brand-mark">P</span><span>PhotoShare</span></Link><span>Private gallery</span></header><section className="public-gallery-title"><p className="eyebrow">Private gallery</p><h1>{gallery.name}</h1><p>{gallery.photos.length} photographs, selected for you.</p></section><section className="public-photo-grid">{gallery.photos.map((photo) => <figure key={photo.id}><img src={photo.url} alt={photo.filename} /></figure>)}</section></>}{!gallery.photos.length && <p>No photographs available.</p>}</main>;
}

function PinGate({ onSubmit, pin, setPin, error }: { onSubmit: (event: React.FormEvent) => void; pin: string; setPin: (value: string) => void; error: string }) {
  return <form className="gallery-pin-form" onSubmit={onSubmit}><div className="pin-icon"><LockKeyhole size={21} /></div><label htmlFor="gallery-pin">Enter your access PIN</label><input id="gallery-pin" inputMode="numeric" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} placeholder="000000" /><button className="auth-submit" type="submit">View gallery <ArrowRight size={17} /></button>{error && <p className="auth-error">{error}</p>}</form>;
}
