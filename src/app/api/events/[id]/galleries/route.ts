import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';

const CreateGallerySchema = z.object({ photoIds: z.array(z.string().uuid()).min(1).max(500) });

export async function POST(request: Request, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const event = await db.event.findUnique({ where: { id: context.params.id }, select: { id: true, createdById: true } });
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (!event || event.createdById !== session.userId || user?.role !== 'ADMIN') return NextResponse.json({ error: 'Only the event admin can create a gallery.' }, { status: 403 });
  try {
    const { photoIds } = CreateGallerySchema.parse(await request.json());
    const photos = await db.photo.findMany({ where: { id: { in: photoIds }, eventId: event.id, status: 'READY' }, select: { id: true } });
    if (photos.length !== photoIds.length) return NextResponse.json({ error: 'Every selected photograph must belong to this event and be ready.' }, { status: 422 });
    const pin = String(crypto.randomInt(100000, 1000000));
    const slug = crypto.randomBytes(9).toString('base64url');
    const gallery = await db.gallery.create({ data: { eventId: event.id, slug, pinHash: await bcrypt.hash(pin, 12), photos: { create: photoIds.map((photoId, index) => ({ photoId, sortOrder: index })) } }, select: { id: true, slug: true } });
    return NextResponse.json({ gallery, pin }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Select at least one photograph.' }, { status: 422 });
    console.error('Gallery creation failed:', error);
    return NextResponse.json({ error: 'Unable to create gallery.' }, { status: 500 });
  }
}
