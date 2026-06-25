"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMe } from "@/hooks/auth/useMe";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/common/routes";
import { usePlans } from "@/hooks/subscription/usePlans";
import { useCreateCheckoutSession } from "@/hooks/subscription/useCreateCheckoutSession";
import { PlanDto } from "@/api/generated.schemas";

type BillingCycle = "monthly" | "sixMonth";

const PLAN_PERKS: Record<string, string[]> = {
  Free: ["1 active resume", "Basic templates", "PDF export"],
  Pro: [
    "Unlimited resumes & cover letters",
    "AI-tailored writing",
    "All templates",
  ],
  Max: [
    "Everything in Pro",
    "Priority AI generation",
    "Early access to new features",
  ],
};

function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { data: plans, isLoading } = usePlans();
  const { data: me } = useMe();
  const router = useRouter();
  const checkoutSession = useCreateCheckoutSession();

  const handleChoosePlan = (plan: PlanDto) => {
    const priceId =
      cycle === "monthly" ? plan.monthlyPriceId : plan.sixMonthPriceId;

    if (!priceId) return;

    if (!me?.isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    checkoutSession.mutate({ priceId });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-muted-foreground">
          Start for free. Upgrade when you need more from your resumes and
          cover letters.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Tabs
          value={cycle}
          onValueChange={(value) => setCycle(value as BillingCycle)}
        >
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="sixMonth">
              Every 6 months
              <Badge variant="secondary" className="ml-1.5">
                Save 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {isLoading || !plans
          ? Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-80 animate-pulse" />
            ))
          : plans.map((plan) => {
              const amount =
                cycle === "monthly" ? plan.monthlyAmount : plan.sixMonthAmount;
              const isFree = plan.tier === null;
              const isPro = plan.tier === "pro";
              const isPending =
                checkoutSession.isPending &&
                checkoutSession.variables?.priceId ===
                  (cycle === "monthly"
                    ? plan.monthlyPriceId
                    : plan.sixMonthPriceId);

              return (
                <Card
                  key={plan.name}
                  className={
                    isPro ? "border-primary ring-2 ring-primary" : undefined
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {isPro && <Badge>Most popular</Badge>}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight">
                        {formatAmount(amount, plan.currency)}
                      </span>
                      {!isFree && (
                        <span className="text-sm text-muted-foreground">
                          /{cycle === "monthly" ? "mo" : "6 mo"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <ul className="flex flex-col gap-2 text-sm">
                      {(PLAN_PERKS[plan.name] ?? []).map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isPro ? "default" : "outline"}
                      disabled={isFree || isPending}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      {isFree
                        ? "Your current plan"
                        : isPending
                          ? "Redirecting…"
                          : `Choose ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </section>
  );
}
