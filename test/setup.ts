// test/setup.ts
import { PrismaClient } from '@prisma/client';

// Usa il database di test se non è specificato diversamente
const testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/participium_test_db?schema=public';

const prisma = new PrismaClient({
  datasourceUrl: testDatabaseUrl,
});

beforeAll(async () => {

  try {

    await prisma.$connect();
    

    await prisma.report.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {

  try {

    await prisma.report.deleteMany();
    await prisma.photo.deleteMany(); 
    await prisma.user.deleteMany();
    
    await prisma.$disconnect();
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

export { prisma };