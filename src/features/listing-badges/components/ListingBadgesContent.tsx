"use client";

import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { LISTING_BADGES } from "@/config/listing-badges";
import { ListingBadgeCard } from "./ListingBadgeCard";

export default function ListingBadgesContent() {
  const t = useTranslations("listingBadges");

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {LISTING_BADGES.map((badge) => (
            <ListingBadgeCard key={badge.id} badge={badge} />
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center mt-10 max-w-2xl mx-auto">
          {t("hint")}
        </p>
      </div>
    </div>
  );
}
