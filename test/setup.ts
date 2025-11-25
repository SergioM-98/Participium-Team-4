import { PrismaClient } from '@prisma/client';
import path from 'path';

process.env.UPLOADS_DIR = path.join(process.cwd(), 'test_uploads');

// Check if we are running unit tests to skip DB setup
const isUnitTest = process.argv.some(arg => arg.includes('test/unit') || arg.includes('test\\unit'));

let testDatabaseUrl: string;

if (process.env.CI) {
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/test_db?schema=public';
} else {
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/participium_test_db?schema=public';
}

if (!isUnitTest) {
    console.log('Test database URL:', testDatabaseUrl.replace(/password=[^@]*@/, 'password=***@'));
}

const prisma = new PrismaClient({
  datasourceUrl: testDatabaseUrl,
});

beforeAll(async () => {
  // Skip DB setup for unit tests
  if (isUnitTest) {
      return;
  }

  try {

    await prisma.$connect();
    
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
        stdio: 'inherit',
      });
      console.log('Migrations applied successfully');
      
      try {
        if (prisma.notification) await prisma.notification.deleteMany();
        await prisma.photo.deleteMany();
        await prisma.report.deleteMany();
        if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany();
        if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany();
        await prisma.user.deleteMany();
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }
    } catch (migrationError) {
      console.warn('Migration error:', migrationError);
    }
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  // Skip DB cleanup for unit tests
  if (isUnitTest) {
      return;
  }

  try {
    if (prisma.notification) await prisma.notification.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.report.deleteMany();
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany();
    if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany();
    await prisma.user.deleteMany();
    
    await prisma.$disconnect();
    console.log('Test database cleanup completed');
    
    const { rm } = require('fs/promises');
    try {
      await rm(process.env.UPLOADS_DIR!, { recursive: true, force: true });
    } catch (error) {
    }
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

export { prisma };