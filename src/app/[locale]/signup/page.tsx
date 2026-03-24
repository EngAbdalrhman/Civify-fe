import SignupContent from "@/features/auth/components/SignupContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.signup" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/signup`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/signup`,
      languages: {
        en: "/en/signup",
        ar: "/ar/signup",
      },
    },
  };
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>}>
      <SignupContent />
    </Suspense>
  );
}
