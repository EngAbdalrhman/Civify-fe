"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("terms");
  const date = new Date().toLocaleDateString();

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("lastUpdated", { date })}</p>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>
            Welcome to Civify. By accessing or using our website, you agree to be bound by these Terms and Conditions.
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">2. Use of Service</h2>
            <p>
              Civify provides an AI-powered CV optimization service. You agree to use this service only for lawful purposes 
              and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">3. Intellectual Property</h2>
            <p>
              The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters 
              related to the Site are protected under applicable copyrights, trademarks and other proprietary rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">4. Disclaimer</h2>
            <p>
              The materials on Civify's website are provided on an 'as is' basis. Civify makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
