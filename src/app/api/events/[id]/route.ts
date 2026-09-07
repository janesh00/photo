import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const event = await db.event.findUnique({ where: { id: context.params.id }, include: { _count: { select: { photos: true, members: true, galleries: true } } } });
  if (!event || event.createdById !== session.userId) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  return NextResponse.json({ event });
}
