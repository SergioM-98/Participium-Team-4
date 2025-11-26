"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  FileText,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getInbox,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/controllers/notification.controller";

interface NotificationItem {
  id: string; // or bigint, handled below
  type: "STATUS_CHANGE" | "NEW_MESSAGE" | string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
  reportId?: string | bigint;
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count every 30 seconds to keep the badge updated
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load full inbox only when opening the dropdown
  useEffect(() => {
    if (isOpen) {
      fetchInbox();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      if (res.success && typeof res.data === "number") {
        setUnreadCount(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const res = await getInbox();
      if (res.success && Array.isArray(res.data)) {
        // Normalize data to ensure IDs are strings for React keys
        const formatted = res.data.map((n: any) => ({
          ...n,
          id: n.id.toString(),
          reportId: n.reportId?.toString(),
        }));
        setNotifications(formatted);
        // Sync count locally to avoid jitter
        setUnreadCount(formatted.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markAsRead(BigInt(id));
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await markAllAsRead();
  };

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative",
          className || "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border bg-background shadow-lg z-[9999] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <ScrollArea className="h-[350px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Loading updates...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-20" />
                <span className="text-sm">No notifications yet</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() =>
                      handleMarkAsRead(notification.id, notification.isRead)
                    }
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                      !notification.isRead && "bg-muted/30"
                    )}
                  >
                    {/* Icon based on Type */}
                    <div
                      className={cn(
                        "mt-1 h-8 w-8 shrink-0 rounded-full flex items-center justify-center border",
                        notification.type === "STATUS_CHANGE"
                          ? "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900"
                          : "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900"
                      )}
                    >
                      {notification.type === "STATUS_CHANGE" ? (
                        <FileText className="h-4 w-4" />
                      ) : notification.type === "NEW_MESSAGE" ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 overflow-hidden">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.isRead
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    {/* Unread indicator dot */}
                    {!notification.isRead && (
                      <div className="ml-auto flex items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
