import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Zap, Coins, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  tokenPackageService,
  type TokenPackage,
} from "@/services/token-package.service";
import PurchaseButton from "./_components/PurchaseButton";
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

  const t = await getTranslations({ locale, namespace: "metadata.tokens" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/tokens`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/tokens`,
      languages: {
        en: "/en/tokens",
        ar: "/ar/tokens",
      },
    },
  };
}

export default async function TokensPage() {
  let packages: TokenPackage[] = [];

  try {
    packages = await tokenPackageService.getPackages();
  } catch (error) {
    console.error("Error loading token packages:", error);
  }

  // Determine featured/best value package (usually middle tier or marked)
  const getFeaturedIndex = (pkgs: TokenPackage[]): number => {
    if (pkgs.length <= 1) return 0;
    if (pkgs.length === 2) return 1;
    return Math.floor(pkgs.length / 2); // Middle package
  };

  const featuredIndex = getFeaturedIndex(packages);

  if (packages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-6 bg-muted/50 rounded-lg">
          <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No Token Packages Available
          </h2>
          <p className="text-muted-foreground mb-6">
            Token packages are not available at the moment. Please check back
            later or consider upgrading your subscription plan.
          </p>
          <Link href="/plans">
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              View Subscription Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full mb-4">
          <Zap className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Buy Token Packages
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Need more tokens? Purchase additional tokens to continue using our
          AI-powered CV features. Tokens never expire and are added to your
          account instantly.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm">Instant activation</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm">Tokens never expire</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm">Secure payment</span>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {packages.map((pkg, index) => {
          const isFeatured = index === featuredIndex;
          const formattedTokens = tokenPackageService.formatTokens(pkg.tokens);

          return (
            <Card
              key={pkg.id}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                isFeatured
                  ? "border-primary shadow-lg scale-[1.02] ring-2 ring-primary/20"
                  : "hover:border-primary/50"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Best Value
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
                  <Coins className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                {pkg.description && (
                  <CardDescription className="mt-1">
                    {pkg.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center pt-4">
                {/* Token Amount */}
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {formattedTokens}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      tokens
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tokenPackageService.getPricePerToken(
                      pkg.price,
                      pkg.tokens,
                    )}{" "}
                    {pkg.currency} per token
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      {pkg.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      {pkg.currency}
                    </span>
                  </div>
                </div>

                <PurchaseButton
                  pkg={
                    { ...pkg, isFeatured } as TokenPackage & {
                      isFeatured: boolean;
                    }
                  }
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Back to Plans Link */}
      <div className="text-center pt-8">
        <p className="text-muted-foreground mb-4">
          Looking for unlimited tokens? Consider upgrading your subscription
          plan.
        </p>
        <Link href="/plans">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            View Subscription Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}
