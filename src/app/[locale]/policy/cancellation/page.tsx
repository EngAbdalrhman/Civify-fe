"use client";

import { useTranslations } from "next-intl";

export default function CancellationPolicyPage() {
  const t = useTranslations("subscription.policy");
  const date = new Date().toLocaleDateString();

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">{t("nature")} & {t("noRefund")}</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-8 text-foreground/80">
          
          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t("nature")}</h2>
            <p className="leading-relaxed">
              {t("natureDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t("noRefund")}</h2>
            <p className="leading-relaxed">
              {t("noRefundDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t("autoRenew")}</h2>
            <p className="leading-relaxed">
              {t("autoRenewDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t("cancellationEffect")}</h2>
            <p className="leading-relaxed">
              {t("cancellationEffectDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">{t("agreement")}</h2>
            <p className="leading-relaxed">
              {t("agreementDesc")}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
