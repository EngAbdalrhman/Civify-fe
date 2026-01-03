import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  BeforeAfterSection,
  TemplatesSection,
  RolePersonalizationSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  IntegrationsSection,
  BlogPreviewSection,
  CTASection,
  ResumeBuilderSection,
} from "@/features/home-page/components";

const Homepage = () => {
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

