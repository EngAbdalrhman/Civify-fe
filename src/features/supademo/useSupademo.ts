"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import "./types";

export function useSupademo() {
  const t = useTranslations("help.tutorials");

  const openDemo = useCallback(
    (demoId: string) => {
      if (!demoId?.trim()) {
        return;
      }

      if (typeof window !== "undefined" && window.Supademo?.open) {
        window.Supademo.open(demoId);
        return;
      }

      toast.error(t("loadError"));
    },
    [t],
  );

  return { openDemo };
}
