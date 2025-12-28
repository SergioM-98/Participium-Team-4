/**
 * Telegram Section Component
 */

import React, { useMemo } from "react";
import { Loader2, Send, LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TelegramSectionProps {
  isTelegramConnected: boolean;
  isEditing: boolean;
  isPending: boolean;
  telegramStatus: "idle" | "opening" | "opened";
  removeTelegram: boolean;
  onConnectTelegram: () => void;
  onRemoveTelegramChange: (checked: boolean) => void;
}

const getTelegramButtonContent = (telegramStatus: "idle" | "opening" | "opened") => {
  if (telegramStatus === "opening") {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" /> Opening Telegram...
      </>
    );
  }
  if (telegramStatus === "opened") {
    return (
      <>
        <LinkIcon className="h-4 w-4" /> Telegram Opened
      </>
    );
  }
  return (
    <>
      <Send className="h-4 w-4" /> Connect with Telegram
    </>
  );
};

export const TelegramSection: React.FC<TelegramSectionProps> = ({
  isTelegramConnected,
  isEditing,
  isPending,
  telegramStatus,
  removeTelegram,
  onConnectTelegram,
  onRemoveTelegramChange,
}) => {
  const telegramButtonContent = useMemo(
    () => getTelegramButtonContent(telegramStatus),
    [telegramStatus]
  );

  return (
    <div className="space-y-2 md:col-span-2">
      {isTelegramConnected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium text-sm">
              Telegram Connected
            </span>
          </div>
          {isEditing && (
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-red-200 bg-red-50/50 p-4">
              <Checkbox
                id="removeTelegram"
                checked={removeTelegram}
                onCheckedChange={(checked) => {
                  onRemoveTelegramChange(checked as boolean);
                }}
                disabled={isPending}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="removeTelegram"
                  className="cursor-pointer font-medium text-red-700"
                >
                  Disconnect Telegram Account
                </Label>
                <p className="text-xs text-red-600/80 pt-1">
                  Check this box to remove your Telegram connection. You can
                  uncheck it before saving to undo.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Button
            size="sm"
            className="w-full sm:w-auto gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white"
            onClick={onConnectTelegram}
            disabled={isPending || telegramStatus === "opening"}
          >
            {telegramButtonContent}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-2">
            Click to be redirected to Telegram and link your account to receive
            notifications.
          </p>
          {telegramStatus === "opened" && (
            <p className="text-[11px] text-green-600 mt-2 font-medium">
              ✓ Telegram opened in new window. Complete the registration there
              and return here.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
