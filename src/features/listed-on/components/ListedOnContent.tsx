"use client";

import { useTranslations } from "next-intl";
import { getActiveListingBadges } from "@/config/listing-badges";

export default function ListedOnContent() {
  const t = useTranslations("listedOn");
  const badges = getActiveListingBadges();

  return (
    <div className="py-16 md:py-24 min-h-[50vh] flex flex-col justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-8 max-w-3xl mx-auto"
          aria-label={t("badgesAria")}
        >
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="listed-on-badge"
              dangerouslySetInnerHTML={{ __html: badge.embedHtml }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
