import { useQuery, useMutation } from "@tanstack/react-query";
import { billingService } from "@/services/billing.service";
import { toast } from "sonner";

export const useInvoices = () => {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => billingService.getInvoices(),
  });
};

export const useInvoice = (uuid: string) => {
  return useQuery({
    queryKey: ["billing", "invoices", uuid],
    queryFn: () => billingService.getInvoiceByUuid(uuid),
    enabled: !!uuid,
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
