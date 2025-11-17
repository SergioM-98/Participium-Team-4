import { RegistrationInput, RegistrationResponse } from "../dtos/user.dto";
import { NotificationsRepository } from "../repositories/notifications.repository";
import { UserRepository } from "../repositories/user.repository";

class UserService {
    private static instance: UserService
    private userRepository: UserRepository;
    private notificationsRepository: NotificationsRepository;
    private constructor() {
        this.userRepository = UserRepository.getInstance();
        this.notificationsRepository = NotificationsRepository.getInstance();
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

    public async createUser(userData: RegistrationInput): Promise<RegistrationResponse> {
        const result = await this.userRepository.createUser(userData);
        if(result.success && userData.role === "CITIZEN") {
            const internalRes = await this.notificationsRepository.updateNotificationsPreferences(userData.username, {
                emailEnabled: true,
                telegramEnabled: false,
            });
            if(!internalRes.success) {
                return {
                    success: false,
                    error: internalRes.error,
                };
            }
        }
        return result;
    }

    public async retrieveUser(userData: { username: string; password: string; }) {
        return this.userRepository.retrieveUser(userData);
    }   

    public async updateNotificationsMedia(userId: string, telegram: string | null, email: string | null, removeTelegram:boolean) {
        return this.userRepository.updateNotificationsMedia(userId, telegram, email, removeTelegram);
    }

}

export { UserService };