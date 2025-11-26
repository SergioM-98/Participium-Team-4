import path from 'path';

// Set environment variables BEFORE importing anything else
process.env.UPLOADS_DIR = path.join(process.cwd(), 'test_uploads');

let testDatabaseUrl: string;

if (process.env.CI) {
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/test_db?schema=public';
} else {
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/participium_test_db?schema=public';
}

// Set DATABASE_URL BEFORE importing PrismaClient
process.env.DATABASE_URL = testDatabaseUrl;

console.log('Test database URL:', testDatabaseUrl.replace(/password=[^@]*@/, 'password=***@'));

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: testDatabaseUrl,
});

beforeAll(async () => {

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