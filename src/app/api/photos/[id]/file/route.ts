import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { getCustomerSession } from '@/lib/auth/customer-session';
import { StorageService } from '@/lib/storage/storage.service';

export async function GET(_: Request, context: { params: { id: string } }) {
  const photo = await db.photo.findUnique({ where: { id: context.params.id }, include: { galleryPhotos: { include: { gallery: true } } } });
  if (!photo || photo.status !== 'READY') return new NextResponse('Not found', { status: 404 });
  const userSession = await getSession();
  const customerSession = await getCustomerSession();
  const customerAllowed = customerSession && photo.galleryPhotos.some(({ gallery }) => gallery.id === customerSession.galleryId && gallery.published);
  const adminAllowed = userSession && (await db.event.findFirst({ where: { id: photo.eventId, createdById: userSession.userId } }));
  if (!customerAllowed && !adminAllowed) return new NextResponse('Forbidden', { status: 403 });
  try {
    const body = StorageService.isConfigured()
      ? await StorageService.downloadObject(photo.storageKey.replace(/\\/g, '/'))
      : await readFile(require('path').join(process.cwd(), '.local-storage', photo.storageKey));
    return new NextResponse(body, { headers: { 'Content-Type': photo.mimeType, 'Cache-Control': 'private, max-age=300' } });
  } catch { return new NextResponse('Not found', { status: 404 }); }
}
