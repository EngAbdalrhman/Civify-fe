"use client";

import { useLocale } from "@/lib/i18n/locale-provider";
import { useTheme } from "@/lib/theme/theme-provider";
import { useTranslate } from "@/lib/i18n/translate";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Languages,
  Palette,
  Sun,
  Moon,
  Clock,
  Check,
} from "lucide-react";

const locales = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "ar" as const, name: "Arabic", nativeName: "العربية" },
];

const themes = [
  { value: "light" as const, icon: Sun, labelKey: "theme.light" },
  { value: "dark" as const, icon: Moon, labelKey: "theme.dark" },
  { value: "vintage" as const, icon: Clock, labelKey: "theme.vintage" },
];

export function SettingsMenu() {
  const translate = useTranslate();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  const switchLocale = (newLocale: "en" | "ar") => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{translate("common.settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{translate("common.settings")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Language Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" />
            <span>{translate("language.title")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {locales.map((loc) => (
              <DropdownMenuItem
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
              >
                <span className="flex items-center justify-between w-full">
                  <span>{loc.nativeName}</span>
                  {locale === loc.code && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Theme Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>{translate("theme.title")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <DropdownMenuItem
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="flex items-center justify-between w-full">
                    <span>{translate(themeOption.labelKey)}</span>
                    {theme === themeOption.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
