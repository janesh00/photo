'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Copy, ImagePlus, Upload, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type Photo = { id: string; originalFilename: string; mimeType: string; fileSize: number };
type EventData = { id: string; name: string; description: string | null; eventDate: string };

export default function EventWorkspacePage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState('');
  const [gallery, setGallery] = useState<{ id: string; slug: string; pin: string; published: boolean } | null>(null);

  async function load() {
    const [eventResponse, photosResponse] = await Promise.all([fetch(`/api/events/${eventId}`), fetch(`/api/events/${eventId}/photos`)]);
    if (!eventResponse.ok) { router.replace('/dashboard'); return; }
    setEvent((await eventResponse.json()).event);
    setPhotos((await photosResponse.json()).photos);
  }
  useEffect(() => { void load(); }, [eventId]);

  async function upload() {
    if (!files?.length) return;
    setStatus('Uploading photographs...');
    try {
      const body = new FormData();
      Array.from(files).forEach((file) => body.append('files', file));
      const response = await fetch(`/api/events/${eventId}/photos`, { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) { setStatus(data.error || 'Upload failed.'); return; }
      setFiles(null); setStatus(`${data.photos.length} photograph${data.photos.length === 1 ? '' : 's'} uploaded.`); await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    }
  }
  async function createGallery() {
    if (!selected.length) return;
    setStatus('Creating private gallery...');
    const response = await fetch(`/api/events/${eventId}/galleries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photoIds: selected }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || 'Unable to create gallery.'); return; }
    setGallery({ id: data.gallery.id, slug: data.gallery.slug, pin: data.pin, published: false }); setStatus('Gallery created. Save the PIN, then publish it.');
  }
  async function publishGallery() {
    if (!gallery) return;
    const response = await fetch(`/api/galleries/${gallery.id}/publish`, { method: 'POST' });
    if (!response.ok) { setStatus('Unable to publish gallery.'); return; }
    setGallery({ ...gallery, published: true }); setStatus('Gallery published. Share the link and PIN.');
  }
  const shareUrl = gallery ? `${window.location.origin}/gallery/${gallery.slug}` : '';

  if (!event) return <main className="workspace-shell"><div className="workspace-main"><p className="eyebrow">Loading workspace</p></div></main>;
  return <main className="workspace-shell"><header className="workspace-nav"><Link href="/dashboard" className="brand"><span className="brand-mark">P</span><span>PhotoShare</span></Link><Link href="/dashboard" className="workspace-context"><ArrowLeft size={14} /> Back to workspace</Link></header><section className="event-workspace"><div className="event-workspace-top"><div><p className="eyebrow">Event workspace</p><h1>{event.name}</h1><p>{event.description || 'Collect, curate, and deliver the story.'}</p></div><span className="event-workspace-date">{new Date(event.eventDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</span></div><div className="event-workspace-grid"><section className="workspace-tool"><div className="tool-heading"><ImagePlus size={18} /><div><h2>Upload to this event</h2><p>Every photograph added here is stored inside {event.name}.</p></div></div><label className="upload-dropzone" htmlFor="event-photo-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFiles(e.dataTransfer.files); }}><Upload size={24} /><strong>Drop photographs here</strong><span>or choose files from your device</span><small>JPG, PNG, WEBP · up to 20MB each</small></label><input id="event-photo-upload" className="upload-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(e.target.files)} />{files?.length ? <p className="file-summary">{files.length} file{files.length === 1 ? '' : 's'} ready to upload</p> : null}<button className="auth-submit" onClick={upload} disabled={!files?.length}><Upload size={17} /> Upload to event</button>{status && <p className="workflow-status" role="status">{status}</p>}</section><section className="workspace-tool"><div className="tool-heading"><WandSparkles size={18} /><div><h2>Curate and share</h2><p>Select the photographs your client should see.</p></div></div><div className="photo-select-grid">{photos.map((photo) => <label key={photo.id} className={`photo-select ${selected.includes(photo.id) ? 'is-selected' : ''}`}><input type="checkbox" checked={selected.includes(photo.id)} onChange={() => setSelected((current) => current.includes(photo.id) ? current.filter((id) => id !== photo.id) : [...current, photo.id])} /><img src={`/api/photos/${photo.id}/file`} alt={photo.originalFilename} /></label>)}</div>{!photos.length && <div className="tool-empty">Uploaded photographs will appear here.</div>}<p className="selected-count">{selected.length} selected of {photos.length}</p><button className="auth-submit" onClick={createGallery} disabled={!selected.length}><WandSparkles size={17} /> Create private gallery</button>{gallery && <div className="share-result"><p><Check size={15} /> Gallery {gallery.published ? 'published' : 'ready to publish'}</p><strong>{gallery.pin}</strong><span>PIN</span><code>{shareUrl}</code><div><button onClick={publishGallery} disabled={gallery.published}>{gallery.published ? 'Published' : 'Publish gallery'}</button><button onClick={() => void navigator.clipboard?.writeText(shareUrl)} aria-label="Copy gallery link"><Copy size={15} /></button></div></div>}</section></div></section></main>;
}
