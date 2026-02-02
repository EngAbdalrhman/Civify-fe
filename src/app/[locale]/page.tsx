import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  BeforeAfterSection,
  // TemplatesSection,
  RolePersonalizationSection,
  // TestimonialsSection,
  PricingSection,
  FAQSection,
  // IntegrationsSection,
  // BlogPreviewSection,
  CTASection,
  ResumeBuilderSection,
} from "@/features/home-page/components";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const Homepage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <ResumeBuilderSection />
      <FeaturesSection />
      <BeforeAfterSection />
      {/* <TemplatesSection /> */}
      <RolePersonalizationSection />
      {/* <TestimonialsSection /> */}
      <PricingSection />
      <FAQSection />
      {/* <IntegrationsSection /> */}
      {/* <BlogPreviewSection /> */}
      <CTASection />
    </>
  );
};

export default Homepage;
