const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('🔍 Querying live Supabase database tables...');
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const photoCount = await prisma.photo.count();
    const galleryCount = await prisma.gallery.count();

    console.log('------------------------------------');
    console.log('✅ LIVE DATABASE TEST SUCCESSFUL!');
    console.log('------------------------------------');
    console.log(`Users:     ${userCount}`);
    console.log(`Events:    ${eventCount}`);
    console.log(`Photos:    ${photoCount}`);
    console.log(`Galleries: ${galleryCount}`);
    console.log('------------------------------------');
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
