"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import type { ListingBadge } from "@/config/listing-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListingBadgeCardProps {
  badge: ListingBadge;
}

export function ListingBadgeCard({ badge }: ListingBadgeCardProps) {
  const t = useTranslations("listingBadges");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(badge.embedHtml);
      setCopied(true);
      toast.success(t("copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">{badge.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-6 flex items-center justify-center min-h-[100px]">
          <div
            className="listing-badge-preview"
            dangerouslySetInnerHTML={{ __html: badge.embedHtml }}
          />
        </div>

        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all border max-h-32">
          {badge.embedHtml}
        </pre>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="default" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            ) : (
              <Copy className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            )}
            {copied ? t("copied") : t("copyEmbed")}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a
              href={badge.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("openListing")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
