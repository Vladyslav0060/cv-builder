import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/feature/home/HeroBackground";

type CheckoutStatusSectionProps = {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CheckoutStatusSection({
  icon: Icon,
  iconClassName,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CheckoutStatusSectionProps) {
  return (
    <main className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center overflow-hidden bg-background px-4">
      <HeroBackground />

      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon className="size-7" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-pretty">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondaryHref && secondaryLabel && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
