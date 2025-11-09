"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const locales = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, "");
    
    // Build the new path with the new locale
    const newPath = newLocale === "en" 
      ? pathnameWithoutLocale || "/" 
      : `/${newLocale}${pathnameWithoutLocale || "/"}`;
    
    router.push(newPath);
    router.refresh();
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

