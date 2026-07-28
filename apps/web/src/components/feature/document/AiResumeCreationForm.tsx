"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Loader2,
  Sparkles,
  Target,
  Upload,
  UserRound,
  X,
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
import { useCreateAiResume } from "@/hooks/document/useCreateAiResume";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    ACCEPTED_FILE_TYPES.includes(file.type) ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".pdf") ||
    name.endsWith(".docx")
  );
}

export function AiResumeCreationForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [introduction, setIntroduction] = useState("");
  const [background, setBackground] = useState("");
  const [target, setTarget] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const { mutateAsync: createAiResume, isPending } = useCreateAiResume();

  const selectedFileLabel = useMemo(() => {
    if (!file) return null;
    return `${file.name} (${formatFileSize(file.size)})`;
  }, [file]);

  const handleFile = (nextFile: File | null) => {
    setFileError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError("Upload a CV up to 5 MB.");
      return;
    }

    if (!isAcceptedFile(nextFile)) {
      setFileError("Upload a PDF, DOCX, TXT, or Markdown CV.");
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (introduction.trim().length < 20) {
      setFormError("Add a short introduction with your role and direction.");
      return;
    }

    if (background.trim().length < 30) {
      setFormError("Add experience, skills, achievements, or education notes.");
      return;
    }

    await createAiResume({
      introduction: introduction.trim(),
      background: background.trim(),
      target: target.trim() || undefined,
      file,
    });
  };

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/90 shadow-sm backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-sky-400 to-amber-300" />
      <CardHeader className="space-y-4 border-b border-border/60 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
              <Sparkles className="size-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl leading-tight sm:text-3xl">
                AI resume builder
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                Start with a few notes. The resume opens in the editor with a
                PDF preview ready for cleanup.
              </CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground md:min-w-80">
            {[
              { icon: UserRound, label: "Intro" },
              { icon: BriefcaseBusiness, label: "Experience" },
              { icon: Target, label: "Target" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
              >
                <Icon className="mx-auto mb-1 size-4 text-emerald-600" />
                <p className="font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-5">
          <Field>
            <FieldLabel>Introduce yourself</FieldLabel>
            <FieldContent>
              <Textarea
                value={introduction}
                onChange={(event) => setIntroduction(event.target.value)}
                disabled={isPending}
                className="min-h-24"
                placeholder="I am John Doe, a frontend engineer based in Kyiv. I build React and Next.js products, care about clean UI, and want to position myself for senior product engineering roles."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Experience, skills, and proof</FieldLabel>
            <FieldContent>
              <Textarea
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                disabled={isPending}
                className="min-h-40"
                placeholder="Roles, projects, stack, achievements, education, certifications, languages. Rough notes are fine: rebuilt dashboard in Next.js, integrated payments, improved onboarding, led junior developers..."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Target role or job description</FieldLabel>
            <FieldContent>
              <Textarea
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                disabled={isPending}
                className="min-h-28"
                placeholder="Senior Frontend Engineer, React/Next.js, SaaS product team. Paste a job description here if you have one."
              />
            </FieldContent>
          </Field>

          <div
            className={cn(
              "rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 mb-4",
              file && "border-emerald-500/50 bg-emerald-500/5",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    {selectedFileLabel ?? "Old CV (optional)"}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    PDF, DOCX, TXT, or Markdown. The AI will reuse facts and
                    rewrite weak sections.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {file ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="size-4" />
                    Remove
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Upload CV
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            {fileError ? (
              <p className="mt-3 text-sm text-destructive">{fileError}</p>
            ) : null}
          </div>

          {formError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col-reverse justify-between gap-3 sm:flex-row">
          <p className="text-xs leading-5 text-muted-foreground">
            You can edit every field before downloading the PDF.
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Building resume
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate resume
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
