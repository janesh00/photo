'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, FileText } from 'lucide-react';
import { useState } from 'react';

export default function NewEventPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, eventDate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || data.error || 'Unable to create event.');
      router.push('/dashboard');
      router.refresh();
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-shell">
      <header className="workspace-nav">
        <Link href="/" className="brand"><span className="brand-mark">P</span><span>PhotoShare</span></Link>
        <Link href="/dashboard" className="workspace-context"><ArrowLeft size={14} /> Back to workspace</Link>
      </header>
      <section className="event-create-layout">
        <div className="event-create-intro"><p className="eyebrow">A new beginning</p><h1>Give this story<br /><em>a place to land.</em></h1><p>Start an event workspace for your team. You can invite contributors and begin collecting photographs once it is created.</p></div>
        <form className="event-create-form" onSubmit={handleSubmit}>
          <div className="event-form-heading"><span>01</span><h2>Event details</h2></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <label htmlFor="event-name">Event name</label>
          <div className="auth-input-wrap"><FileText size={17} /><input id="event-name" type="text" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Arjun & Priya Wedding" /></div>
          <label htmlFor="event-date">Event date</label>
          <div className="auth-input-wrap"><CalendarDays size={17} /><input id="event-date" type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></div>
          <label htmlFor="event-description">Description <span>Optional</span></label>
          <textarea id="event-description" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short note about this event" />
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating event...' : 'Create event'} <ArrowRight size={17} /></button>
        </form>
      </section>
    </main>
  );
}
