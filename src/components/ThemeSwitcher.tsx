"use client";

import { useTheme } from "@/lib/theme/theme-provider";
import { useTranslate } from "@/lib/i18n/translate";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Clock } from "lucide-react";

const themes = [
  { 
    value: "light" as const, 
    icon: Sun,
    labelKey: "theme.light"
  },
  { 
    value: "dark" as const, 
    icon: Moon,
    labelKey: "theme.dark"
  },
  { 
    value: "vintage" as const, 
    icon: Clock,
    labelKey: "theme.vintage"
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const translate = useTranslate();

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CurrentIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{translate("theme.title")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={theme === themeOption.value ? "bg-accent" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="flex items-center gap-2">
                {translate(themeOption.labelKey)}
                {theme === themeOption.value && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

