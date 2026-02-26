import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmSubscriptionPage() {
  const t = useTranslations("subscription.confirm");
  const common = useTranslations("common");

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-muted/20">
      <div className="w-full max-w-2xl grid gap-8 md:grid-cols-2">
        {/* Order Summary */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
              Review your order details
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t("plan")}</span>
              <span className="font-medium">Pro Plan</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t("billingCycle")}</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>{t("price")}</span>
              <span>$19.00</span>
            </div>
          </div>
        </div>

        {/* Payment Form Placeholder */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <h3 className="font-semibold text-lg">{t("paymentMethod")}</h3>

          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground text-sm">
              Stripe Payment Element will be integrated here
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/subscription/success">{t("confirmPayment")}</Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By confirming, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
