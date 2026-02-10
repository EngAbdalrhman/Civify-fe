import { Metadata } from "next";
import { GuestJobPreview } from "@/features/guest-preview";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guestPreview.input");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function GuestPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <GuestJobPreview />
      </div>
    </div>
  );
}
