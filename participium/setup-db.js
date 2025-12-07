#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const log = (message) => console.log(`\n${message}\n`);
const error = (message) => {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCommand(command, description) {
  try {
    log(description);
    execSync(command, { stdio: 'inherit', shell: true });
  } catch (err) {
    error(`Failed to ${description.toLowerCase()}`);
  }
}

async function checkPostgres(maxAttempts = 30) {
  log('⏳ Waiting for PostgreSQL to be ready...');
  
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      execSync('docker exec participium_db pg_isready -U postgres', { 
        stdio: 'pipe',
        shell: true 
      });
      log('✅ PostgreSQL is ready!');
      return true;
    } catch (err) {
      console.log(`Attempt ${i}/${maxAttempts} - Waiting for PostgreSQL...`);
      await wait(1000);
    }
  }
  
  error('PostgreSQL did not become ready in time');
}

async function main() {
  try {
    log('🔄 Stopping and removing containers and volumes...');
    execSync('docker compose down -v', { stdio: 'inherit', shell: true });

    log('📦 Starting Docker containers...');
    execSync('docker compose up -d', { stdio: 'inherit', shell: true });

    await checkPostgres();

    log('🗃️ Applying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit', shell: true });

    log('📝 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit', shell: true });

    log('👥 Seeding users...');
    execSync('npx ts-node prisma/admin.ts && npx ts-node prisma/citizen.ts && npx ts-node prisma/technical-officer.ts && npx ts-node prisma/public-relations-officer.ts', { stdio: 'inherit', shell: true });

    log('📋 Seeding sample reports...');
    execSync('npx ts-node prisma/reports-seed.ts', { stdio: 'inherit', shell: true });

    log('✅ Database setup complete! Starting dev server...');
    execSync('npm run dev', { stdio: 'inherit', shell: true });
  } catch (err) {
    error('Setup failed');
  }
}

main();
