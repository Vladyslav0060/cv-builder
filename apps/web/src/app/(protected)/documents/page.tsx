"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, FileText, Plus, Sparkles } from "lucide-react";

import { ROUTES } from "@/common/routes";
import { useGetDocumentsPreview } from "@/hooks/document/useGetDocumentsPreview";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const documentTypeLabels = {
  RESUME: "Resume",
  COVER_LETTER: "Cover letter",
} as const;

const documentTypeClasses = {
  RESUME: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  COVER_LETTER: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
} as const;

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const updatedAt = new Date(value);
  const diffMs = Date.now() - updatedAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  return `Updated ${formatUpdatedAt(value)}`;
}

export default function Documents() {
  const router = useRouter();
  const { data: documents } = useGetDocumentsPreview();

  const items = [...(documents ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const totalDocuments = items.length;
  const resumeCount = items.filter(
    (document) => document.type === "RESUME",
  ).length;
  const coverLetterCount = totalDocuments - resumeCount;
  const latestDocument = items[0];

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64" />

      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.DOCUMENTS, title: "Documents" },
        ]}
      />

      <Container variant="fullMobileConstrainedBreakpointPadded" paddingY="sm">
        <div className="relative flex min-w-0 flex-col gap-6">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
              <CardHeader className="gap-3 border-b border-border/60 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl space-y-3">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1"
                    >
                      <Sparkles className="mr-1.5 size-3.5" />
                      Document library
                    </Badge>
                    <CardTitle className="text-2xl sm:text-3xl">
                      Your documents, organized and ready to edit
                    </CardTitle>
                    <CardDescription className="max-w-xl text-sm sm:text-base">
                      Review your latest drafts, jump back into the most recent
                      version, or start a new document from the current set of
                      profile data.
                    </CardDescription>
                  </div>

                  <CardAction className="self-start">
                    <Button asChild>
                      <Link href={ROUTES.NEW_DOCUMENT}>
                        <Plus className="mr-2 size-4" />
                        New document
                      </Link>
                    </Button>
                  </CardAction>
                </div>
              </CardHeader>

              <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {totalDocuments}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saved documents
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Resumes
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{resumeCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Resume drafts
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cover letters
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {coverLetterCount}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tailored letters
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-base">Latest activity</CardTitle>
                <CardDescription>
                  The most recently updated document in your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {latestDocument ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium">
                          {latestDocument.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatRelativeDate(latestDocument.updatedAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 border-transparent",
                          documentTypeClasses[latestDocument.type],
                        )}
                      >
                        {documentTypeLabels[latestDocument.type]}
                      </Badge>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        Last updated
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {formatUpdatedAt(latestDocument.updatedAt)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() =>
                        router.push(`${ROUTES.DOCUMENTS}/${latestDocument.id}`)
                      }
                    >
                      Open latest document
                      <ArrowRight className="size-4" />
                    </Button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
                    No document has been created yet. Start with a new resume or
                    cover letter to populate this view.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">All documents</h2>
                <p className="text-sm text-muted-foreground">
                  Click any card to open the editor.
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href={ROUTES.NEW_DOCUMENT}>
                  Create another
                  <Plus className="size-4" />
                </Link>
              </Button>
            </div>

            {documents === undefined ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="border-border/60 bg-card/70 shadow-sm backdrop-blur"
                  >
                    <CardHeader>
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted/80" />
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-24 animate-pulse rounded-2xl bg-muted/70" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : items.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((document) => (
                  <Card
                    key={document.id}
                    className="group cursor-pointer border-border/60 bg-card/85 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                    onClick={() =>
                      router.push(`${ROUTES.DOCUMENTS}/${document.id}`)
                    }
                  >
                    <CardHeader className="border-b border-border/50 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <CardTitle className="truncate text-base group-hover:text-primary">
                            {document.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-6 text-xs">
                            <div className="flex gap-2 items-center">
                              <Clock3 className="size-3.5" />
                              {formatRelativeDate(document.updatedAt)}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 border-transparent",
                                documentTypeClasses[document.type],
                              )}
                            >
                              {documentTypeLabels[document.type]}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/35 px-3 py-2 text-sm">
                        <span className="truncate text-muted-foreground">
                          {formatUpdatedAt(document.updatedAt)}
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border/70 bg-card/70 shadow-sm backdrop-blur">
                <CardContent className="flex flex-col items-start gap-4 p-8">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileText className="size-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No documents yet</h3>
                    <p className="max-w-lg text-sm text-muted-foreground">
                      Create your first document using the profile details you
                      already have saved. You can always refine it later.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={ROUTES.NEW_DOCUMENT}>
                      <Plus className="size-4" />
                      Create document
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
