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