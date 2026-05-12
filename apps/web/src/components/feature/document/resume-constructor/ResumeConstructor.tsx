"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  LayoutTemplate,
  Languages,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDownloadResumePdf } from "@/hooks/document/useDownloadResumePdf";

import {
  defaultResumeData,
  type ResumeExportPayload,
  resumeColorSchemes,
  resumeTemplates,
  type ResumeColorSchemeId,
  type ResumeData,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeTemplateId,
} from "@/shared/resume-constructor-data";

import { PreviewSurface, ResumePdfPreview } from "./ResumePdfPreview";

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function linesToText(lines: string[]) {
  return lines.join("\n");
}

function updateExperience(
  list: ResumeExperience[],
  id: string,
  updater: (entry: ResumeExperience) => ResumeExperience,
) {
  return list.map((entry) => (entry.id === id ? updater(entry) : entry));
}

function updateEducation(
  list: ResumeEducation[],
  id: string,
  updater: (entry: ResumeEducation) => ResumeEducation,
) {
  return list.map((entry) => (entry.id === id ? updater(entry) : entry));
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ListEditor({
  label,
  icon,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const visibleValues = values.length ? values : [""];

  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm">{label}</CardTitle>
        </div>
        <CardDescription>
          Keep one item per row for clean PDF output.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleValues.map((value, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...visibleValues];
                next[index] = event.target.value;
                onChange(
                  next.filter(
                    (item, itemIndex) =>
                      item.trim() || itemIndex !== next.length - 1,
                  ),
                );
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                onChange(
                  visibleValues.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              disabled={visibleValues.length === 1 && !value}
              aria-label={`Remove ${label} item`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...visibleValues, ""])}
        >
          <Plus className="size-4" />
          Add item
        </Button>
      </CardContent>
    </Card>
  );
}

function ResumeEntryCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeExperience;
  onChange: (next: ResumeExperience) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-sm">
            {entry.position || "New role"}
          </CardTitle>
          <CardDescription>{entry.company || "Company"}</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Position">
            <Input
              value={entry.position}
              onChange={(event) =>
                onChange({ ...entry, position: event.target.value })
              }
            />
          </Field>
          <Field label="Company">
            <Input
              value={entry.company}
              onChange={(event) =>
                onChange({ ...entry, company: event.target.value })
              }
            />
          </Field>
          <Field label="Location">
            <Input
              value={entry.location ?? ""}
              onChange={(event) =>
                onChange({ ...entry, location: event.target.value })
              }
            />
          </Field>
          <Field label="Start date">
            <Input
              value={entry.startDate}
              placeholder="2022"
              onChange={(event) =>
                onChange({ ...entry, startDate: event.target.value })
              }
            />
          </Field>
          <Field label="End date">
            <Input
              value={entry.endDate ?? ""}
              placeholder={entry.isCurrent ? "Present" : "2024"}
              disabled={entry.isCurrent}
              onChange={(event) =>
                onChange({
                  ...entry,
                  endDate: event.target.value,
                  isCurrent: false,
                })
              }
            />
          </Field>
          <Field label="Current role">
            <label className="flex h-8 items-center gap-2 rounded-lg border border-input px-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(entry.isCurrent)}
                onChange={(event) =>
                  onChange({
                    ...entry,
                    isCurrent: event.target.checked,
                    endDate: event.target.checked ? "Present" : entry.endDate,
                  })
                }
              />
              Present role
            </label>
          </Field>
        </div>

        <Field label="Impact bullets">
          <Textarea
            value={linesToText(entry.description)}
            placeholder={"One achievement per line"}
            onChange={(event) =>
              onChange({
                ...entry,
                description: splitLines(event.target.value),
              })
            }
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function EducationEntryCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeEducation;
  onChange: (next: ResumeEducation) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-sm">
            {entry.school || "New school"}
          </CardTitle>
          <CardDescription>{entry.degree || "Degree"}</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="School">
            <Input
              value={entry.school}
              onChange={(event) =>
                onChange({ ...entry, school: event.target.value })
              }
            />
          </Field>
          <Field label="Degree">
            <Input
              value={entry.degree}
              onChange={(event) =>
                onChange({ ...entry, degree: event.target.value })
              }
            />
          </Field>
          <Field label="Field">
            <Input
              value={entry.field ?? ""}
              onChange={(event) =>
                onChange({ ...entry, field: event.target.value })
              }
            />
          </Field>
          <Field label="Start date">
            <Input
              value={entry.startDate}
              onChange={(event) =>
                onChange({ ...entry, startDate: event.target.value })
              }
            />
          </Field>
          <Field label="End date">
            <Input
              value={entry.endDate ?? ""}
              onChange={(event) =>
                onChange({ ...entry, endDate: event.target.value })
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumeConstructor() {
  const [resume, setResume] = useState<ResumeData>(defaultResumeData);
  const [template, setTemplate] = useState<ResumeTemplateId>("classic");
  const [colorScheme, setColorScheme] = useState<ResumeColorSchemeId>("slate");
  const exportPayload = useMemo<ResumeExportPayload>(
    () => ({ resume, template, colorScheme }),
    [resume, template, colorScheme],
  );
  const { mutate: downloadResumePdf, isPending: isExportingPdf } =
    useDownloadResumePdf(exportPayload);

  const selectedScheme = useMemo(
    () =>
      resumeColorSchemes.find((scheme) => scheme.id === colorScheme) ??
      resumeColorSchemes[0],
    [colorScheme],
  );

  const setPersonalInfo = (
    key: keyof ResumeData["personalInfo"],
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        [key]: value,
      },
    }));
  };

  const addExperience = () => {
    setResume((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: createId("exp"),
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: [""],
        },
      ],
    }));
  };

  const addEducation = () => {
    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: createId("edu"),
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <Container
        variant="fullMobileConstrainedBreakpointPadded"
        className="grid flex-1 min-h-0 w-full max-w-none grid-rows-[auto,1fr] px-0 py-6"
      >
        <div className="grid min-h-0 min-w-0 gap-6 xl:grid-cols-[minmax(0,0.80fr)_minmax(420px,1.20fr)]">
          <section className="space-y-6">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Resume constructor
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Professional CV builder
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Edit structured resume data on the left and keep the A4 PDF
                    preview in sync on the right. The PDF renderer is isolated
                    so a future Puppeteer export can reuse the same document
                    component.
                  </p>
                </div>
              </div>
            </div>
            <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="size-4" />
                  Layout and palette
                </CardTitle>
                <CardDescription>
                  Switch between two professional templates and update the
                  accent color family.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <Tabs
                  value={template}
                  onValueChange={(value) =>
                    setTemplate(value as ResumeTemplateId)
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    {resumeTemplates.map((option) => (
                      <TabsTrigger key={option.id} value={option.id}>
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {resumeTemplates.map((option) => (
                    <TabsContent
                      key={option.id}
                      value={option.id}
                      className="mt-3"
                    >
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <Field label="Color scheme">
                  <Select
                    value={colorScheme}
                    onValueChange={(value) =>
                      setColorScheme(value as ResumeColorSchemeId)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeColorSchemes.map((scheme) => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base">
                  Personal information
                </CardTitle>
                <CardDescription>
                  Used for the header, contact row, and linked metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
                <Field label="Full name">
                  <Input
                    value={resume.personalInfo.fullName}
                    onChange={(event) =>
                      setPersonalInfo("fullName", event.target.value)
                    }
                  />
                </Field>
                <Field label="Headline">
                  <Input
                    value={resume.personalInfo.title}
                    onChange={(event) =>
                      setPersonalInfo("title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={resume.personalInfo.email}
                    onChange={(event) =>
                      setPersonalInfo("email", event.target.value)
                    }
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={resume.personalInfo.phone ?? ""}
                    onChange={(event) =>
                      setPersonalInfo("phone", event.target.value)
                    }
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={resume.personalInfo.location ?? ""}
                    onChange={(event) =>
                      setPersonalInfo("location", event.target.value)
                    }
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={resume.personalInfo.website ?? ""}
                    onChange={(event) =>
                      setPersonalInfo("website", event.target.value)
                    }
                  />
                </Field>
                <Field label="LinkedIn">
                  <Input
                    value={resume.personalInfo.linkedin ?? ""}
                    onChange={(event) =>
                      setPersonalInfo("linkedin", event.target.value)
                    }
                  />
                </Field>
                <Field label="GitHub">
                  <Input
                    value={resume.personalInfo.github ?? ""}
                    onChange={(event) =>
                      setPersonalInfo("github", event.target.value)
                    }
                  />
                </Field>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base">Summary</CardTitle>
                <CardDescription>
                  One concise paragraph that frames the profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  value={resume.summary ?? ""}
                  onChange={(event) =>
                    setResume((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  placeholder="Experienced product designer with a track record of..."
                  className="min-h-28"
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BriefcaseBusiness className="size-4" />
                    Experience
                  </CardTitle>
                  <CardDescription>
                    Highlight impact, scope, and progression.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                >
                  <Plus className="size-4" />
                  Add role
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {resume.experience.map((entry) => (
                  <ResumeEntryCard
                    key={entry.id}
                    entry={entry}
                    onChange={(next) =>
                      setResume((current) => ({
                        ...current,
                        experience: updateExperience(
                          current.experience,
                          entry.id,
                          () => next,
                        ),
                      }))
                    }
                    onRemove={() =>
                      setResume((current) => ({
                        ...current,
                        experience: current.experience.filter(
                          (item) => item.id !== entry.id,
                        ),
                      }))
                    }
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                  <CardTitle className="text-base">Education</CardTitle>
                  <CardDescription>
                    Keep it short and professional.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                >
                  <Plus className="size-4" />
                  Add degree
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {resume.education.map((entry) => (
                  <EducationEntryCard
                    key={entry.id}
                    entry={entry}
                    onChange={(next) =>
                      setResume((current) => ({
                        ...current,
                        education: updateEducation(
                          current.education,
                          entry.id,
                          () => next,
                        ),
                      }))
                    }
                    onRemove={() =>
                      setResume((current) => ({
                        ...current,
                        education: current.education.filter(
                          (item) => item.id !== entry.id,
                        ),
                      }))
                    }
                  />
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <ListEditor
                label="Skills"
                icon={
                  <Badge variant="secondary" className="h-6 gap-1.5 px-2">
                    <span>01</span>
                  </Badge>
                }
                values={resume.skills}
                onChange={(next) =>
                  setResume((current) => ({ ...current, skills: next }))
                }
                placeholder="Strategic storytelling"
              />

              <ListEditor
                label="Languages"
                icon={<Languages className="size-4 text-muted-foreground" />}
                values={resume.languages ?? []}
                onChange={(next) =>
                  setResume((current) => ({ ...current, languages: next }))
                }
                placeholder="English"
              />
            </div>
          </section>

          <section className="relative min-w-0 w-full">
            <div className="sticky top-0 h-[calc(100dvh-8rem)] w-full">
              <div className="absolute inset-0 py-20">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5">
                    <LayoutTemplate className="size-3.5" />
                    {template === "classic"
                      ? "Classic sidebar"
                      : "Modern editorial"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1.5"
                    style={{
                      borderColor: selectedScheme.border,
                      color: selectedScheme.accent,
                    }}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: selectedScheme.accent }}
                    />
                    {selectedScheme.label}
                  </Badge>
                </div>
                {/* <PreviewSurface
                  resume={resume}
                  template={template}
                  colorScheme={colorScheme}
                /> */}
              </div>
              <ResumePdfPreview
                className="w-full overflow-hidden"
                resume={resume}
                template={template}
                colorScheme={colorScheme}
                isExporting={isExportingPdf}
                onExport={() => downloadResumePdf()}
              />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
