import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const useCalculatePrice = (
  planId: number,
  isAnnual: boolean,
  promoCode?: string
) => {
  return useQuery({
    queryKey: ["calculate-price", planId, isAnnual, promoCode],
    queryFn: () => adminService.calculatePrice(planId, isAnnual, promoCode),
    enabled: !!planId && (promoCode ? promoCode.length > 0 : true), // Only run if planId is present. If promoCode is provided, wait until it has length? Or run always?
    // Logic in component was: only validate if promoCode is present and user clicks apply.
    // So this hook might strictly be for "preview" or "calculation".
    // If we want manual trigger, useQuery with enabled: false + refetch, OR useMutation.
    // Given the component behavior (click "Apply"), useMutation is possibly better or useQuery with enabled:false.
    retry: false,
  });
};

// Actually, useMutation is better for explicit "Apply" action in checkout
import { useMutation } from "@tanstack/react-query";

export const useCalculatePriceMutation = () => {
  return useMutation({
    mutationFn: ({
      planId,
      isAnnual,
      promoCode,
    }: {
      planId: number;
      isAnnual: boolean;
      promoCode: string;
    }) => adminService.calculatePrice(planId, isAnnual, promoCode),
  });
};
