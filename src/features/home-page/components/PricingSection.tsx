"use client";

import PlansContent from "@/features/plans/components/PlansContent";

export function PricingSection() {
  return (
    <section className="bg-background">
      <PlansContent hideFAQ={true} isHeadingH1={false} />
    </section>
  );
}
