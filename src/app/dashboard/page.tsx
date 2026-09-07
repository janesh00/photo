import Link from 'next/link';
import { CalendarDays, Image as ImageIcon, Layers3, LogOut, Plus, Users } from 'lucide-react';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/auth/admin');
  const currentUser = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (!currentUser) redirect('/auth/login');
  const events = await db.event.findMany({
    where: currentUser.role === 'ADMIN' ? { createdById: session.userId } : { members: { some: { userId: session.userId } } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { photos: true, galleries: true, members: true } } },
  });
  const totalPhotos = events.reduce((total, event) => total + event._count.photos, 0);
  const publishedGalleries = events.reduce((total, event) => total + event._count.galleries, 0);
  const totalMembers = events.reduce((total, event) => total + event._count.members, 0);

  return (
    <main className="workspace-shell">
      <header className="workspace-nav">
        <Link href="/" className="brand"><span className="brand-mark">P</span><span>PhotoShare</span></Link>
        <div className="workspace-nav-right"><span className="workspace-context">Studio workspace</span><form action="/api/auth/logout" method="POST"><button type="submit" className="workspace-logout" aria-label="Sign out"><LogOut size={16} /></button></form></div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar"><p className="sidebar-label">Workspace</p><nav><a className="active" href="#overview">Overview</a><a href="#events">Events</a><a href="#photos">Photos</a><a href="#galleries">Galleries</a><a href="#team">Team</a></nav><div className="sidebar-note"><span>PhotoShare</span><p>Make room for the<br /><em>good part.</em></p></div></aside>
        <section className="workspace-main" id="overview">
          <div className="workspace-header"><div><p className="eyebrow">Monday, September 07</p><h1>Good morning,<br /><em>{currentUser.role === 'ADMIN' ? 'let&apos;s make something.' : 'welcome to your studio.'}</em></h1></div>{currentUser.role === 'ADMIN' && <Link href="/dashboard/events/new" className="button button-accent"><Plus size={17} /> New event</Link>}</div>
          <div className="metric-row"><div><span>Active events</span><strong>{events.length}</strong><small>In your workspace</small></div><div><span>Photographs</span><strong>{totalPhotos}</strong><small>Across every event</small></div><div><span>Team members</span><strong>{totalMembers}</strong><small>Contributors invited</small></div><div><span>Galleries</span><strong>{publishedGalleries}</strong><small>Created to date</small></div></div>
          <div className="section-intro" id="events"><div><p className="eyebrow">Your workspace</p><h2>Recent events</h2></div><span>{events.length} total</span></div>
          {events.length === 0 ? <div className="workspace-empty"><CalendarDays size={28} /><h3>{currentUser.role === 'ADMIN' ? 'No events yet.' : 'No assigned events yet.'}</h3><p>{currentUser.role === 'ADMIN' ? 'Create your first event to start collecting photographs.' : 'Your event assignments will appear here.'}</p>{currentUser.role === 'ADMIN' && <Link href="/dashboard/events/new" className="arrow-link">Create an event <Plus size={16} /></Link>}</div> : <div className="event-list">{events.map((event) => <article className="event-row" key={event.id}><div className="event-date"><span>{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span><strong>{new Date(event.eventDate).getDate()}</strong><small>{new Date(event.eventDate).getFullYear()}</small></div><div className="event-title"><h3>{event.name}</h3><p>{event.description || 'A new story waiting to be shaped.'}</p></div><div className="event-stats"><span><ImageIcon size={15} /> {event._count.photos}</span><span><Users size={15} /> {event._count.members}</span><span><Layers3 size={15} /> {event._count.galleries}</span></div><Link href={`/dashboard/events/${event.id}`} className="event-open" aria-label={`Open ${event.name}`}>↗</Link></article>)}</div>}
          <div className="workspace-bottom"><div id="photos"><p className="eyebrow">Your process</p><h2>Every frame has<br /><em>a place to go.</em></h2></div><div id="galleries" className="process-note"><span>01</span><p>Collect from your team.<br /><strong>Curate with intention.</strong></p></div><div id="team" className="process-note"><span>02</span><p>Publish when it feels right.<br /><strong>Deliver something lasting.</strong></p></div></div>
        </section>
      </div>
    </main>
  );
}