"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { newsletterService } from "@/services/newsletter.service";
import { toast } from "sonner";

export function Footer() {
  const t = useTranslations("footer");
  const tSubscription = useTranslations("subscription.policy");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyrightYear, setCopyrightYear] = useState<number | null>(null);

  useEffect(() => {
    setCopyrightYear(new Date().getFullYear());
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await newsletterService.subscribe(email);
      toast.success(t("newsletter.success"));
      setEmail("");
    } catch (error) {
      toast.error(t("newsletter.error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Product Section */}
          <div>
            <p className="font-semibold text-gray-900 mb-3 text-sm">
              {t("product.title")}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/plans"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("product.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("product.apiDocs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/extension"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("product.extension")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <p className="font-semibold text-gray-900 mb-3 text-sm">
              {t("company.title")}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("company.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("company.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/policy"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("company.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {t("company.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/policy/cancellation"
                  className="text-gray-600 hover:text-gray-900 text-xs transition-colors"
                >
                  {tSubscription("cancellationPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <p className="font-semibold text-gray-900 mb-3 text-sm">
              {t("newsletter.title")}
            </p>
            <p id="footer-newsletter-desc" className="text-xs text-gray-600 mb-3">
              {t("newsletter.description")}
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col gap-2"
            >
              <Label htmlFor="footer-newsletter-email" className="sr-only">
                {t("newsletter.placeholder")}
              </Label>
              <Input
                id="footer-newsletter-email"
                type="email"
                placeholder={t("newsletter.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-8 text-xs"
                aria-describedby="footer-newsletter-desc"
                autoComplete="email"
              />
              <Button
                type="submit"
                size="sm"
                className="text-xs"
                disabled={loading}
              >
                {loading ? "..." : t("newsletter.subscribe")}
              </Button>
            </form>
          </div>
        </div>

        {/* Social Icons and Mobile App */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Follow Us */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-xs">
                {t("followUs")}
              </h4>
              <div className="flex gap-2">
                <Link
                  href="https://www.facebook.com/civifyapp7"
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-gray-700" />
                </Link>
                <Link
                  href="https://x.com/Civifyapp"
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 text-gray-700" />
                </Link>
                <Link
                  href="https://www.instagram.com/civifyapp/"
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-gray-700" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/civify-cv"
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-gray-700" />
                </Link>
              </div>
            </div>

            {/* Mobile App */}
            {/* <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-xs">
              {t("mobileApp")}
            </h4>
            <div className="flex gap-2">
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.523 15.3414c-.5511-.8484-.9993-1.8065-1.3447-2.8743-.3454-.9997-.5181-1.9993-.5181-2.9989 0-1.6557.4363-3.0301 1.309-4.1233.8727-1.0932 2.0664-1.7639 3.5811-2.012-.3454-.5181-.8727-.9663-1.5807-1.3447-.708-.3784-1.4887-.5676-2.3421-.5676-1.1359 0-2.1356.3454-2.999.9993-.8634.654-1.6557 1.0932-2.3768 1.3447-.7211.2515-1.4887.3784-2.3074.3784-.8187 0-1.5807-.1269-2.2671-.3784-.6864-.2515-1.4887-.6907-2.4074-1.3447-.9187-.654-1.9184-.9993-2.999-.9993-.8534 0-1.6341.1892-2.3421.5676-.708.3784-1.2353.8266-1.5807 1.3447 1.5147.2481 2.7084.9188 3.5811 2.012.8727 1.0932 1.309 2.4676 1.309 4.1233 0 .9996-.1727 1.9992-.5181 2.9989-.3454 1.0678-.7936 2.0259-1.3447 2.8743 1.0932 1.5147 2.4676 2.272 4.1233 2.272.8187 0 1.5807-.1269 2.2671-.3784.6864-.2515 1.4887-.6907 2.4074-1.3447.9187-.654 1.9184-.9993 2.999-.9993 1.0806 0 2.0803.3453 2.999.9993.9187.654 1.721 1.0932 2.4074 1.3447.6864.2515 1.4484.3784 2.2671.3784 1.6557 0 3.0301-.7573 4.1233-2.272z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight">
                      {t("downloadOn")}
                    </div>
                    <div className="text-xs font-semibold leading-tight">
                      App Store
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight">
                      {t("getItOn")}
                    </div>
                    <div className="text-xs font-semibold leading-tight">
                      Google Play
                    </div>
                  </div>
                </div>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/civify-logo-simple.png"
              alt="Civify Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-sm text-gray-600" suppressHydrationWarning>
              {copyrightYear !== null
                ? t("copyright", { year: copyrightYear })
                : t("copyright", { year: "" })}
            </span>
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="https://techno-labs.org" target="_blank">
            <Image
              src="/tl-logo.png"
              alt="Technolabs Logo"
              width={32}
              height={32}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
          <span className="text-sm text-gray-600">{t("poweredBy")}</span>
        </div>
      </div>
    </footer>
  );
}
