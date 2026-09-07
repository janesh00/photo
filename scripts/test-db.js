const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timed out after 5 seconds')), 5000)
  );

  try {
    const res = await Promise.race([
      prisma.$queryRaw`SELECT 1 as connected;`,
      timeout
    ]);
    console.log('✅ Connection SUCCESSFUL:', res);
  } catch (err) {
    console.error('❌ Connection FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
