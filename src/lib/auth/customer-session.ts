import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db/client';

export const CUSTOMER_SESSION_COOKIE_NAME = 'ph_cust_session';
export const CUSTOMER_SESSION_DURATION = 2 * 60 * 60 * 1000; // 2h

export async function createCustomerSession(galleryId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DURATION);

  await db.customerGallerySession.create({
    data: { galleryId, sessionTokenHash: tokenHash, expiresAt },
  });

  cookies().set(CUSTOMER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
  return token;
}

export async function getCustomerSession() {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = await db.customerGallerySession.findUnique({
    where: { sessionTokenHash: tokenHash },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function destroyCustomerSession() {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.customerGallerySession.delete({ where: { sessionTokenHash: tokenHash } }).catch(() => {});
  }
  cookies().delete(CUSTOMER_SESSION_COOKIE_NAME);
}
