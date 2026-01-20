import { useMutation } from "@tanstack/react-query";
import {
  adminService,
  SendNotificationRequest,
  SendToUsersRequest,
} from "@/services/admin.service";
import { toast } from "sonner";

export const useSendBroadcast = () => {
  return useMutation({
    mutationFn: (request: SendNotificationRequest) =>
      adminService.sendBroadcast(request),
    onSuccess: (data) => {
      toast.success(data.message || "Broadcast sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send broadcast");
    },
  });
};

export const useSendToUsers = () => {
  return useMutation({
    mutationFn: (request: SendToUsersRequest) =>
      adminService.sendToUsers(request),
    onSuccess: (data) => {
      toast.success(data.message || "Notification sent to users successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send notification");
    },
  });
};
