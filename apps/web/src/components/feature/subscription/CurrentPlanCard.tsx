"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROUTES } from "@/common/routes";
import { useGetCurrentSubscription } from "@/hooks/subscription/useGetCurrentSubscription";
import { useCancelSubscription } from "@/hooks/subscription/useCancelSubscription";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  max: "Max",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function CurrentPlanCard() {
  const { data: subscription, isLoading } = useGetCurrentSubscription();
  const cancelSubscription = useCancelSubscription();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !subscription) {
    return <Card className="h-56 animate-pulse" />;
  }

  const tierLabel = TIER_LABELS[subscription.tier] ?? subscription.tier;
  const isPaid = subscription.tier !== "free";
  const periodEndLabel = formatDate(subscription.currentPeriodEnd);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your plan</CardTitle>
          <Badge variant={isPaid ? "default" : "secondary"}>{tierLabel}</Badge>
        </div>
        <CardDescription>
          {subscription.cancelAtPeriodEnd && periodEndLabel
            ? `Cancels on ${periodEndLabel}`
            : isPaid && periodEndLabel
              ? `Renews on ${periodEndLabel}`
              : "No active subscription"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Creations / day
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {subscription.limits.CREATE}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Exports / day
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {subscription.limits.EXPORT}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant={isPaid ? "outline" : "default"}>
          <Link href={ROUTES.PRICING}>
            {isPaid ? "Change plan" : "Upgrade"}
          </Link>
        </Button>

        {isPaid && !subscription.cancelAtPeriodEnd && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Cancel subscription
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ll keep {tierLabel} access until{" "}
                  {periodEndLabel ?? "the end of your billing period"}, then
                  drop to the Free plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={cancelSubscription.isPending}
                  onClick={() => cancelSubscription.mutate()}
                >
                  {cancelSubscription.isPending
                    ? "Canceling…"
                    : "Cancel subscription"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
