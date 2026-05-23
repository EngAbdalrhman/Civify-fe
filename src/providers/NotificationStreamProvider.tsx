"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/cookies";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationStreamContextValue {
  isConnected: boolean;
}

const NotificationStreamContext =
  createContext<NotificationStreamContextValue>({
    isConnected: false,
  });

let activeEventSource: EventSource | null = null;
let connectionRefCount = 0;

export function NotificationStreamProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsConnected(false);
      return;
    }

    connectionRefCount += 1;

    if (
      activeEventSource &&
      activeEventSource.readyState !== EventSource.CLOSED
    ) {
      setIsConnected(true);
      return () => {
        connectionRefCount -= 1;
      };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";

    const eventSource = new EventSource(`${baseUrl}/v1/notifications/stream`, {
      withCredentials: true,
    });
    activeEventSource = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        queryClient.setQueryData<Notification[]>(
          ["notifications", "list"],
          (oldData) => {
            const newData = oldData
              ? [notification, ...oldData].slice(0, 20)
              : [notification];
            return newData;
          },
        );
        queryClient.setQueryData<number>(
          ["notifications", "unreadCount"],
          (oldCount) => (oldCount || 0) + 1,
        );
      } catch (err) {
        console.error("[SSE] Failed to parse notification:", err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      connectionRefCount -= 1;
      if (connectionRefCount <= 0) {
        connectionRefCount = 0;
        eventSource.close();
        if (activeEventSource === eventSource) {
          activeEventSource = null;
        }
        setIsConnected(false);
      }
    };
  }, [queryClient]);

  return (
    <NotificationStreamContext.Provider value={{ isConnected }}>
      {children}
    </NotificationStreamContext.Provider>
  );
}

export function useNotificationStream(): NotificationStreamContextValue {
  return useContext(NotificationStreamContext);
}
