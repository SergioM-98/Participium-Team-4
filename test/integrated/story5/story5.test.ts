import { prisma } from "../../setup";
import { getServerSession } from 'next-auth/next';
import { ReportRegistrationResponse } from "@/app/lib/dtos/report.dto";
import { createReport } from "@/app/lib/actions/report";
import { createUploadPhoto } from "@/app/lib/actions/uploader";
import { ControllerSuccessResponse } from "@/app/lib/dtos/tus.dto";

// Mock NextAuth to control sessions
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));


describe('Story 5 - Integration Test: uploader', () => {
    
    beforeEach(async () => {
        // Clean database before each test
        await prisma.report.deleteMany({});
        await prisma.photo.deleteMany({});
        await prisma.user.deleteMany({});

        await prisma.photo.create({
            data: {
                id: "photo1",
                url: "photo1",
                size:100,
                offset:0,
                filename:"photo1"
            }
        })
        await prisma.user.create({
            data: {
                id: 1,
                username: "user1",
                passwordHash: "password",
                firstName: "user",
                lastName: "user",
                role: "CITIZEN",
            },
        });

        await prisma.user.create({
            data: {
                id: 2,
                username: "user2",
                passwordHash: "password",
                firstName: "user",
                lastName: "user",
                role: "CITIZEN",
            },
        });

    });

    describe('uploader Flow', () => {
        it('should upload a new photo through the complete flow', async () => {
            // Simulate logged CITIZEN user
            (getServerSession as jest.Mock).mockResolvedValue({
                user:{
                    firstName: "mock",
                    lastName: "mock",
                    email: "mock@mock.it",
                    username: "mock",
                    role: "CITIZEN"
                },
                expires: "2099-01-01T00:00:00.000Z",
            });


            // Execute upload (complete flow)

            const data = new FormData();
            data.append('tus-resumable', '1.0.0');
            data.append('upload-length', '100');
            data.append('file', new File(['a'.repeat(100)], 'photo.jpg', { type: 'image/jpeg' }));

            const response: ControllerSuccessResponse = await createUploadPhoto(data);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.location).toBeDefined();
            expect(response.uploadOffset).toBe(100);
        });
    });





    it('should not upload a new photo through the complete flow with a missing field', async () => {
            // Simulate logged CITIZEN user
            (getServerSession as jest.Mock).mockResolvedValue({
                user:{
                    firstName: "mock",
                    lastName: "mock",
                    email: "mock@mock.it",
                    username: "mock",
                    role: "CITIZEN"
                },
                expires: "2099-01-01T00:00:00.000Z",
            });


            // Execute upload (complete flow)

            const data = new FormData();
            data.append('upload-length', '100');
            data.append('file', new File(['a'.repeat(100)], 'photo.jpg', { type: 'image/jpeg' }));

            const response: ControllerSuccessResponse = await createUploadPhoto(data);

            // Verify response
            expect(response.success).toBe(false);
            expect(response.location).not.toBeDefined();
            expect(response.uploadOffset).not.toBeDefined();
        });
    });






});