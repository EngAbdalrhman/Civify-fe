"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IntlProvider } from "next-intl";

type Locale = "en" | "ar";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({
  children,
  defaultLocale = "en",
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("hicv-locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await import(`../../../src/i18n/messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    }
    loadMessages();
  }, [locale]);

  // Update localStorage and document attributes when locale changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("hicv-locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

    // Update Accept-Language header for API calls
    // This will be used by the API client
    if (typeof window !== "undefined") {
      (window as any).__LOCALE__ = locale;
    }
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !messages) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

