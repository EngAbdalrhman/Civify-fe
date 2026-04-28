"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import {
  TokenPackage,
} from "@/services/token-package.service";
import { useState } from "react";
import { TokenPurchaseDialog } from "@/components/tokens/TokenPurchaseDialog";

const PurchaseButton = ({
  pkg,
}: {
  pkg: TokenPackage & { isFeatured?: boolean };
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        className={`w-full mt-auto ${pkg.isFeatured ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : ""}`}
        size="lg"
        onClick={() => setIsDialogOpen(true)}
      >
        <Zap className="mr-2 h-4 w-4" />
        Buy Now
      </Button>

      <TokenPurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tokenPackage={pkg}
      />
    </>
  );
};

export default PurchaseButton;
