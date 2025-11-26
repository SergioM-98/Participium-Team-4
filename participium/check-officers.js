const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOfficers() {
  try {
    const officers = await prisma.user.findMany({
      where: { role: 'OFFICER' },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        office: true
      }
    });
    
    console.log('\n=== OFFICERS IN DATABASE ===');
    console.log(`Total Officers: ${officers.length}\n`);
    
    if (officers.length === 0) {
      console.log('❌ No officers found!');
      console.log('You need to create an officer user first.\n');
    } else {
      officers.forEach(officer => {
        console.log(`ID: ${officer.id}`);
        console.log(`Username: ${officer.username}`);
        console.log(`Name: ${officer.firstName} ${officer.lastName}`);
        console.log(`Office: ${officer.office}`);
        console.log('---');
      });
    }
    
    const allReports = await prisma.report.findMany({
      select: {
        id: true,
        title: true,
        officerId: true
      }
    });
    
    const reports = allReports.filter(r => r.officerId !== null);
    
    console.log('\n=== REPORTS ASSIGNED TO OFFICERS ===');
    console.log(`Total Assigned Reports: ${reports.length}\n`);
    
    if (reports.length === 0) {
      console.log('❌ No reports assigned to any officer!');
      console.log('You need to assign reports to officers first.\n');
    } else {
      reports.forEach(report => {
        console.log(`Report ID: ${report.id} - Officer ID: ${report.officerId}`);
        console.log(`Title: ${report.title}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOfficers();
