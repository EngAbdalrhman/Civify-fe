"use client";

import { useTranslations } from "next-intl";

export default function PolicyPage() {
  const t = useTranslations("policy");
  const date = new Date().toLocaleDateString();

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("lastUpdated", { date })}</p>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>
            At Civify, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website.
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">1. Information We Collect</h2>
            <p>
              We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining 
              information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">2. How We Use Your Information</h2>
            <p>
              We use personal information collected via our website for a variety of business purposes described below. We process your 
              personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a 
              contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">3. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
              By Law or to Protect Rights, Third-Party Service Providers, and Business Transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">4. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken 
              reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security 
              measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
