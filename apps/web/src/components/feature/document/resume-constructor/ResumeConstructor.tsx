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

import { toast } from "sonner";

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

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_HEADER = {
  badge: "Resume constructor",
  title: "Professional CV builder",
  description:
    "Edit structured resume data on the left and keep the A4 PDF preview in sync on the right. The PDF renderer is isolated so a future Puppeteer export can reuse the same document component.",
} as const;

const PERSONAL_INFO_FIELDS: Array<{
  key: keyof ResumeData["personalInfo"];
  label: string;
}> = [
  { key: "fullName", label: "Full name" },
  { key: "title", label: "Headline" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
];

const LIST_EDITOR_CONFIGS: Array<{
  key: "skills" | "languages";
  label: string;
  icon: ReactNode;
  placeholder: string;
}> = [
  {
    key: "skills",
    label: "Skills",
    icon: (
      <Badge variant="secondary" className="h-6 gap-1.5 px-2">
        <span>01</span>
      </Badge>
    ),
    placeholder: "Strategic storytelling",
  },
  {
    key: "languages",
    label: "Languages",
    icon: <Languages className="size-4 text-muted-foreground" />,
    placeholder: "English",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function updateById<T extends { id: string }>(
  list: T[],
  id: string,
  updater: (entry: T) => T,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
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
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
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
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
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
            onChange={(tags) => onChange({ ...entry, technologies: tags })}
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
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 pb-4">
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

type SectionConfig = {
  key: string;
  icon?: ReactNode;
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  count: number;
  children: ReactNode;
};

function SectionCard({
  icon,
  title,
  description,
  addLabel,
  onAdd,
  count,
  children,
}: Omit<SectionConfig, "key">) {
  return (
    <Card className="border-border/60 bg-card/75 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <CardTitle
            className={cn("text-base", icon && "flex items-center gap-2")}
          >
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className={count ? "space-y-4 pt-4" : "hidden"}>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SAVE_TOAST_ID = "resume-unsaved-changes";

export function ResumeConstructor({ documentId }: { documentId?: string } = {}) {
  const { data: existingResume } = useGetResume(documentId ?? "");
  const { data: userProfile } = useEnrichedMe();
  const { mutate: saveResume } = useSaveResume(documentId ?? "");

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

  const exportPayloadRef = useRef(exportPayload);
  useEffect(() => {
    exportPayloadRef.current = exportPayload;
  }, [exportPayload]);

  const savedPayloadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!documentId) return;
    if (existingResume === undefined) return;
    if (existingResume === null && !profileApplied) return;

    const payloadStr = JSON.stringify(exportPayload);

    if (savedPayloadRef.current === null) {
      savedPayloadRef.current = payloadStr;
      return;
    }

    if (payloadStr !== savedPayloadRef.current) {
      toast("Unsaved changes", {
        id: SAVE_TOAST_ID,
        duration: Infinity,
        action: {
          label: "Save",
          onClick: () => {
            const payload = exportPayloadRef.current;
            saveResume(payload, {
              onSuccess: (saved) => {
                savedPayloadRef.current = JSON.stringify(saved);
                toast.dismiss(SAVE_TOAST_ID);
                toast.success("Resume saved");
              },
            });
          },
        },
      });
    } else {
      toast.dismiss(SAVE_TOAST_ID);
    }
  }, [exportPayload, existingResume, documentId, profileApplied, saveResume]);

  useEffect(() => {
    return () => {
      toast.dismiss(SAVE_TOAST_ID);
    };
  }, []);

  const setPersonalInfo = (
    key: keyof ResumeData["personalInfo"],
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      personalInfo: { ...current.personalInfo, [key]: value },
    }));
  };

  const addExperience = () =>
    setResume((c) => ({
      ...c,
      experience: [
        ...c.experience,
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

  const addEducation = () =>
    setResume((c) => ({
      ...c,
      education: [
        ...c.education,
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

  const addProject = () =>
    setResume((c) => ({
      ...c,
      projects: [
        ...(c.projects ?? []),
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

  const addCertification = () =>
    setResume((c) => ({
      ...c,
      certifications: [
        ...(c.certifications ?? []),
        { id: createId("cert"), name: "", issuer: "", date: "" },
      ],
    }));

  const sections: SectionConfig[] = [
    {
      key: "experience",
      icon: <BriefcaseBusiness className="size-4" />,
      title: "Experience",
      description: "Highlight impact, scope, and progression.",
      addLabel: "Add role",
      onAdd: addExperience,
      count: resume.experience.length,
      children: resume.experience.map((entry) => (
        <ResumeEntryCard
          key={entry.id}
          entry={entry}
          onChange={(next) =>
            setResume((c) => ({
              ...c,
              experience: updateById(c.experience, entry.id, () => next),
            }))
          }
          onRemove={() =>
            setResume((c) => ({
              ...c,
              experience: c.experience.filter((x) => x.id !== entry.id),
            }))
          }
        />
      )),
    },
    {
      key: "projects",
      icon: <FolderGit2 className="size-4" />,
      title: "Projects",
      description: "Showcase work that demonstrates real-world impact.",
      addLabel: "Add project",
      onAdd: addProject,
      count: (resume.projects ?? []).length,
      children: (resume.projects ?? []).map((entry) => (
        <ProjectEntryCard
          key={entry.id}
          entry={entry}
          onChange={(next) =>
            setResume((c) => ({
              ...c,
              projects: updateById(c.projects ?? [], entry.id, () => next),
            }))
          }
          onRemove={() =>
            setResume((c) => ({
              ...c,
              projects: (c.projects ?? []).filter((x) => x.id !== entry.id),
            }))
          }
        />
      )),
    },
    {
      key: "education",
      title: "Education",
      description: "Keep it short and professional.",
      addLabel: "Add degree",
      onAdd: addEducation,
      count: resume.education.length,
      children: resume.education.map((entry) => (
        <EducationEntryCard
          key={entry.id}
          entry={entry}
          onChange={(next) =>
            setResume((c) => ({
              ...c,
              education: updateById(c.education, entry.id, () => next),
            }))
          }
          onRemove={() =>
            setResume((c) => ({
              ...c,
              education: c.education.filter((x) => x.id !== entry.id),
            }))
          }
        />
      )),
    },
    {
      key: "certifications",
      icon: <Award className="size-4" />,
      title: "Certifications",
      description: "Add credentials that build trust with recruiters.",
      addLabel: "Add certification",
      onAdd: addCertification,
      count: (resume.certifications ?? []).length,
      children: (resume.certifications ?? []).map((entry) => (
        <CertificationEntryCard
          key={entry.id}
          entry={entry}
          onChange={(next) =>
            setResume((c) => ({
              ...c,
              certifications: updateById(
                c.certifications ?? [],
                entry.id,
                () => next,
              ),
            }))
          }
          onRemove={() =>
            setResume((c) => ({
              ...c,
              certifications: (c.certifications ?? []).filter(
                (x) => x.id !== entry.id,
              ),
            }))
          }
        />
      )),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="mx-auto grid min-h-full w-full min-w-0 max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(340px,30vw,460px)]">
          <section className="flex min-w-0 flex-col">
            <div className="shrink-0 mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  {PAGE_HEADER.badge}
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {PAGE_HEADER.title}
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {PAGE_HEADER.description}
                  </p>
                </div>
              </div>
            </div>

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
                    <TabsList className="grid w-full grid-cols-3">
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
                    <div
                      role="radiogroup"
                      aria-label="Color scheme"
                      className="flex flex-wrap gap-2"
                    >
                      {resumeColorSchemes.map((scheme) => (
                        <button
                          key={scheme.id}
                          type="button"
                          role="radio"
                          aria-checked={colorScheme === scheme.id}
                          onClick={() => setColorScheme(scheme.id)}
                          title={scheme.label}
                          className={cn(
                            "size-7 rounded-full transition-all",
                            colorScheme === scheme.id
                              ? "scale-110 ring-2 ring-primary ring-offset-2"
                              : "opacity-70 hover:scale-105 hover:opacity-100",
                          )}
                          style={{ backgroundColor: scheme.accent }}
                        />
                      ))}
                    </div>
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
                  {PERSONAL_INFO_FIELDS.map(({ key, label }) => (
                    <Field key={key} label={label}>
                      <Input
                        value={resume.personalInfo[key] ?? ""}
                        onChange={(event) =>
                          setPersonalInfo(key, event.target.value)
                        }
                      />
                    </Field>
                  ))}
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

              {sections.map(({ key, ...section }) => (
                <SectionCard key={key} {...section} />
              ))}

              <div className="grid gap-6 md:grid-cols-2">
                {LIST_EDITOR_CONFIGS.map(
                  ({ key, label, icon, placeholder }) => (
                    <ListEditor
                      key={key}
                      label={label}
                      icon={icon}
                      placeholder={placeholder}
                      values={(resume[key] ?? []) as string[]}
                      onChange={(next) =>
                        setResume((c) => ({ ...c, [key]: next }))
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </section>

          <section className="flex min-w-0 xl:w-[clamp(340px,30vw,460px)] xl:shrink-0">
            <div className="flex w-full flex-col xl:sticky xl:top-6 xl:h-[calc(100dvh-9.5rem)]">
              <div className="hidden shrink-0 flex-wrap items-center gap-2 pb-4 xl:flex">
                <Badge variant="secondary" className="gap-1.5">
                  <LayoutTemplate className="size-3.5" />
                  {resumeTemplates.find((t) => t.id === template)?.label ??
                    template}
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
              <ResumePdfPreview
                className="hidden h-full w-full overflow-hidden xl:flex"
                resume={resume}
                template={template}
                colorScheme={colorScheme}
                isExporting={isExportingPdf}
                onExport={() => downloadResumePdf()}
                showFixedMobileActions
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
