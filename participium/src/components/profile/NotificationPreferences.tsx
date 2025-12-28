/**
 * Notification Preferences Section Component
 */

import React from "react";
import { Bell, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NotificationPreferencesProps {
  isEditing: boolean;
  isPending: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  isTelegramConnected: boolean;
  onEmailEnabledChange: (checked: boolean) => void;
  onTelegramEnabledChange: (checked: boolean) => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  isEditing,
  isPending,
  emailEnabled,
  telegramEnabled,
  isTelegramConnected,
  onEmailEnabledChange,
  onTelegramEnabledChange,
}) => {
  return (
    <>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Notification Preferences</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={cn(
              "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors",
              isEditing ? "bg-card" : "bg-muted/20 opacity-80"
            )}
          >
            <Checkbox
              id="emailNotif"
              checked={emailEnabled}
              disabled={!isEditing || isPending}
              onCheckedChange={(checked) =>
                onEmailEnabledChange(checked as boolean)
              }
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="emailNotif" className="cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground pt-1">
                Receive updates about reports via email.
              </p>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors",
                    isEditing ? "bg-card" : "bg-muted/20 opacity-80",
                    !isTelegramConnected &&
                      isEditing &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    id="telegramNotif"
                    checked={telegramEnabled}
                    disabled={
                      !isEditing || isPending || !isTelegramConnected
                    }
                    onCheckedChange={(checked) =>
                      onTelegramEnabledChange(checked as boolean)
                    }
                  />
                  <div className="space-y-1 leading-none w-full">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="telegramNotif" className="cursor-pointer">
                        Telegram Notifications
                      </Label>
                      {!isTelegramConnected && isEditing && (
                        <Info className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Receive real-time updates on Telegram.
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              {!isTelegramConnected && isEditing && (
                <TooltipContent>
                  <p>
                    Connect your Telegram account above to enable this option.
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
};
