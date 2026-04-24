import { NextIntlClientProvider } from "next-intl";
import LayoutWrapper from "@/components/LayoutWrapper";
import NotFoundPage from "@/components/NotFoundPage";
import { routing } from "@/i18n/routing";
import messages from "@/messages/en";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for could not be found.",
};

export default function GlobalNotFound() {
  const locale = routing.defaultLocale;

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <LayoutWrapper>
                <NotFoundPage />
              </LayoutWrapper>
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
