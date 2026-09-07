import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getCustomerSession } from '@/lib/auth/customer-session';

export async function GET(_: Request, context: { params: { slug: string } }) {
  const gallery = await db.gallery.findUnique({ where: { slug: context.params.slug }, include: { event: { select: { name: true } }, photos: { orderBy: { sortOrder: 'asc' }, include: { photo: { select: { id: true, originalFilename: true } } } } } });
  if (!gallery || !gallery.published) return NextResponse.json({ error: 'Gallery unavailable.' }, { status: 404 });
  const session = await getCustomerSession();
  if (!session || session.galleryId !== gallery.id) return NextResponse.json({ error: 'Gallery access required.' }, { status: 401 });
  return NextResponse.json({ gallery: { name: gallery.event.name, photos: gallery.photos.map(({ photo }) => ({ id: photo.id, filename: photo.originalFilename, url: `/api/photos/${photo.id}/file` })) } });
}
