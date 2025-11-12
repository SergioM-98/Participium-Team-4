// test/setup.ts
import { PrismaClient } from '@prisma/client';

// Determina l'URL del database basato sull'ambiente
let testDatabaseUrl: string;

if (process.env.CI) {
  // Ambiente CI - usa il service container PostgreSQL
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/test_db?schema=public';
} else {
  // Ambiente locale - usa il container Docker locale
  testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/participium_test_db?schema=public';
}

console.log('Test database URL:', testDatabaseUrl.replace(/password=[^@]*@/, 'password=***@'));

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
      
      // Pulisci i dati solo se le migrazioni sono riuscite (tabelle esistono)
      try {
        await prisma.report.deleteMany();
        await prisma.photo.deleteMany();
        await prisma.user.deleteMany();
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }
    } catch (migrationError) {
      console.warn('Migration error:', migrationError);
      // Continua comunque, le tabelle potrebbero già esistere
    }
    
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