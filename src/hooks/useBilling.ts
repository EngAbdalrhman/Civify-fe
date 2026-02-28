import { useQuery, useMutation } from "@tanstack/react-query";
import { billingService } from "@/services/billing.service";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const useInvoices = () => {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => billingService.getInvoices(),
    enabled: !!getAccessToken(),
  });
};

export const useInvoice = (uuid: string) => {
  return useQuery({
    queryKey: ["billing", "invoices", uuid],
    queryFn: () => billingService.getInvoiceByUuid(uuid),
    enabled: !!uuid && !!getAccessToken(),
  });
};

export const usePayInvoice = () => {
  return useMutation({
    mutationFn: ({ uuid, gateway }: { uuid: string; gateway: string }) =>
      billingService.payInvoice(uuid, gateway),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to process invoice payment");
    },
  });
};
