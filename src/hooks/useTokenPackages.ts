import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tokenPackageService,
  TokenPurchaseResult,
} from "@/services/token-package.service";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const useTokenPackages = () => {
  return useQuery({
    queryKey: ["token-packages"],
    queryFn: () => tokenPackageService.getPackages(),
    enabled: !!getAccessToken(),
  });
};

export const useTokenBalance = () => {
  return useQuery({
    queryKey: ["token-balance"],
    queryFn: () => tokenPackageService.getBalance(),
    enabled: !!getAccessToken(),
  });
};

export const usePurchasePreview = (packageId: number, promoCode: string) => {
  return useQuery({
    queryKey: ["purchase-preview", packageId, promoCode],
    queryFn: () => tokenPackageService.previewPurchase(packageId, promoCode),
    enabled: !!packageId && !!promoCode && !!getAccessToken(),
    retry: false,
  });
};

export const usePurchaseTokenPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      packageId,
      promoCode,
    }: {
      packageId: number;
      promoCode?: string;
    }) => tokenPackageService.purchasePackage(packageId, promoCode),
    onSuccess: (data: TokenPurchaseResult) => {
      // If payment required (url/key), toast might be handled by component
      if (data.success && !data.paymentUrl) {
        toast.success("Tokens purchased successfully");
        queryClient.invalidateQueries({ queryKey: ["token-balance"] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to purchase tokens");
    },
  });
};
