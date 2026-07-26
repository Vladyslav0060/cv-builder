import type { Metadata } from "next";
import { PricingSection } from "@/components/feature/subscription/PricingSection";
import type { PlanDto } from "@/api/generated.schemas";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050"
).replace(/\/$/, "");

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for CV Builder. Choose the plan that fits your job search.",
};

async function getPlans(): Promise<PlanDto[]> {
  const response = await fetch(`${API_URL}/subscription/plans`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to load pricing plans: ${response.status}`);
  }

  return response.json();
}

export default async function Page() {
  const plans = await getPlans();

  return <PricingSection initialPlans={plans} />;
}
