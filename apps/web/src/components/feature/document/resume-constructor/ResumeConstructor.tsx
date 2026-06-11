"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Award,
  BriefcaseBusiness,
  FolderGit2,
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
import { useEnrichedMe } from "@/hooks/auth/useEnrichedMe";
import { useDownloadResumePdf } from "@/hooks/document/useDownloadResumePdf";
import { useGetResume } from "@/hooks/document/useGetResume";
import { useSaveResume } from "@/hooks/document/useSaveResume";

import {
  defaultResumeData,
  type ResumeCertification,
  type ResumeExportPayload,
  resumeColorSchemes,
  resumeTemplates,
  type ResumeColorSchemeId,
  type ResumeData,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeProject,
  type ResumeTemplateId,
} from "@/shared/resume-constructor-data";

import { ResumePdfPreview } from "./ResumePdfPreview";

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

function updateProject(
  list: ResumeProject[],
  id: string,
  updater: (entry: ResumeProject) => ResumeProject,
) {
  return list.map((entry) => (entry.id === id ? updater(entry) : entry));
}

function updateCertification(
  list: ResumeCertification[],
  id: string,
  updater: (entry: ResumeCertification) => ResumeCertification,
) {
  return list.map((entry) => (entry.id === id ? updater(entry) : entry));
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => tagsToText(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setText(tagsToText(value));
  }, [value]);

  return (
    <Input
      value={text}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        const tags = splitTags(next);
        lastEmitted.current = tags;
        onChange(tags);
      }}
    />
  );
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

function ProjectEntryCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeProject;
  onChange: (next: ResumeProject) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-sm">
            {entry.name || "New project"}
          </CardTitle>
          <CardDescription>{entry.link || "Link"}</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Project name">
            <Input
              value={entry.name}
              onChange={(event) =>
                onChange({ ...entry, name: event.target.value })
              }
            />
          </Field>
          <Field label="Link">
            <Input
              value={entry.link ?? ""}
              placeholder="github.com/you/project"
              onChange={(event) =>
                onChange({ ...entry, link: event.target.value })
              }
            />
          </Field>
          <Field label="Start date">
            <Input
              value={entry.startDate ?? ""}
              placeholder="2023"
              onChange={(event) =>
                onChange({ ...entry, startDate: event.target.value })
              }
            />
          </Field>
          <Field label="End date">
            <Input
              value={entry.endDate ?? ""}
              placeholder="2024"
              onChange={(event) =>
                onChange({ ...entry, endDate: event.target.value })
              }
            />
          </Field>
        </div>

        <Field label="Technologies">
          <TagsInput
            value={entry.technologies ?? []}
            placeholder="React, TypeScript, Node.js"
            onChange={(tags) =>
              onChange({
                ...entry,
                technologies: tags,
              })
            }
          />
        </Field>

        <Field label="Highlights">
          <Textarea
            value={linesToText(entry.description)}
            placeholder={"One highlight per line"}
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

function CertificationEntryCard({
  entry,
  onChange,
  onRemove,
}: {
  entry: ResumeCertification;
  onChange: (next: ResumeCertification) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-sm">
            {entry.name || "New certification"}
          </CardTitle>
          <CardDescription>{entry.issuer || "Issuer"}</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <Input
              value={entry.name}
              onChange={(event) =>
                onChange({ ...entry, name: event.target.value })
              }
            />
          </Field>
          <Field label="Issuer">
            <Input
              value={entry.issuer}
              onChange={(event) =>
                onChange({ ...entry, issuer: event.target.value })
              }
            />
          </Field>
          <Field label="Date">
            <Input
              value={entry.date ?? ""}
              placeholder="2022"
              onChange={(event) =>
                onChange({ ...entry, date: event.target.value })
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumeConstructor({ documentId }: { documentId?: string } = {}) {
  const { data: existingResume } = useGetResume(documentId ?? "");
  console.log({existingResume})
  const { data: userProfile } = useEnrichedMe();
  const { mutate: saveResume, isPending: isSavingResume } = useSaveResume(
    documentId ?? "",
  );

  const [resume, setResume] = useState<ResumeData>(defaultResumeData);
  const [template, setTemplate] = useState<ResumeTemplateId>("classic");
  const [colorScheme, setColorScheme] = useState<ResumeColorSchemeId>("slate");
  const [appliedResume, setAppliedResume] = useState<ResumeExportPayload | null>(null);
  const [profileApplied, setProfileApplied] = useState(false);

  if (existingResume && existingResume !== appliedResume) {
    setAppliedResume(existingResume);
    setResume(existingResume.resume);
    setTemplate(existingResume.template ?? "classic");
    setColorScheme(existingResume.colorScheme ?? "slate");
  }

  if (existingResume === null && !profileApplied && userProfile) {
    setProfileApplied(true);
    const fullName = [userProfile.firstName, userProfile.lastName]
      .filter(Boolean)
      .join(" ");
    const location = [userProfile.city, userProfile.state, userProfile.country]
      .filter(Boolean)
      .join(", ");
    setResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...(fullName && { fullName }),
        email: userProfile.email,
        ...(userProfile.phone && { phone: userProfile.phone }),
        ...(location && { location }),
        ...(userProfile.portfolio && { website: userProfile.portfolio }),
        ...(userProfile.linkedIn && { linkedin: userProfile.linkedIn }),
      },
    }));
  }

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

  const addProject = () => {
    setResume((current) => ({
      ...current,
      projects: [
        ...(current.projects ?? []),
        {
          id: createId("proj"),
          name: "",
          description: [""],
          technologies: [],
          link: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const addCertification = () => {
    setResume((current) => ({
      ...current,
      certifications: [
        ...(current.certifications ?? []),
        {
          id: createId("cert"),
          name: "",
          issuer: "",
          date: "",
        },
      ],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="mx-auto grid min-h-full w-full min-w-0 max-w-screen-xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(340px,30vw,460px)]">
          <section className="flex min-w-0 flex-col">
            <div className="shrink-0 mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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
              {documentId ? (
                <Button
                  type="button"
                  onClick={() => saveResume(exportPayload)}
                  disabled={isSavingResume}
                >
                  {isSavingResume ? "Saving..." : "Save resume"}
                </Button>
              ) : null}
            </div>

            <div>
              <div className="space-y-6">
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FolderGit2 className="size-4" />
                        Projects
                      </CardTitle>
                      <CardDescription>
                        Showcase work that demonstrates real-world impact.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProject}
                    >
                      <Plus className="size-4" />
                      Add project
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {(resume.projects ?? []).map((entry) => (
                      <ProjectEntryCard
                        key={entry.id}
                        entry={entry}
                        onChange={(next) =>
                          setResume((current) => ({
                            ...current,
                            projects: updateProject(
                              current.projects ?? [],
                              entry.id,
                              () => next,
                            ),
                          }))
                        }
                        onRemove={() =>
                          setResume((current) => ({
                            ...current,
                            projects: (current.projects ?? []).filter(
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

                <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
                  <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/50 pb-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Award className="size-4" />
                        Certifications
                      </CardTitle>
                      <CardDescription>
                        Add credentials that build trust with recruiters.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCertification}
                    >
                      <Plus className="size-4" />
                      Add certification
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {(resume.certifications ?? []).map((entry) => (
                      <CertificationEntryCard
                        key={entry.id}
                        entry={entry}
                        onChange={(next) =>
                          setResume((current) => ({
                            ...current,
                            certifications: updateCertification(
                              current.certifications ?? [],
                              entry.id,
                              () => next,
                            ),
                          }))
                        }
                        onRemove={() =>
                          setResume((current) => ({
                            ...current,
                            certifications: (current.certifications ?? []).filter(
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
                    icon={
                      <Languages className="size-4 text-muted-foreground" />
                    }
                    values={resume.languages ?? []}
                    onChange={(next) =>
                      setResume((current) => ({
                        ...current,
                        languages: next,
                      }))
                    }
                    placeholder="English"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-w-0 xl:w-[clamp(340px,30vw,460px)] xl:shrink-0">
            <div className="flex w-full flex-col xl:sticky xl:top-6 xl:h-[calc(100dvh-9.5rem)]">
              <div className="shrink-0 flex flex-wrap items-center gap-2 pb-4">
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
              <ResumePdfPreview
                className="h-full w-full overflow-hidden"
                resume={resume}
                template={template}
                colorScheme={colorScheme}
                isExporting={isExportingPdf}
                onExport={() => downloadResumePdf()}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
