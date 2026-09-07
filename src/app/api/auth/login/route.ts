import { NextResponse } from 'next/server';
import { AuthService, LoginSchema } from '@/server/services/auth.service';
import { createSession } from '@/lib/auth/session';

export async function POST(req: Request) {
 try {
 const body = await req.json();
 const validated = LoginSchema.parse(body);
 const user = await AuthService.login(validated);
 if (body.role === 'ADMIN' && user.role !== 'ADMIN') {
 return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
 }
 await createSession(user.id);
 return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
 } catch (error: any) {
 return NextResponse.json({ error: error.message || 'Login failed' }, { status: 400 });
 }
}
