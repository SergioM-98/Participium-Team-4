import {UserRepository} from "@/repositories/user.repository";
import {RegistrationInput,
   } from "@/dtos/user.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const mockedPrisma = require('@/db/db').prisma;

describe('UserRepository Story 1', () => {
    let userRepository: UserRepository;
    let mockUserData: RegistrationInput = {
        username: "testuser",
        password: "Test@1234",
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        role: "CITIZEN",
        office: undefined,
        telegram: undefined
    }

    beforeEach(() => {
        userRepository = new UserRepository();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicates', () => {
        it("should return isExisting true when username exists", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(mockUserData);
            
            let response = await userRepository.checkDuplicates(mockUserData)
            expect(response.isExisting).toBe(true);
        });
            
        it ("should return isExisting false when username does not exist", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(null);

            let response = await userRepository.checkDuplicates(mockUserData)
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
            let response = await userRepository.createUser(mockUserData)
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