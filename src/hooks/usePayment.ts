import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { paymentService } from "@/services/payment.service";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const usePaymentGateways = () => {
  return useQuery({
    queryKey: ["payment", "gateways"],
    queryFn: () => paymentService.getEnabledGateways(),
    enabled: !!getAccessToken(),
  });
};

export const useInitiatePayment = () => {
  const t = useTranslations("subscription");
  return useMutation({
    mutationFn: ({
      planId,
      isAnnual,
      promoCode,
      gateway,
      paymentMethod,
      phoneNumber,
    }: {
      planId: number;
      isAnnual?: boolean;
      promoCode?: string;
      gateway?: string;
      paymentMethod?: string;
      phoneNumber?: string;
    }) =>
      paymentService.initiatePayment(
        planId,
        isAnnual,
        promoCode,
        gateway,
        paymentMethod,
        phoneNumber,
      ),
    onError: (error: any) => {
      // Handle known errors with translations
      if (error?.message === "subscription.active.exists") {
        toast.error(t("active.exists"));
        return;
      }

      toast.error(error?.message || "Failed to initiate payment");
    },
  });
};

export const useVerifyPayment = (transactionId: string) => {
  return useQuery({
    queryKey: ["payment", "verify", transactionId],
    queryFn: () => paymentService.verifyPayment(transactionId),
    enabled: !!transactionId && !!getAccessToken(),
    retry: false, // Or customization logic manually if we want to poll
  });
};
