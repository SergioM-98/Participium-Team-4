// test/setup.ts
import { PrismaClient } from '@prisma/client';


declare global {
  var beforeAll: (fn: () => Promise<void>) => void;
  var afterAll: (fn: () => Promise<void>) => void;
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, 
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