"use client";

import { FormEvent, useState } from "react";
import {
  BriefcaseBusiness,
  ClipboardList,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAiCoverLetter } from "@/hooks/document/useCreateAiCoverLetter";

const DEMO_COVER_LETTER_VALUES = {
  applicant:
    "I am Alex Morgan, a senior frontend engineer with 8 years of experience building SaaS dashboards, onboarding flows, billing systems, and design-system components with React, Next.js, TypeScript, Tailwind CSS, GraphQL, REST APIs, Playwright, and Stripe.",
  proposal:
    "A growing B2B SaaS company needs help rebuilding its customer analytics dashboard. The current interface is slow, hard to scan, and difficult for non-technical customers to use. They want a contractor who can improve the UI architecture, implement new reporting views, clean up forms and filters, and collaborate with their product designer over the next 6-8 weeks.",
  proof:
    "I recently led a legacy dashboard rebuild in Next.js, created reusable table/filter/chart components, improved loading states and empty states, added Playwright coverage for critical workflows, and helped reduce support tickets around reporting. I also have direct experience with SaaS billing, role-based admin tools, accessibility, performance optimization, and turning rough product requirements into polished UI.",
  preferences:
    "Write it as a concise Upwork-style proposal under 250 words. Use a confident but warm tone. Mention availability for a short discovery call and avoid quoting a rate.",
};

export function AiCoverLetterCreationForm() {
  const [applicant, setApplicant] = useState("");
  const [proposal, setProposal] = useState("");
  const [proof, setProof] = useState("");
  const [preferences, setPreferences] = useState("");
  const [formError, setFormError] = useState("");
  const { mutateAsync: createAiCoverLetter, isPending } =
    useCreateAiCoverLetter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (applicant.trim().length < 20) {
      setFormError("Add who you are, your role, and relevant background.");
      return;
    }

    if (proposal.trim().length < 30) {
      setFormError("Add the client need, job post, or proposal context.");
      return;
    }

    if (proof.trim().length < 20) {
      setFormError("Add relevant proof, projects, achievements, or skills.");
      return;
    }

    await createAiCoverLetter({
      applicant: applicant.trim(),
      proposal: proposal.trim(),
      proof: proof.trim(),
      preferences: preferences.trim() || undefined,
    });
  };

  const handleAutofill = () => {
    setApplicant(DEMO_COVER_LETTER_VALUES.applicant);
    setProposal(DEMO_COVER_LETTER_VALUES.proposal);
    setProof(DEMO_COVER_LETTER_VALUES.proof);
    setPreferences(DEMO_COVER_LETTER_VALUES.preferences);
    setFormError("");
  };

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/90 shadow-sm backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-violet-400 to-rose-300" />
      <CardHeader className="space-y-4 border-b border-border/60 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600">
              <MessageSquareText className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CardTitle className="text-2xl leading-tight sm:text-3xl">
                  AI cover letter
                </CardTitle>
              </div>
              <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                Answer a few proposal questions. The draft opens in the cover
                letter editor for final edits.
              </CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground md:min-w-80">
            {[
              { icon: UserRound, label: "Applicant" },
              { icon: BriefcaseBusiness, label: "Proposal" },
              { icon: ClipboardList, label: "Proof" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
              >
                <Icon className="mx-auto mb-1 size-4 text-sky-600" />
                <p className="font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-5">
          <Field>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleAutofill}
              className="w-fit! self-end"
            >
              <Sparkles className="size-4" />
              Autofill With Sample Data
            </Button>
            <FieldLabel>Who is applying?</FieldLabel>
            <FieldContent>
              <Textarea
                value={applicant}
                onChange={(event) => setApplicant(event.target.value)}
                disabled={isPending}
                className="min-h-28"
                placeholder="Your name, role, seniority, location, main stack, signature details, and any background the letter should use."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>What is the proposal for?</FieldLabel>
            <FieldContent>
              <Textarea
                value={proposal}
                onChange={(event) => setProposal(event.target.value)}
                disabled={isPending}
                className="min-h-40"
                placeholder="Paste the job post or describe the client, company, problem, project goals, responsibilities, and required skills."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>What proof should it emphasize?</FieldLabel>
            <FieldContent>
              <Textarea
                value={proof}
                onChange={(event) => setProof(event.target.value)}
                disabled={isPending}
                className="min-h-32"
                placeholder="Relevant projects, outcomes, metrics, tools, domain experience, portfolio links, or reasons you are credible for this proposal."
              />
            </FieldContent>
          </Field>

          <Field className="mb-4">
            <FieldLabel>Tone, CTA, or constraints</FieldLabel>
            <FieldContent>
              <Textarea
                value={preferences}
                onChange={(event) => setPreferences(event.target.value)}
                disabled={isPending}
                className="min-h-24"
                placeholder="Optional: concise Upwork proposal, formal cover letter, warm tone, mention availability, ask for a call, avoid salary/rate, keep under 250 words..."
              />
            </FieldContent>
          </Field>

          {formError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col-reverse justify-between gap-3 sm:flex-row">
          <p className="text-xs leading-5 text-muted-foreground">
            The generated draft stays editable before you send or export it.
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Writing letter
              </>
            ) : (
              <>
                <Send className="size-4" />
                Generate cover letter
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
