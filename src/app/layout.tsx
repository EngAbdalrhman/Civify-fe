import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HICv",
  description: "AI-powered CV tailoring and cover letter generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased h-full bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 vintage:from-amber-50 vintage:to-orange-100"
        suppressHydrationWarning={true}
      >
        <ThemeProvider defaultTheme="light" storageKey="hicv-theme">
          <LocaleProvider defaultLocale="en">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
