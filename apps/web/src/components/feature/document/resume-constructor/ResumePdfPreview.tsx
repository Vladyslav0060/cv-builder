"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
  ResumeColorSchemeId,
  ResumeData,
  ResumeTemplateId,
} from "@/shared/resume-constructor-data";
import { resumeColorSchemes } from "@/shared/resume-constructor-data";
import {
  RESUME_A4_HEIGHT_PX,
  RESUME_A4_WIDTH_PX,
  RESUME_PREVIEW_PADDING_PX,
  resumeConstructorLayout,
} from "@/shared/resume-constructor-layout";

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

type Theme = (typeof resumeColorSchemes)[number];

function getTheme(colorScheme: ResumeColorSchemeId): Theme {
  return (
    resumeColorSchemes.find((scheme) => scheme.id === colorScheme) ??
    resumeColorSchemes[0]
  );
}

function formatDateRange(
  startDate: string,
  endDate?: string,
  isCurrent?: boolean,
) {
  if (isCurrent) {
    return `${startDate} - Present`;
  }

  if (!endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function toHref(value: string) {
  if (/^https?:\/\//.test(value)) return value;
  if (value.includes("@") && !value.startsWith("mailto:")) {
    return `mailto:${value}`;
  }
  if (/^\+?[\d\s().-]+$/.test(value)) {
    return `tel:${value.replace(/\s+/g, "")}`;
  }
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

function isPresent(value: string | undefined | null): value is string {
  return Boolean(value);
}

function PageFrame({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <div
      className="mx-auto overflow-hidden rounded-sm bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
      style={{
        width: RESUME_A4_WIDTH_PX,
        minHeight: RESUME_A4_HEIGHT_PX,
        color: theme.ink,
        backgroundColor: theme.paper,
      }}
    >
      {children}
    </div>
  );
}

function ClassicPreview({
  resume,
  theme,
}: {
  resume: ResumeData;
  theme: Theme;
}) {
  const classic = resumeConstructorLayout.classic;

  return (
    <PageFrame theme={theme}>
      <div className="flex min-h-[1123px]">
        <aside
          className="shrink-0 border-r"
          style={{
            backgroundColor: theme.accentMuted,
            borderRightColor: theme.border,
            width: classic.sidebarWidthPx,
          }}
        >
          <div
            className="space-y-4"
            style={{
              paddingLeft: classic.sidebarPaddingHorizontalPx,
              paddingRight: classic.sidebarPaddingHorizontalPx,
              paddingTop: classic.sidebarPaddingVerticalPx,
              paddingBottom: classic.sidebarPaddingVerticalPx,
            }}
          >
            <div className="mb-6">
              <h2
                className="font-bold leading-[1.05]"
                style={{
                  fontSize: classic.nameFontSizePx,
                  letterSpacing: -0.4,
                }}
              >
                {resume.personalInfo.fullName}
              </h2>
              <p
                className="mt-1 font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.titleFontSizePx,
                  letterSpacing: classic.titleLetterSpacingPx,
                }}
              >
                {resume.personalInfo.title}
              </p>
            </div>

            <section className="space-y-2">
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.sectionTitleFontSizePx,
                  letterSpacing: classic.sectionTitleLetterSpacingPx,
                }}
              >
                Contact
              </h3>
              <div
                className="space-y-1 leading-[1.35]"
                style={{ fontSize: classic.contactFontSizePx }}
              >
                {[
                  resume.personalInfo.email,
                  resume.personalInfo.phone,
                  resume.personalInfo.location,
                  resume.personalInfo.website,
                  resume.personalInfo.linkedin,
                  resume.personalInfo.github,
                ]
                  .filter(isPresent)
                  .map((item) => (
                    <div key={item}>
                      <a href={toHref(item)} className="hover:underline">
                        {item}
                      </a>
                    </div>
                  ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.sectionTitleFontSizePx,
                  letterSpacing: classic.sectionTitleLetterSpacingPx,
                }}
              >
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.filter(Boolean).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.paper,
                      fontSize: classic.skillChipFontSizePx,
                      paddingLeft: classic.skillChipHorizontalPaddingPx,
                      paddingRight: classic.skillChipHorizontalPaddingPx,
                      paddingTop: classic.skillChipVerticalPaddingPx,
                      paddingBottom: classic.skillChipVerticalPaddingPx,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {resume.languages?.length ? (
              <section className="space-y-2">
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: classic.sectionTitleFontSizePx,
                    letterSpacing: classic.sectionTitleLetterSpacingPx,
                  }}
                >
                  Languages
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.languages.filter(Boolean).map((language) => (
                    <span
                      key={language}
                      className="rounded-full border"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.paper,
                        fontSize: classic.skillChipFontSizePx,
                        paddingLeft: classic.skillChipHorizontalPaddingPx,
                        paddingRight: classic.skillChipHorizontalPaddingPx,
                        paddingTop: classic.skillChipVerticalPaddingPx,
                        paddingBottom: classic.skillChipVerticalPaddingPx,
                      }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {!!resume.education.length ? (
              <section className="space-y-2">
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: classic.sectionTitleFontSizePx,
                    letterSpacing: classic.sectionTitleLetterSpacingPx,
                  }}
                >
                  Education
                </h3>
                <div className="space-y-3">
                  {resume.education.map((education) => (
                    <div key={education.id} className="space-y-0.5">
                      <p
                        className="font-bold"
                        style={{ fontSize: classic.educationTitleFontSizePx }}
                      >
                        {education.school}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{ fontSize: classic.educationMetaFontSizePx }}
                      >
                        {education.degree}
                        {education.field ? `, ${education.field}` : ""}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{ fontSize: classic.educationMetaFontSizePx }}
                      >
                        {formatDateRange(
                          education.startDate,
                          education.endDate,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </aside>

        <main
          className="min-w-0 flex-1"
          style={{
            paddingLeft: classic.contentPaddingHorizontalPx,
            paddingRight: classic.contentPaddingHorizontalPx,
            paddingTop: classic.contentPaddingVerticalPx,
            paddingBottom: classic.contentPaddingVerticalPx,
          }}
        >
          {resume.summary ? (
            <section className="space-y-2">
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.sectionTitleFontSizePx,
                  letterSpacing: classic.sectionTitleLetterSpacingPx,
                }}
              >
                Profile
              </h3>
              <p
                style={{
                  fontSize: classic.paragraphFontSizePx,
                  lineHeight: 1.42,
                }}
              >
                {resume.summary}
              </p>
            </section>
          ) : null}

          {resume.summary ? (
            <div
              className="my-4 border-t"
              style={{ borderTopColor: theme.border }}
            />
          ) : null}

          {!!resume.experience.length ? (
            <section className="space-y-2">
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.sectionTitleFontSizePx,
                  letterSpacing: classic.sectionTitleLetterSpacingPx,
                }}
              >
                Experience
              </h3>
              <div className="space-y-3">
                {resume.experience.map((experience, index) => (
                  <div key={experience.id}>
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4
                          className="font-bold"
                          style={{ fontSize: classic.roleTitleFontSizePx }}
                        >
                          {experience.position}
                        </h4>
                        <p
                          className="mt-0.5 font-bold"
                          style={{
                            color: theme.accent,
                            fontSize: classic.companyFontSizePx,
                          }}
                        >
                          {experience.company}
                        </p>
                      </div>
                      <p
                        className="whitespace-pre-line text-right text-slate-600"
                        style={{ fontSize: classic.roleMetaFontSizePx }}
                      >
                        {formatDateRange(
                          experience.startDate,
                          experience.endDate,
                          experience.isCurrent,
                        )}
                        {experience.location ? `\n${experience.location}` : ""}
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {experience.description.filter(Boolean).map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 leading-[1.34]"
                          style={{ fontSize: classic.paragraphFontSizePx }}
                        >
                          <span
                            className="mt-[2px]"
                            style={{ color: theme.accent }}
                          >
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {index < resume.experience.length - 1 ? (
                      <div
                        className="my-3 border-t"
                        style={{ borderTopColor: theme.border }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </PageFrame>
  );
}

function ModernPreview({
  resume,
  theme,
}: {
  resume: ResumeData;
  theme: Theme;
}) {
  const modern = resumeConstructorLayout.modern;

  return (
    <PageFrame theme={theme}>
      <header
        className="border-b"
        style={{
          backgroundColor: theme.accentMuted,
          borderBottomColor: theme.border,
          paddingLeft: modern.headerHorizontalPaddingPx,
          paddingRight: modern.headerHorizontalPaddingPx,
          paddingTop: modern.headerVerticalPaddingPx,
          paddingBottom: 16,
        }}
      >
        <div className="flex flex-col items-stretch">
          <div className="min-w-0">
            <h2
              className="font-bold leading-[1.02]"
              style={{
                fontSize: modern.titleFontSizePx,
                letterSpacing: modern.titleLetterSpacingPx,
              }}
            >
              {resume.personalInfo.fullName}
            </h2>
            <p
              className="mt-1 font-bold uppercase"
              style={{
                color: theme.accent,
                fontSize: modern.subtitleFontSizePx,
                letterSpacing: modern.subtitleLetterSpacingPx,
              }}
            >
              {resume.personalInfo.title}
            </p>
          </div>

          <div
            className="mt-3 grid grid-cols-2 gap-y-1"
            style={{
              columnGap: modern.contactGapPx,
              fontSize: modern.contactFontSizePx,
            }}
          >
            {[
              resume.personalInfo.email,
              resume.personalInfo.phone,
              resume.personalInfo.location,
              resume.personalInfo.website,
              resume.personalInfo.linkedin,
              resume.personalInfo.github,
            ]
              .filter(isPresent)
              .map((item) => (
                <a
                  key={item}
                  href={toHref(item)}
                  className="truncate hover:underline"
                >
                  {item}
                </a>
              ))}
          </div>
        </div>
      </header>

      <div
        style={{
          paddingLeft: modern.bodyHorizontalPaddingPx,
          paddingRight: modern.bodyHorizontalPaddingPx,
          paddingTop: modern.bodyVerticalPaddingPx,
          paddingBottom: modern.bodyVerticalPaddingPx,
        }}
      >
        {resume.summary ? (
          <section
            className="mb-3 rounded-[10px] border px-3 py-3"
            style={{ borderColor: theme.border }}
          >
            <h3
              className="font-bold uppercase"
              style={{
                color: theme.accent,
                fontSize: modern.sectionTitleFontSizePx,
                letterSpacing: modern.sectionTitleLetterSpacingPx,
              }}
            >
              Profile
            </h3>
            <p
              className="mt-2"
              style={{ fontSize: modern.paragraphFontSizePx, lineHeight: 1.42 }}
            >
              {resume.summary}
            </p>
          </section>
        ) : null}

        <div className="flex">
          <div
            className="min-w-0 pr-3"
            style={{ width: `${modern.leftColumnWidthPercent}%` }}
          >
            <section
              className="mb-3 rounded-[10px] border px-3 py-3"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: modern.sectionTitleFontSizePx,
                  letterSpacing: modern.sectionTitleLetterSpacingPx,
                }}
              >
                Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {resume.skills.filter(Boolean).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.accentMuted,
                      fontSize: modern.chipFontSizePx,
                      paddingLeft: modern.chipHorizontalPaddingPx,
                      paddingRight: modern.chipHorizontalPaddingPx,
                      paddingTop: modern.chipVerticalPaddingPx,
                      paddingBottom: modern.chipVerticalPaddingPx,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {resume.languages?.length ? (
              <section
                className="mb-3 rounded-[10px] border px-3 py-3"
                style={{ borderColor: theme.border }}
              >
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: modern.sectionTitleFontSizePx,
                    letterSpacing: modern.sectionTitleLetterSpacingPx,
                  }}
                >
                  Languages
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {resume.languages.filter(Boolean).map((language) => (
                    <span
                      key={language}
                      className="rounded-md border"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.accentMuted,
                        fontSize: modern.chipFontSizePx,
                        paddingLeft: modern.chipHorizontalPaddingPx,
                        paddingRight: modern.chipHorizontalPaddingPx,
                        paddingTop: modern.chipVerticalPaddingPx,
                        paddingBottom: modern.chipVerticalPaddingPx,
                      }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {!!resume.education.length ? (
              <section
                className="rounded-[10px] border px-3 py-3"
                style={{ borderColor: theme.border }}
              >
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: modern.sectionTitleFontSizePx,
                    letterSpacing: modern.sectionTitleLetterSpacingPx,
                  }}
                >
                  Education
                </h3>
                <div className="mt-2 space-y-3">
                  {resume.education.map((education) => (
                    <div key={education.id}>
                      <p
                        className="font-bold"
                        style={{ fontSize: modern.educationTitleFontSizePx }}
                      >
                        {education.school}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{ fontSize: modern.educationMetaFontSizePx }}
                      >
                        {education.degree}
                        {education.field ? `, ${education.field}` : ""}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{ fontSize: modern.educationMetaFontSizePx }}
                      >
                        {formatDateRange(
                          education.startDate,
                          education.endDate,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div
            className="min-w-0 pl-3"
            style={{ width: `${modern.rightColumnWidthPercent}%` }}
          >
            {!!resume.experience.length ? (
              <section
                className="rounded-[10px] border px-3 py-3"
                style={{ borderColor: theme.border }}
              >
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: modern.sectionTitleFontSizePx,
                    letterSpacing: modern.sectionTitleLetterSpacingPx,
                  }}
                >
                  Experience
                </h3>
                <div className="mt-2 space-y-3">
                  {resume.experience.map((experience, index) => (
                    <div key={experience.id}>
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4
                            className="font-bold"
                            style={{ fontSize: modern.roleTitleFontSizePx }}
                          >
                            {experience.position}
                          </h4>
                          <p
                            className="mt-0.5 font-bold"
                            style={{
                              color: theme.accent,
                              fontSize: modern.companyFontSizePx,
                            }}
                          >
                            {experience.company}
                          </p>
                        </div>
                        <p
                          className="whitespace-pre-line text-right text-slate-600"
                          style={{ fontSize: modern.roleMetaFontSizePx }}
                        >
                          {formatDateRange(
                            experience.startDate,
                            experience.endDate,
                            experience.isCurrent,
                          )}
                          {experience.location
                            ? `\n${experience.location}`
                            : ""}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {experience.description.filter(Boolean).map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 leading-[1.34]"
                            style={{ fontSize: modern.paragraphFontSizePx }}
                          >
                            <span
                              className="mt-[2px]"
                              style={{ color: theme.accent }}
                            >
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {index < resume.experience.length - 1 ? (
                        <div
                          className="my-3 border-t"
                          style={{ borderTopColor: theme.border }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

export function PreviewSurface({
  resume,
  template,
  colorScheme,
}: {
  resume: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
}) {
  const theme = getTheme(colorScheme);
  const { ref, size } = useElementSize<HTMLDivElement>();

  const scale = useMemo(() => {
    if (!size.width || !size.height) {
      return 1;
    }

    const availableWidth = Math.max(
      size.width - RESUME_PREVIEW_PADDING_PX * 2,
      1,
    );
    const availableHeight = Math.max(
      size.height - RESUME_PREVIEW_PADDING_PX * 2,
      1,
    );

    return Math.min(
      1,
      availableWidth / RESUME_A4_WIDTH_PX,
      availableHeight / RESUME_A4_HEIGHT_PX,
    );
  }, [size.height, size.width]);

  return (
    <div
      ref={ref}
      className="flex h-full min-h-0 w-full flex-1 overflow-hidden"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <div
          className="h-full shrink-0"
          style={{
            width: RESUME_A4_WIDTH_PX * scale,
            height: RESUME_A4_HEIGHT_PX * scale,
          }}
        >
          <div
            style={{
              width: RESUME_A4_WIDTH_PX,
              height: RESUME_A4_HEIGHT_PX,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {template === "classic" ? (
              <ClassicPreview resume={resume} theme={theme} />
            ) : (
              <ModernPreview resume={resume} theme={theme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumePdfPreview({
  className,
  resume,
  template,
  colorScheme,
  isExporting,
  onExport,
}: {
  className?: string;
  resume: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
  isExporting?: boolean;
  onExport?: () => void;
}) {
  return (
    <Card
      className={cn(
        "flex min-h-0 h-[calc(100vh-8rem)] flex-col border-border/60 bg-linear-to-b from-slate-100/80 to-slate-200/70 shadow-sm backdrop-blur",
        className,
      )}
    >
      <CardHeader className="flex w-full flex-row items-center justify-between border-b border-border/60 pb-4">
        <div className="flex min-w-0 flex-1">
          <CardTitle className="w-full text-base">PDF preview</CardTitle>
        </div>
        {onExport ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        {resume ? (
          <PreviewSurface
            resume={resume}
            template={template}
            colorScheme={colorScheme}
          />
        ) : (
          <div className="flex min-h-[72vh] items-center justify-center bg-slate-100/70 p-6 text-sm text-muted-foreground">
            Rendering preview...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
