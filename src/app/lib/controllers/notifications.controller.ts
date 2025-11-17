import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { NotificationsService } from "../services/notifications.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";


class NotificationsController {

    private notificationsService: NotificationsService = NotificationsService.getInstance();

    async getNotificationsPreferences() : Promise<NotificationsResponse>{
        const userRoleCheck = await this.checkUserRole();
        if(!userRoleCheck.success || !userRoleCheck.data) {
            return { success: false, error: "Unauthorized access" };
        }
        return this.notificationsService.getNotificationsPreferences(userRoleCheck.data);
    }

    async updateNotificationsPreferences(notifications: NotificationsData) : Promise<NotificationsResponse> {
        const userRoleCheck = await this.checkUserRole();
        if(!userRoleCheck.success || !userRoleCheck.data) {
            return { success: false, error: "Unauthorized access" };
        }
        return this.notificationsService.updateNotificationsPreferences(userRoleCheck.data, notifications);
    }

    private async checkUserRole(): Promise<{
        success: boolean;
        data?: string;
    }> {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "CITIZEN") {
            return {
                success: false,
            };
        }
        return {
            success: true,
            data: session.user.username,
        };
    }

}


export { NotificationsController };