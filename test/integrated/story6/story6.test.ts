import { prisma } from '../../setup';
import bcrypt from 'bcrypt';

// Mock NextAuth to control sessions
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

import { getServerSession } from 'next-auth/next';
import { approveReport, rejectReport } from '@/app/lib/controllers/report.controller';

describe('Story 6 - Integration Test: Officer reviews and approves/rejects reports', () => {
  let testCitizenId: bigint;
  let testOfficerId: bigint;
  let testPhotoId: string;
  let pendingReportId: bigint;

  const officerSession = {
    user: {
      id: '2',
      name: 'Test Officer',
      role: 'OFFICER',
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  const citizenSession = {
    user: {
      id: '1',
      name: 'Test Citizen',
      role: 'CITIZEN',
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  beforeEach(async () => {
    // Clean database before each test
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test citizen
    const hashedPassword = await bcrypt.hash('testpassword', 12);
    const citizen = await prisma.user.create({
      data: {
        username: 'testcitizen_story6',
        firstName: 'Test',
        lastName: 'Citizen',
        passwordHash: hashedPassword,
        role: 'CITIZEN',
      },
    });
    testCitizenId = citizen.id;

    // Create test officer
    const officer = await prisma.user.create({
      data: {
        username: 'testofficer_story6',
        firstName: 'Test',
        lastName: 'Officer',
        passwordHash: hashedPassword,
        role: 'OFFICER',
        office: 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES',
      },
    });
    testOfficerId = officer.id;

    // Create test photo
    const photo = await prisma.photo.create({
      data: {
        url: 'test-image-story6.jpg',
        size: BigInt(1024),
        offset: BigInt(0),
        filename: 'test-image-story6.jpg',
      },
    });
    testPhotoId = photo.id;

    // Create pending report for approval
    const pendingReport = await prisma.report.create({
      data: {
        title: 'Pending Report for Review',
        description: 'This report is waiting for officer review',
        category: 'ROADS_AND_URBAN_FURNISHINGS',
        status: 'PENDING_APPROVAL',
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: testCitizenId,
        photos: {
          connect: [{ id: testPhotoId }],
        },
      },
    });
    pendingReportId = pendingReport.id;
  });

  describe('Report Approval Flow', () => {
    it('should successfully approve a pending report and assign to officer', async () => {
      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      const result = await approveReport(
        Number(pendingReportId),
        'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('Report assigned to officer ID');
      }

      // Verify report was updated in database
      const updatedReport = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });

      expect(updatedReport).not.toBeNull();
      expect(updatedReport!.status).toBe('ASSIGNED');
      expect(updatedReport!.officerId).toBe(testOfficerId);
    });

    it('should reject approval when officer does not exist in department', async () => {
      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      // Try to assign to department with no officers
      const result = await approveReport(
        Number(pendingReportId),
        'DEPARTMENT_OF_COMMERCE'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No officers available in the specified department');
      }

      // Verify report was NOT updated
      const report = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });
      expect(report!.status).toBe('PENDING_APPROVAL');
      expect(report!.officerId).toBeNull();
    });

    it('should assign report to officer with least reports in department', async () => {
      // Create second officer in same department
      const officer2 = await prisma.user.create({
        data: {
          username: 'testofficer2_story6',
          firstName: 'Test',
          lastName: 'Officer2',
          passwordHash: await bcrypt.hash('testpassword', 12),
          role: 'OFFICER',
          office: 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES',
        },
      });

      // Assign an existing report to officer 1
      await prisma.report.create({
        data: {
          title: 'Existing Report',
          description: 'Already assigned',
          category: 'WASTE',
          status: 'ASSIGNED',
          latitude: 45.0700,
          longitude: 7.6800,
          citizenId: testCitizenId,
          officerId: testOfficerId,
          photos: {
            connect: [{ id: testPhotoId }],
          },
        },
      });

      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      // Approve new report - should go to officer2 (has 0 reports)
      const result = await approveReport(
        Number(pendingReportId),
        'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
      );

      expect(result.success).toBe(true);

      // Verify assigned to officer with least reports
      const updatedReport = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });

      expect(updatedReport!.officerId).toBe(officer2.id);

      // Cleanup
      await prisma.user.delete({ where: { id: officer2.id } });
    });

    it('should reject approval when user is not authorized (CITIZEN)', async () => {
      // Simulate citizen user
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const result = await approveReport(
        Number(pendingReportId),
        'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Unauthorized access');
      }

      // Verify report was NOT updated
      const report = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });
      expect(report!.status).toBe('PENDING_APPROVAL');
    });

    it('should reject approval when no session exists', async () => {
      // No session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await approveReport(
        Number(pendingReportId),
        'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Unauthorized access');
      }
    });
  });

  describe('Report Rejection Flow', () => {
    it('should successfully reject a pending report with reason', async () => {
      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      const rejectionReason = 'Report does not contain sufficient information';
      const result = await rejectReport(
        Number(pendingReportId),
        rejectionReason
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('Report rejected with reason');
      }

      // Verify report was updated in database
      const updatedReport = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });

      expect(updatedReport).not.toBeNull();
      expect(updatedReport!.status).toBe('REJECTED');
      expect(updatedReport!.rejectionReason).toBe(rejectionReason);
      expect(updatedReport!.officerId).toBeNull();
    });

    it('should reject report with different rejection reasons', async () => {
      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      const testReasons = [
        'Duplicate report',
        'Invalid location',
        'Not a municipal responsibility',
        'Insufficient photo evidence',
      ];

      for (const reason of testReasons) {
        // Create new pending report for each test
        const report = await prisma.report.create({
          data: {
            title: `Test Report - ${reason}`,
            description: 'Test description',
            category: 'OTHER',
            status: 'PENDING_APPROVAL',
            latitude: 45.0703,
            longitude: 7.6869,
            citizenId: testCitizenId,
            photos: {
              connect: [{ id: testPhotoId }],
            },
          },
        });

        const result = await rejectReport(Number(report.id), reason);

        expect(result.success).toBe(true);

        // Verify in database
        const updatedReport = await prisma.report.findUnique({
          where: { id: report.id },
        });

        expect(updatedReport!.status).toBe('REJECTED');
        expect(updatedReport!.rejectionReason).toBe(reason);

        // Cleanup
        await prisma.report.delete({ where: { id: report.id } });
      }
    });

    it('should reject rejection when user is not authorized (CITIZEN)', async () => {
      // Simulate citizen user
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const result = await rejectReport(
        Number(pendingReportId),
        'Test rejection'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Unauthorized access');
      }

      // Verify report was NOT updated
      const report = await prisma.report.findUnique({
        where: { id: pendingReportId },
      });
      expect(report!.status).toBe('PENDING_APPROVAL');
      expect(report!.rejectionReason).toBeNull();
    });

    it('should reject rejection when no session exists', async () => {
      // No session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await rejectReport(
        Number(pendingReportId),
        'Test rejection'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Unauthorized access');
      }
    });
  });

  describe('Multiple Officers Load Balancing', () => {
    it('should distribute reports evenly among officers in same department', async () => {
      // Create 3 officers in same department
      const officer2 = await prisma.user.create({
        data: {
          username: 'officer2_story6',
          firstName: 'Officer',
          lastName: 'Two',
          passwordHash: await bcrypt.hash('test', 12),
          role: 'OFFICER',
          office: 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES',
        },
      });

      const officer3 = await prisma.user.create({
        data: {
          username: 'officer3_story6',
          firstName: 'Officer',
          lastName: 'Three',
          passwordHash: await bcrypt.hash('test', 12),
          role: 'OFFICER',
          office: 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES',
        },
      });

      // Simulate officer user
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      // Create and approve 3 reports
      const assignedOfficers: bigint[] = [];

      for (let i = 0; i < 3; i++) {
        const report = await prisma.report.create({
          data: {
            title: `Load Balance Test Report ${i + 1}`,
            description: 'Testing load balancing',
            category: 'WASTE',
            status: 'PENDING_APPROVAL',
            latitude: 45.0703,
            longitude: 7.6869,
            citizenId: testCitizenId,
            photos: {
              connect: [{ id: testPhotoId }],
            },
          },
        });

        await approveReport(
          Number(report.id),
          'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
        );

        const updatedReport = await prisma.report.findUnique({
          where: { id: report.id },
        });

        assignedOfficers.push(updatedReport!.officerId!);
      }

      // Verify each officer got exactly 1 report
      const officerCounts = assignedOfficers.reduce((acc, id) => {
        acc[id.toString()] = (acc[id.toString()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.values(officerCounts).forEach((count) => {
        expect(count).toBe(1);
      });

      // Cleanup
      await prisma.user.delete({ where: { id: officer2.id } });
      await prisma.user.delete({ where: { id: officer3.id } });
    });
  });
});
