import type { Metadata } from "next";
import { PricingSection } from "@/components/feature/subscription/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for CV Builder. Choose the plan that fits your job search.",
};

export default function Page() {
  return <PricingSection />;
}
