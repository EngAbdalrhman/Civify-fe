import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";
import { toast } from "sonner";

export const usePaymentGateways = () => {
  return useQuery({
    queryKey: ["payment", "gateways"],
    queryFn: () => paymentService.getEnabledGateways(),
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: ({
      planId,
      isAnnual,
      promoCode,
      gateway,
    }: {
      planId: number;
      isAnnual?: boolean;
      promoCode?: string;
      gateway?: string;
    }) => paymentService.initiatePayment(planId, isAnnual, promoCode, gateway),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to initiate payment");
    },
  });
};

export const useVerifyPayment = (transactionId: string) => {
  return useQuery({
    queryKey: ["payment", "verify", transactionId],
    queryFn: () => paymentService.verifyPayment(transactionId),
    enabled: !!transactionId,
    retry: false, // Or customization logic manually if we want to poll
  });
};
