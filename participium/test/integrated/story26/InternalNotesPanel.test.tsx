import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { TestUser } from '@/app/lib/dtos/user.dto';
import { TestReport } from '@/app/lib/dtos/report.dto';

// Import prisma from setup or create a new instance for testing
let prisma: PrismaClient;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

import InternalNotesPanel from '@/components/InternalNotesPanel';

describe('InternalNotesPanel - Integration Tests (Real Database)', () => {
  let testTechnicalOfficer: TestUser;
  let testReport: TestReport;

  beforeAll(async () => {
    const setupModule = await import('../../setup');
    prisma = setupModule.prisma;
  });

  afterEach(async () => {
    await prisma.comment.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});
  });

  beforeEach(async () => {
    const createdOfficer = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        username: 'johndoe',
        role: 'TECHNICAL_OFFICER',
        passwordHash: 'hashedpassword',
        office: 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES',
      },
    });
    testTechnicalOfficer = createdOfficer as TestUser;

    const testCitizen = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        username: 'janesmith',
        role: 'CITIZEN',
        passwordHash: 'hashedpassword',
      },
    });

    const createdReport = await prisma.report.create({
      data: {
        title: 'Test Report',
        description: 'A test report for internal notes',
        citizenId: testCitizen.id,
        longitude: 15.087269,
        latitude: 37.502669,
        status: 'ASSIGNED',
      },
    });
    testReport = createdReport as TestReport;

    await prisma.comment.create({
      data: {
        content: 'First note',
        authorId: testTechnicalOfficer.id,
        reportId: testReport.id,
      },
    });

    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: testTechnicalOfficer.id,
        email: testTechnicalOfficer.email,
        role: 'TECHNICAL_OFFICER',
      },
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user flow: load, view, and add note', async () => {
      render(<InternalNotesPanel reportId={testReport.id.toString()} />);

      // Load phase 
      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // View phase
      const noteContent = screen.getByText('First note');
      expect(noteContent).toBeVisible();

      // Add note phase
      const textarea = screen.getByPlaceholderText(/Write a note/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'User added note');
      await userEvent.click(submitButton);

      // Verify new note appears in the database and UI
      await waitFor(() => {
        expect(screen.getByText('User added note')).toBeInTheDocument();
      });

      const comments = await prisma.comment.findMany({
        where: { reportId: testReport.id },
      });
      expect(comments).toHaveLength(2);
      expect(comments[1].content).toBe('User added note');
    });

    it('should handle switching between multiple reports', async () => {
      const citizen2 = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'bob@test.com',
          username: 'bobjones',
          role: 'CITIZEN',
          passwordHash: 'hashedpassword',
        },
      });

      const report2 = await prisma.report.create({
        data: {
          title: 'Test Report 2',
          description: 'Another test report',
          citizenId: citizen2.id,
          longitude: 15.087269,
          latitude: 37.502669,
          status: 'ASSIGNED',
        },
      });

      await prisma.comment.create({
        data: {
          content: 'Report 2 note',
          authorId: testTechnicalOfficer.id,
          reportId: report2.id,
        },
      });

      // Render with first report
      const { rerender } = render(<InternalNotesPanel reportId={testReport.id.toString()} />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      // Switch to second report
      rerender(<InternalNotesPanel reportId={report2.id.toString()} />);

      await waitFor(() => {
        expect(screen.getByText('Report 2 note')).toBeInTheDocument();
      });

      // Verify first report's note is no longer visible
      expect(screen.queryByText('First note')).not.toBeInTheDocument();
    });

    it('should display empty state when no notes exist', async () => {
      // Create a report with no comments
      const citizen = await prisma.user.create({
        data: {
          firstName: 'Empty',
          lastName: 'Report',
          email: 'empty@test.com',
          username: 'emptyreport',
          role: 'CITIZEN',
          passwordHash: 'hashedpassword',
        },
      });

      const emptyReport = await prisma.report.create({
        data: {
          title: 'Empty Report',
          description: 'Report with no notes',
          citizenId: citizen.id,
          longitude: 15.087269,
          latitude: 37.502669,
          status: 'ASSIGNED',
        },
      });

      render(<InternalNotesPanel reportId={emptyReport.id.toString()} />);

      await waitFor(() => {
        expect(screen.getByText(/No internal notes yet/i)).toBeInTheDocument();
      });
    });

    it('should persist multiple notes to the database', async () => {
      render(<InternalNotesPanel reportId={testReport.id.toString()} />);

      // Wait for initial note to load
      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      // Add first new note
      const textarea = screen.getByPlaceholderText(/Write a note/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Second note');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Second note')).toBeInTheDocument();
      });

      // Add second new note
      await userEvent.type(textarea, 'Third note');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Third note')).toBeInTheDocument();
      });

      // Verify all notes are in the database
      const comments = await prisma.comment.findMany({
        where: { reportId: testReport.id },
        orderBy: { createdAt: 'asc' },
      });

      expect(comments).toHaveLength(3);
      expect(comments[0].content).toBe('First note');
      expect(comments[1].content).toBe('Second note');
      expect(comments[2].content).toBe('Third note');
    });
  });
});
