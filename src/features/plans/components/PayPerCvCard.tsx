"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/routing";
import { isAuthenticated } from "@/utils/cookies";
import { usePermissions } from "@/hooks/use-permissions";

interface PayPerCvCardProps {
  userCurrency?: string;
  isEgyptianRegion?: boolean;
}

export default function PayPerCvCard({ 
  userCurrency = "EGP", 
  isEgyptianRegion = true 
}: PayPerCvCardProps) {
  const t = useTranslations("plans");
  const router = useRouter();
  const { groupName } = usePermissions();

  const handleSelect = (productId: string) => {
    const loggedIn = isAuthenticated() || !!groupName;
    const targetUrl = `/checkout?productId=${productId}&type=PAY_PER_CV`;

    if (!loggedIn) {
      router.push(`/login?returnTo=${encodeURIComponent(targetUrl)}`);
      return;
    }
    router.push(targetUrl);
  };

  const isEgp = userCurrency === "EGP" || isEgyptianRegion;
  const singlePrice = isEgp ? "150 EGP" : "$2.99 USD";
  const singleSecondary = isEgp ? "≈ $2.99 USD" : "≈ 150 EGP";

  return (
    <div className="mx-auto max-w-4xl my-12 rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-r from-primary/5 via-background to-primary/5 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Badge variant="secondary" className="gap-1.5 py-1 px-3 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              {t("payPerCv.badge", { defaultMessage: "One-Time Unlock" })}
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("payPerCv.noSub", { defaultMessage: "No Monthly Subscription" })}
            </span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight">
            {t("payPerCv.title", { defaultMessage: "Single CV Pass" })}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            {t("payPerCv.subtitle", { 
              defaultMessage: "Only need 1 or 2 targeted resumes? Pay once for 30 days of full access. Unlimited edits, watermark removal, and PDF + editable Word (DOCX) export." 
            })}
          </p>

          <div className="flex flex-wrap gap-y-2 gap-x-4 pt-1 justify-center md:justify-start text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-primary" />
              {t("payPerCv.watermarkFree", { defaultMessage: "Watermark Removed" })}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-primary" />
              {t("payPerCv.docxExport", { defaultMessage: "Word (.docx) & PDF" })}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-primary" />
              {t("payPerCv.duration", { defaultMessage: "30-Day Unlimited Edits" })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end justify-center gap-2 flex-shrink-0">
          <div className="text-center md:text-right">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {singlePrice}
            </span>
            <span className="block text-xs font-medium text-muted-foreground">
              {singleSecondary}
            </span>
          </div>

          <Button 
            size="lg" 
            className="w-full sm:w-auto font-semibold shadow-md mt-2"
            onClick={() => handleSelect("PAY_PER_CV_SINGLE")}
          >
            {t("payPerCv.cta", { defaultMessage: "Unlock Single CV" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
