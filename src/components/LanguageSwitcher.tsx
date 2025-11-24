"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const locales = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "ar" as const, name: "Arabic", nativeName: "العربية" },
];

console.log("Test")

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const { locale, setLocale } = useLocale();

  const switchLocale = (newLocale: "en" | "ar") => {
    setLocale(newLocale);
  };

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("title")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => switchLocale(loc.code)}
            className={locale === loc.code ? "bg-accent" : ""}
          >
            <span className="flex items-center gap-2">
              {loc.nativeName}
              {locale === loc.code && (
                <span className="text-xs text-muted-foreground">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
