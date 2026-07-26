"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/auth/useMe";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/common/routes";
import { usePlans } from "@/hooks/subscription/usePlans";
import { useCreateCheckoutSession } from "@/hooks/subscription/useCreateCheckoutSession";
import { useGetCurrentSubscription } from "@/hooks/subscription/useGetCurrentSubscription";
import { PlanDto } from "@/api/generated.schemas";

type BillingCycle = "monthly" | "sixMonth";

const PLAN_PERKS: Record<string, string[]> = {
  Free: ["1 creation/day", "1 export/day", "Basic templates"],
  Pro: [
    "10 creations/day",
    "10 exports/day",
    "AI-tailored writing",
    "All templates",
  ],
  Max: [
    "50 creations/day",
    "50 exports/day",
    "Everything in Pro",
    "Priority AI generation",
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

type PricingSectionProps = {
  initialPlans: PlanDto[];
};

export function PricingSection({ initialPlans }: PricingSectionProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { data: plans, isLoading } = usePlans(initialPlans);
  const { data: me } = useMe();
  const { data: currentSubscription } = useGetCurrentSubscription({
    enabled: !!me?.isAuthenticated,
  });
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
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-6 w-20" />
                    {index === 1 && (
                      <Skeleton className="h-6 w-24 rounded-full" />
                    )}
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: index === 0 ? 3 : 4 }).map(
                      (_, perkIndex) => (
                        <div key={perkIndex} className="flex items-center gap-2">
                          <Skeleton className="size-4 shrink-0 rounded-full" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      ),
                    )}
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))
          : plans.map((plan) => {
              const amount =
                cycle === "monthly" ? plan.monthlyAmount : plan.sixMonthAmount;
              const isFree = plan.tier === null;
              const isPro = plan.tier === "pro";
              const planTier = plan.tier ?? "free";
              const isCurrentPlan =
                planTier === (currentSubscription?.tier ?? "free");
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
                      disabled={isCurrentPlan || isPending}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      {isCurrentPlan
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
