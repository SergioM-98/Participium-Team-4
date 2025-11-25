import {UserRepository} from "@/repositories/user.repository";
import {RegistrationInput,
   } from "@/dtos/user.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const mockedPrisma = jest.requireMock('@/db/db').prisma;

describe('UserRepository Story 1', () => {
    let userRepository: UserRepository;
    const mockUserData: RegistrationInput = {
        username: "testuser",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        role: "CITIZEN",
        office: undefined,
        telegram: undefined
    }

    beforeEach(() => {
        userRepository = UserRepository.getInstance();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicates', () => {
        it("should return isExisting true when username exists", async () => {
            mockedPrisma.user.findFirst.mockResolvedValue(mockUserData);
            
            const response = await userRepository.checkDuplicates(mockUserData)
            expect(response.isExisting).toBe(true);
        });
            
        it ("should return isExisting false when username does not exist", async () => {
            mockedPrisma.user.findFirst.mockResolvedValue(null);

            const response = await userRepository.checkDuplicates(mockUserData)
            expect(response).toHaveProperty('isExisting');
            expect(response.isExisting).toBe(false);
            
        });
    })
    describe('createUser', () => {
        it("should create a new user and return success true", async () => {
            mockedPrisma.user.create.mockResolvedValue({
                ...mockUserData,
                id: 1,
                passwordHash: "hashedpassword"
            });
            const response = await userRepository.createUser(mockUserData)
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe(mockUserData.username);
            }
        });
        it("should throw an error when database operation fails", async () => {
            mockedPrisma.user.create.mockRejectedValue(new Error("DB error"));
            await expect(userRepository.createUser(mockUserData)).rejects.toThrow("Failed to fetch user from database");
        });
    })

    })
describe('UserRepository Story 2 - OFFICER Registration by ADMIN', () => {
    let userRepository: UserRepository;
    const mockUserData: RegistrationInput = {
        username: "testofficer",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        firstName: "Test",
        lastName: "Officer",
        email: undefined,
        role: "OFFICER",
        office: "DEPARTMENT_OF_COMMERCE",
        telegram: undefined
    }

    beforeEach(() => {
        userRepository = UserRepository.getInstance();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicates', () => {
        it("should return isExisting true when OFFICER username exists", async () => {
            mockedPrisma.user.findFirst.mockResolvedValue({
                ...mockUserData,
                id: 1,
                passwordHash: "hashedpassword"
            });
            
            const response = await userRepository.checkDuplicates(mockUserData)
            expect(response.isExisting).toBe(true);
            expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { username: mockUserData.username }
            });
        });
            
        it ("should return isExisting false when OFFICER username does not exist", async () => {
            mockedPrisma.user.findFirst.mockResolvedValue(null);

            const response = await userRepository.checkDuplicates(mockUserData)
            expect(response).toHaveProperty('isExisting');
            expect(response.isExisting).toBe(false);
            expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { username: mockUserData.username }
            });
        });
    })

    describe('createUser', () => {
        it("should create a new OFFICER and return success true", async () => {
            mockedPrisma.user.create.mockResolvedValue({
                ...mockUserData,
                id: 1,
                passwordHash: "hashedpassword",
                email: null,
                telegram: null
            });
            const response = await userRepository.createUser(mockUserData)
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe(mockUserData.username);
            }
            expect(mockedPrisma.user.create).toHaveBeenCalled();
        });

        it("should throw an error when database operation fails for OFFICER", async () => {
            mockedPrisma.user.create.mockRejectedValue(new Error("DB error"));
            await expect(userRepository.createUser(mockUserData)).rejects.toThrow("Failed to fetch user from database");
        });

        it("should handle constraint violation errors", async () => {
            mockedPrisma.user.create.mockRejectedValue(new Error("Unique constraint failed"));
            await expect(userRepository.createUser(mockUserData)).rejects.toThrow("Failed to fetch user from database");
        });
    })
})
