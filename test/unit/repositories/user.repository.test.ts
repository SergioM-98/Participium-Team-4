import {UserRepository} from "@/repositories/user.repository";
import { CheckDuplicatesResponse, LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse } from "@/dtos/user.dto";


jest.mock('@/db/db', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const mockedPrisma = require('@/db/db').prisma;

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let mockUserData: RegistrationInput = {
        firstName
        
    }

    beforeEach(() => {
        userRepository = new UserRepository();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicates', () => {
        it("should return return Registration success true when username does not exist", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue({username: test});
            
            userRepository.checkDuplicates()