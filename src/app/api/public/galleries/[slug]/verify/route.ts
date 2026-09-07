import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { createCustomerSession } from '@/lib/auth/customer-session';

const VerifySchema = z.object({ pin: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request, context: { params: { slug: string } }) {
  const gallery = await db.gallery.findUnique({ where: { slug: context.params.slug }, select: { id: true, pinHash: true, published: true } });
  if (!gallery || !gallery.published) return NextResponse.json({ error: 'Gallery unavailable.' }, { status: 404 });
  try {
    const { pin } = VerifySchema.parse(await request.json());
    if (!(await bcrypt.compare(pin, gallery.pinHash))) return NextResponse.json({ error: 'Invalid gallery PIN.' }, { status: 401 });
    await createCustomerSession(gallery.id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid gallery PIN.' }, { status: 401 }); }
}
