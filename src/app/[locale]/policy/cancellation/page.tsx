import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "metadata.cancellation",
  });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/policy/cancellation`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/policy/cancellation`,
      languages: {
        en: "/en/policy/cancellation",
        ar: "/ar/policy/cancellation",
      },
    },
  };
}

export default async function CancellationPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subscription.policy" });

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          {t("nature")} & {t("noRefund")}
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-foreground/80">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {t("nature")}
            </h2>
            <p className="leading-relaxed">{t("natureDesc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {t("noRefund")}
            </h2>
            <p className="leading-relaxed">{t("noRefundDesc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {t("autoRenew")}
            </h2>
            <p className="leading-relaxed">{t("autoRenewDesc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {t("cancellationEffect")}
            </h2>
            <p className="leading-relaxed">{t("cancellationEffectDesc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {t("agreement")}
            </h2>
            <p className="leading-relaxed">{t("agreementDesc")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
