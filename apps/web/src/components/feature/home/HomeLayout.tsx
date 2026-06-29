import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/common/routes";

import { ActionButton } from "./ActionButton";
import { FeatureGrid } from "./FeatureGrid";
import { HeroBackground } from "./HeroBackground";
import { HeroPreviewCard } from "./HeroPreviewCard";

export const HomeLayout = () => {
  return (
    <main className="relative w-full overflow-x-hidden bg-background">
      <HeroBackground />

      <section className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI-powered resume &amp; cover letter builder
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Build a resume that gets you{" "}
            <span className="text-primary">the interview</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
            CV Assistant turns your experience into a polished, ATS-friendly
            resume and cover letter, tailored by AI in minutes and exported as a
            pixel-perfect PDF.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <ActionButton />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6 text-base"
            >
              <Link href="#features">
                See how it works
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center pt-8 lg:pt-0">
          <HeroPreviewCard />
        </div>
      </section>

      <FeatureGrid />

      <section className="relative border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your next job starts with a better resume
          </h2>
          <p className="max-w-xl text-muted-foreground text-pretty">
            Create a free account and have a tailored, ATS-ready resume ready to
            send in minutes.
          </p>
          <ActionButton />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span className="font-medium text-foreground">CV Assistant</span>
          <span>
            © {new Date().getFullYear()} CV Assistant. All rights reserved.
          </span>
        </div>
      </footer>
    </main>
  );
};
