"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import {
  TokenPackage,
  tokenPackageService,
} from "@/services/token-package.service";
import { useState } from "react";
import { toast } from "sonner";

const PurchaseButton = ({
  pkg,
}: {
  pkg: TokenPackage & { isFeatured?: boolean };
}) => {
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const handlePurchase = async (packageId: number) => {
    try {
      setPurchasingId(packageId);
      const result = await tokenPackageService.purchasePackage(packageId);

      if (result.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = result.paymentUrl;
      } else if (result.paymentKey) {
        // Handle Paymob iframe if needed
        toast.success("Payment initiated");
      } else {
        toast.error(result.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error purchasing package:", error);
      toast.error(error?.message || "Failed to initiate purchase");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <Button
      className={`w-full mt-auto ${pkg.isFeatured ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : ""}`}
      size="lg"
      onClick={() => handlePurchase(pkg.id)}
      disabled={purchasingId !== null}
    >
      {purchasingId === pkg.id ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Buy Now
        </>
      )}
    </Button>
  );
};

export default PurchaseButton;
