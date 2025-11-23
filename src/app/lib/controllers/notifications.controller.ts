"use server";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { NotificationsService } from "../services/notifications.service";



    export async function getNotificationsPreferences() : Promise<NotificationsResponse>{
        const userRoleCheck = await checkUserRole();
        if(!userRoleCheck.success || !userRoleCheck.data) {
            return { success: false, error: "Unauthorized access" };
        }
        return NotificationsService.getInstance().getNotificationsPreferences(userRoleCheck.data);
    }

    export async function updateNotificationsPreferences(notifications: NotificationsData) : Promise<NotificationsResponse> {
        const userRoleCheck = await checkUserRole();
        if(!userRoleCheck.success || !userRoleCheck.data) {
            return { success: false, error: "Unauthorized access" };
        }
        return NotificationsService.getInstance().updateNotificationsPreferences(userRoleCheck.data, notifications);
    }

    async function checkUserRole(): Promise<{
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
            data: session.user.id,
        };
    }
