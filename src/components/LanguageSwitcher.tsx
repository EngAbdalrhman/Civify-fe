"use client";

import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "@/i18n/routing";
import {Globe} from "lucide-react";
import {Button} from "@/components/ui/button";

export function LanguageSwitcher() {
    const t = useTranslations('nav.language');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const newLocale = locale === 'ar' ? 'en' : 'ar';
        router.replace(pathname, {locale: newLocale});
    };

    return (

        <Button
            variant="ghost" className="text-muted-foreground hover:text-foreground gap-2"
            onClick={toggleLanguage}
        >
            <Globe className="h-5 w-5"/>
            <span className="hidden sm:inline-block font-medium">
            {locale === 'ar' ? 'العربية' : 'English'}
          </span>
            <span className="sr-only">{t('switch')}</span>
        </Button>
    );
}
