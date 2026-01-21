'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import apiClient from '@/api/client';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read?: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch unread count and recent notifications
  const fetchNotifications = useCallback(async () => {
    try {
      // 1. Get unread count
      const countRes = await apiClient.get<{ count: number }>('/v1/notifications/unread-count');
      setUnreadCount(countRes.data.count);

      // 2. Get recent notifications (for the list)
      const listRes = await apiClient.get<{ content: any[] }>('/v1/notifications?size=20');
      // Fix: Ensure we use the 'content' field from Page response
      if (listRes.data && Array.isArray(listRes.data.content)) {
          const mappedNotifications = listRes.data.content.map((n: any) => ({
              ...n,
              timestamp: n.createdAt || n.timestamp, // Handle both API (createdAt) and SSE (timestamp) formats
              read: n.delivered // Map delivered to read status if needed, though logic might differ
          }));
          setNotifications(mappedNotifications); 
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return;

    // Set cookie for EventSource authentication (since headers aren't supported)
    document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Strict`;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077/apis';
    
    // Connect to stream using cookie for auth
    const eventSource = new EventSource(
      `${baseUrl}/v1/notifications/stream`,
      { withCredentials: true }
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('[SSE] Connected to notifications stream');
    };

    eventSource.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20
        setUnreadCount(prev => prev + 1);
      } catch (err) {
        console.error('[SSE] Failed to parse notification:', err);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      setIsConnected(false);
    };

    eventSourceRef.current = eventSource;

    // Initial fetch
    fetchNotifications();

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [fetchNotifications]);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-500';
      case 'WARNING':
        return 'bg-yellow-500';
      case 'PROMO':
        return 'bg-purple-500';
      case 'SYSTEM':
        return 'bg-slate-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTime = (timestamp: string) => {
    // Backend returns UTC time without 'Z' suffix, so we append it
    const utcTimestamp = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
    const date = new Date(utcTimestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
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
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
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
                  !notification.read ? 'bg-muted/20' : ''
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
