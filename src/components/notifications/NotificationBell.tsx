"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useUnreadNotificationsCount,
  useNotificationsList,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/useNotifications";
import { useNotificationStream } from "@/providers/NotificationStreamProvider";

export function NotificationBell() {
  const { isConnected } = useNotificationStream();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: notifications = [] } = useNotificationsList();

  const { mutate: markAsReadMutate } = useMarkNotificationAsRead();
  const { mutate: markAllAsReadMutate } = useMarkAllNotificationsAsRead();

  const [isOpen, setIsOpen] = useState(false);

  const markAsRead = (id: number) => {
    markAsReadMutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutate();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "bg-green-500";
      case "WARNING":
        return "bg-yellow-500";
      case "PROMO":
        return "bg-purple-500";
      case "SYSTEM":
        return "bg-slate-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatTime = (timestamp: string) => {
    const utcTimestamp = timestamp.endsWith("Z") ? timestamp : timestamp + "Z";
    const date = new Date(utcTimestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {isConnected && unreadCount > 0 && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                  !notification.read ? "bg-muted/20" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getTypeColor(notification.type)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
