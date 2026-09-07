import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { StorageService } from '@/lib/storage/storage.service';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxSize = 20 * 1024 * 1024;
const ParamsSchema = z.object({ id: z.string().uuid() });

async function authorize(eventId: string) {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } });
  const event = await db.event.findUnique({ where: { id: eventId }, select: { id: true, createdById: true } });
  if (!user || !event) return { error: NextResponse.json({ error: 'Event not found.' }, { status: 404 }) };
  if (user.role !== 'ADMIN' || event.createdById !== user.id) return { error: NextResponse.json({ error: 'You do not have permission to manage this event.' }, { status: 403 }) };
  return { session, user, event };
}

export async function GET(_: Request, context: { params: { id: string } }) {
  const parsed = ParamsSchema.safeParse(context.params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  const auth = await authorize(parsed.data.id);
  if ('error' in auth) return auth.error;
  const photos = await db.photo.findMany({ where: { eventId: parsed.data.id, status: 'READY' }, orderBy: { createdAt: 'desc' }, select: { id: true, originalFilename: true, mimeType: true, fileSize: true, createdAt: true } });
  return NextResponse.json({ photos });
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const parsed = ParamsSchema.safeParse(context.params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  const auth = await authorize(parsed.data.id);
  if ('error' in auth) return auth.error;
  const formData = await request.formData();
  const files = formData.getAll('files').filter((value): value is File => value instanceof File);
  if (!files.length || files.length > 50) return NextResponse.json({ error: 'Choose between 1 and 50 photographs.' }, { status: 422 });

  const storageRoot = path.join(process.cwd(), '.local-storage', 'events', parsed.data.id);
  await mkdir(storageRoot, { recursive: true });
  const photos = [];
  for (const file of files) {
    if (!allowedTypes.has(file.type) || file.size > maxSize) return NextResponse.json({ error: 'Only JPG, PNG, or WEBP files up to 20MB are allowed.' }, { status: 422 });
    const id = crypto.randomUUID();
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const storageKey = path.join('events', parsed.data.id, `${id}.${extension}`);
    const contents = Buffer.from(await file.arrayBuffer());
    if (StorageService.isConfigured()) await StorageService.uploadObject(storageKey.replace(/\\/g, '/'), contents, file.type);
    else {
      await mkdir(storageRoot, { recursive: true });
      await writeFile(path.join(storageRoot, `${id}.${extension}`), contents);
    }
    photos.push(await db.photo.create({ data: { id, eventId: parsed.data.id, uploadedById: auth.user.id, originalFilename: file.name.replace(/[\\/\0]/g, '_').slice(0, 180), storageKey, mimeType: file.type, fileSize: file.size, status: 'READY' }, select: { id: true, originalFilename: true, mimeType: true, fileSize: true, createdAt: true } }));
  }
  return NextResponse.json({ photos }, { status: 201 });
}
