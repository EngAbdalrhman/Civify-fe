import { useMutation } from "@tanstack/react-query";
import { newsletterService } from "@/services/newsletter.service";
import { toast } from "sonner";

export const useNewsletterSubscribe = () => {
  return useMutation({
    mutationFn: (email: string) => newsletterService.subscribe(email),
    onSuccess: () => {
      toast.success("Subscribed to newsletter successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to subscribe");
    },
  });
};

export const useNewsletterUnsubscribe = () => {
  return useMutation({
    mutationFn: (email: string) => newsletterService.unsubscribe(email),
    onSuccess: () => {
      toast.success("Unsubscribed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to unsubscribe");
    },
  });
};

export const useNewsletterBroadcast = () => {
  return useMutation({
    mutationFn: (data: {
      subject: string;
      content: string;
      isHtml?: boolean;
    }) => newsletterService.broadcast(data),
    onSuccess: () => {
      toast.success("Broadcast sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send broadcast");
    },
  });
};
