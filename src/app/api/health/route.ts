import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET() {
  const startTime = Date.now();
  try {
    // Run live test query on Supabase PostgreSQL
    const [{ version }] = await db.$queryRaw<[{ version: string }]>`SELECT version();`;
    
    // Count records across core tables
    const [usersCount, eventsCount, photosCount, galleriesCount] = await Promise.all([
      db.user.count(),
      db.event.count(),
      db.photo.count(),
      db.gallery.count(),
    ]);

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: 'connected',
      database: 'Supabase PostgreSQL',
      projectRef: 'pqqofrarezxprohiezum',
      host: 'db.pqqofrarezxprohiezum.supabase.co:5432',
      latencyMs: latency,
      serverVersion: version.split(' ')[0],
      tables: {
        users: usersCount,
        events: eventsCount,
        photos: photosCount,
        galleries: galleriesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
