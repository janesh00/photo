import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';

const CreateEventSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().default(''),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid event date.'),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Only admins can create events.' } }, { status: 403 });
    }

    const input = CreateEventSchema.parse(await request.json());
    const event = await db.event.create({
      data: {
        name: input.name,
        description: input.description || null,
        eventDate: new Date(`${input.eventDate}T00:00:00.000Z`),
        createdById: session.userId,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a valid name and event date.' } }, { status: 422 });
    }
    console.error('Event creation failed:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to create event.' } }, { status: 500 });
  }
}
