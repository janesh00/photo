import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db/client';

export const SESSION_COOKIE_NAME = 'ph_session';
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
  return token;
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = await db.session.findUnique({
    where: { tokenHash },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.session.delete({ where: { tokenHash } }).catch(() => {});
  }
  cookies().delete(SESSION_COOKIE_NAME);
}
