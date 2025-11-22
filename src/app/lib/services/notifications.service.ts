import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { NotificationsRepository } from "../repositories/notifications.repository";

class NotificationsService {
    private static instance: NotificationsService
    private notificationsRepository: NotificationsRepository;
    private constructor() {
        this.notificationsRepository = NotificationsRepository.getInstance();
    }
    public static getInstance(): NotificationsService {
        if (!NotificationsService.instance) {
            NotificationsService.instance = new NotificationsService();
        }
        return NotificationsService.instance;
    }


    public async getNotificationsPreferences(userId: string) : Promise<NotificationsResponse>{
        return this.notificationsRepository.retrieveNotificationsPreferences(userId);
    }
    
    public async updateNotificationsPreferences(userId: string, notifications: NotificationsData) : Promise<NotificationsResponse>{
        return this.notificationsRepository.updateNotificationsPreferences(userId, notifications);
    }

}

export { NotificationsService };