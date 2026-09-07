import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing Supabase Database Connection...');
  try {
    // Execute simple query to test connection
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log('✅ Connection successful!');
    console.log('PostgreSQL Server Info:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
