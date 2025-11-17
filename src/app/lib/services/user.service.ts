import { RegistrationInput } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";

class UserService {
    private static instance: UserService
    private userRepository: UserRepository;
    private constructor() {
        this.userRepository = UserRepository.getInstance();
    }
    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    public async checkDuplicates(userData: RegistrationInput) {
        return this.userRepository.checkDuplicates(userData);
    }

    public async createUser(userData: RegistrationInput) {
        return this.userRepository.createUser(userData);
    }

    public async retrieveUser(userData: { username: string; password: string; }) {
        return this.userRepository.retrieveUser(userData);
    }   

    public async updateNotificationsMedia(userId: string, telegram: string | null, email: string | null, removeTelegram:boolean) {
        return this.userRepository.updateNotificationsMedia(userId, telegram, email, removeTelegram);
    }

}

export { UserService };