import { NextResponse } from 'next/server';
import { AuthService, RegisterSchema } from '@/server/services/auth.service';
import { createSession } from '@/lib/auth/session';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const validated = RegisterSchema.parse(await req.json());
    const user = await AuthService.register({ ...validated, email: validated.email.toLowerCase() });
    await createSession(user.id);
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Enter a valid name, email, and password of at least 8 characters.' }, { status: 422 });
    if (error instanceof Error && error.message === 'User already exists') return NextResponse.json({ error: 'An account with this email already exists. Sign in instead.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create your account right now.' }, { status: 500 });
  }
}
