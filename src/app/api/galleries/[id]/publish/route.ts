import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';

export async function POST(_: Request, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const gallery = await db.gallery.findUnique({ where: { id: context.params.id }, include: { event: true, photos: { include: { photo: true } } } });
  if (!gallery || gallery.event.createdById !== session.userId) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
  if (!gallery.photos.length || gallery.photos.some(({ photo }) => photo.status !== 'READY')) return NextResponse.json({ error: 'Gallery must contain ready photographs.' }, { status: 422 });
  const published = await db.gallery.update({ where: { id: gallery.id }, data: { published: true, publishedAt: new Date() }, select: { id: true, slug: true, published: true, publishedAt: true } });
  return NextResponse.json({ gallery: published });
}
