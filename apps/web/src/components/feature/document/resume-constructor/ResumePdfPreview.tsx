"use client";

import { Download, LoaderCircle, Maximize2 } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const PREVIEW_MAGNIFIER_SCALE = 2.2;
const PREVIEW_MAGNIFIER_SIZE_PX = 240;

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

function useHasFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerMode = () => setHasFinePointer(mediaQuery.matches);

    updatePointerMode();
    mediaQuery.addEventListener("change", updatePointerMode);

    return () => {
      mediaQuery.removeEventListener("change", updatePointerMode);
    };
  }, []);

  return hasFinePointer;
}

type Theme = (typeof resumeColorSchemes)[number];

const themeById = new Map(
  resumeColorSchemes.map((scheme) => [scheme.id, scheme]),
);

function getTheme(colorScheme: ResumeColorSchemeId): Theme {
  return themeById.get(colorScheme) ?? resumeColorSchemes[0];
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

function MinimalSectionTitle({
  theme,
  label,
  style,
}: {
  theme: Theme;
  label: string;
  style: CSSProperties;
}) {
  return (
    <div className="mb-2 flex items-center gap-2" style={style}>
      <h3
        className="shrink-0 font-bold uppercase"
        style={{
          color: theme.accent,
          fontSize: style.fontSize,
          letterSpacing: style.letterSpacing,
        }}
      >
        {label}
      </h3>
      <div
        className="flex-1 border-t"
        style={{ borderTopColor: theme.border }}
      />
    </div>
  );
}

function MinimalPreview({
  resume,
  theme,
}: {
  resume: ResumeData;
  theme: Theme;
}) {
  const minimal = resumeConstructorLayout.minimal;
  const titleStyle: React.CSSProperties = {
    fontSize: minimal.sectionTitleFontSizePx,
    letterSpacing: minimal.sectionTitleLetterSpacingPx,
  };

  return (
    <PageFrame theme={theme}>
      <header
        className="border-b"
        style={{
          borderBottomColor: theme.border,
          paddingLeft: minimal.headerHorizontalPaddingPx,
          paddingRight: minimal.headerHorizontalPaddingPx,
          paddingTop: minimal.headerVerticalPaddingPx,
          paddingBottom: 18,
        }}
      >
        <h2
          className="font-bold leading-[1.05]"
          style={{
            fontSize: minimal.nameFontSizePx,
            letterSpacing: -0.4,
          }}
        >
          {resume.personalInfo.fullName}
        </h2>
        <p
          className="mt-1 font-bold uppercase"
          style={{
            color: theme.accent,
            fontSize: minimal.titleFontSizePx,
            letterSpacing: minimal.titleLetterSpacingPx,
            marginTop: minimal.titleTopMarginPx,
          }}
        >
          {resume.personalInfo.title}
        </p>
        <div
          className="flex flex-wrap items-center gap-x-1 gap-y-0.5"
          style={{
            marginTop: minimal.contactTopMarginPx,
            fontSize: minimal.contactFontSizePx,
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
            .map((item, index) => (
              <span key={item} className="flex items-center gap-x-1">
                {index > 0 ? (
                  <span style={{ color: theme.border }}>·</span>
                ) : null}
                <a href={toHref(item)} className="hover:underline">
                  {item}
                </a>
              </span>
            ))}
        </div>
      </header>

      <main
        style={{
          paddingLeft: minimal.bodyHorizontalPaddingPx,
          paddingRight: minimal.bodyHorizontalPaddingPx,
          paddingTop: minimal.bodyVerticalPaddingPx,
          paddingBottom: minimal.bodyVerticalPaddingPx,
        }}
        className="space-y-4"
      >
        {resume.summary ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Profile"
              style={titleStyle}
            />
            <p
              style={{
                fontSize: minimal.paragraphFontSizePx,
                lineHeight: 1.42,
              }}
            >
              {resume.summary}
            </p>
          </section>
        ) : null}

        {!!resume.experience.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Experience"
              style={titleStyle}
            />
            <div className="space-y-3">
              {resume.experience.map((experience) => (
                <div key={experience.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4
                        className="font-bold"
                        style={{ fontSize: minimal.roleTitleFontSizePx }}
                      >
                        {experience.position}
                      </h4>
                      <p
                        className="font-bold"
                        style={{
                          color: theme.accent,
                          fontSize: minimal.companyFontSizePx,
                        }}
                      >
                        {experience.company}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-right text-slate-500"
                      style={{ fontSize: minimal.roleMetaFontSizePx }}
                    >
                      {formatDateRange(
                        experience.startDate,
                        experience.endDate,
                        experience.isCurrent,
                      )}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {experience.description.filter(Boolean).map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 leading-[1.34]"
                        style={{ fontSize: minimal.paragraphFontSizePx }}
                      >
                        <span
                          className="mt-0.5"
                          style={{ color: theme.accent }}
                        >
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!!resume.projects?.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Projects"
              style={titleStyle}
            />
            <div className="space-y-3">
              {resume.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex items-start justify-between gap-3">
                    <h4
                      className="font-bold"
                      style={{ fontSize: minimal.projectTitleFontSizePx }}
                    >
                      {project.name}
                    </h4>
                    {project.startDate || project.endDate ? (
                      <p
                        className="shrink-0 text-right text-slate-500"
                        style={{ fontSize: minimal.projectMetaFontSizePx }}
                      >
                        {project.startDate
                          ? formatDateRange(project.startDate, project.endDate)
                          : project.endDate}
                      </p>
                    ) : null}
                  </div>
                  {project.link ? (
                    <p
                      className="text-slate-500"
                      style={{
                        fontSize: minimal.projectMetaFontSizePx,
                        marginTop: minimal.projectMetaTopMarginPx,
                      }}
                    >
                      <a
                        href={toHref(project.link)}
                        className="hover:underline"
                      >
                        {project.link}
                      </a>
                    </p>
                  ) : null}
                  <ul className="mt-1 space-y-1">
                    {project.description.filter(Boolean).map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 leading-[1.34]"
                        style={{ fontSize: minimal.paragraphFontSizePx }}
                      >
                        <span
                          className="mt-0.5"
                          style={{ color: theme.accent }}
                        >
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {project.technologies?.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border"
                          style={{
                            borderColor: theme.border,
                            backgroundColor: theme.accentMuted,
                            fontSize: minimal.techChipFontSizePx,
                            paddingLeft: minimal.techChipHorizontalPaddingPx,
                            paddingRight: minimal.techChipHorizontalPaddingPx,
                            paddingTop: minimal.techChipVerticalPaddingPx,
                            paddingBottom: minimal.techChipVerticalPaddingPx,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!!resume.education.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Education"
              style={titleStyle}
            />
            <div className="space-y-2">
              {resume.education.map((education) => (
                <div
                  key={education.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <p
                      className="font-bold"
                      style={{ fontSize: minimal.educationTitleFontSizePx }}
                    >
                      {education.school}
                    </p>
                    <p
                      className="text-slate-500"
                      style={{ fontSize: minimal.educationMetaFontSizePx }}
                    >
                      {education.degree}
                      {education.field ? `, ${education.field}` : ""}
                    </p>
                  </div>
                  <p
                    className="shrink-0 text-right text-slate-500"
                    style={{ fontSize: minimal.educationMetaFontSizePx }}
                  >
                    {formatDateRange(education.startDate, education.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!!resume.skills.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Skills"
              style={titleStyle}
            />
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.filter(Boolean).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.accentMuted,
                    fontSize: minimal.skillChipFontSizePx,
                    paddingLeft: minimal.skillChipHorizontalPaddingPx,
                    paddingRight: minimal.skillChipHorizontalPaddingPx,
                    paddingTop: minimal.skillChipVerticalPaddingPx,
                    paddingBottom: minimal.skillChipVerticalPaddingPx,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {!!resume.languages?.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Languages"
              style={titleStyle}
            />
            <div className="flex flex-wrap gap-1.5">
              {resume.languages.filter(Boolean).map((language) => (
                <span
                  key={language}
                  className="rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.accentMuted,
                    fontSize: minimal.skillChipFontSizePx,
                    paddingLeft: minimal.skillChipHorizontalPaddingPx,
                    paddingRight: minimal.skillChipHorizontalPaddingPx,
                    paddingTop: minimal.skillChipVerticalPaddingPx,
                    paddingBottom: minimal.skillChipVerticalPaddingPx,
                  }}
                >
                  {language}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {!!resume.certifications?.length ? (
          <section>
            <MinimalSectionTitle
              theme={theme}
              label="Certifications"
              style={titleStyle}
            />
            <div className="space-y-2">
              {resume.certifications.map((certification) => (
                <div key={certification.id}>
                  <p
                    className="font-bold"
                    style={{ fontSize: minimal.certificationTitleFontSizePx }}
                  >
                    {certification.name}
                  </p>
                  <p
                    className="text-slate-500"
                    style={{ fontSize: minimal.certificationMetaFontSizePx }}
                  >
                    {certification.issuer}
                    {certification.date ? ` · ${certification.date}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </PageFrame>
  );
}

const ResumePreviewPage = memo(function ResumePreviewPage({
  resume,
  template,
  theme,
}: {
  resume: ResumeData;
  template: ResumeTemplateId;
  theme: Theme;
}) {
  if (template === "classic")
    return <ClassicPreview resume={resume} theme={theme} />;
  if (template === "modern")
    return <ModernPreview resume={resume} theme={theme} />;
  return <MinimalPreview resume={resume} theme={theme} />;
});

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
      <div className="flex min-h-280.75">
        <aside
          className="shrink-0 border-r"
          style={{
            backgroundColor: theme.accentMuted,
            borderRightColor: theme.border,
            width: classic.sidebarWidthPx,
          }}
        >
          <div
            className="space-y-5"
            style={{
              paddingLeft: classic.sidebarPaddingHorizontalPx,
              paddingRight: classic.sidebarPaddingHorizontalPx,
              paddingTop: classic.sidebarPaddingVerticalPx,
              paddingBottom: classic.sidebarPaddingVerticalPx,
            }}
          >
            <div className="mb-7">
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

            <section className="space-y-3">
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

            <section className="space-y-3">
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
              <div className="flex flex-wrap gap-2">
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
              <section className="space-y-3">
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
                <div className="flex flex-wrap gap-2">
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
              <section className="space-y-3">
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
                <div className="space-y-4">
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

            {!!resume.certifications?.length ? (
              <section className="space-y-3">
                <h3
                  className="font-bold uppercase"
                  style={{
                    color: theme.accent,
                    fontSize: classic.sectionTitleFontSizePx,
                    letterSpacing: classic.sectionTitleLetterSpacingPx,
                  }}
                >
                  Certifications
                </h3>
                <div className="space-y-3">
                  {resume.certifications.map((certification) => (
                    <div key={certification.id} className="space-y-0.5">
                      <p
                        className="font-bold"
                        style={{
                          fontSize: classic.certificationTitleFontSizePx,
                        }}
                      >
                        {certification.name}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{
                          fontSize: classic.certificationMetaFontSizePx,
                        }}
                      >
                        {certification.issuer}
                        {certification.date ? ` · ${certification.date}` : ""}
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
            <section className="space-y-3">
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
              className="my-5 border-t"
              style={{ borderTopColor: theme.border }}
            />
          ) : null}

          {!!resume.experience.length ? (
            <section className="space-y-3">
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
              <div className="space-y-4">
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
                    <ul className="space-y-1.5">
                      {experience.description.filter(Boolean).map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 leading-[1.34]"
                          style={{ fontSize: classic.paragraphFontSizePx }}
                        >
                          <span
                            className="mt-0.5"
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
                        className="my-4 border-t"
                        style={{ borderTopColor: theme.border }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {!!resume.projects?.length ? (
            <section
              className="space-y-3"
              style={{ marginTop: classic.sectionTopMarginPx }}
            >
              <h3
                className="font-bold uppercase"
                style={{
                  color: theme.accent,
                  fontSize: classic.sectionTitleFontSizePx,
                  letterSpacing: classic.sectionTitleLetterSpacingPx,
                }}
              >
                Projects
              </h3>
              <div className="space-y-4">
                {resume.projects.map((project, index) => (
                  <div key={project.id}>
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h4
                        className="font-bold"
                        style={{ fontSize: classic.projectTitleFontSizePx }}
                      >
                        {project.name}
                      </h4>
                      {project.startDate || project.endDate ? (
                        <p
                          className="whitespace-pre-line text-right text-slate-600"
                          style={{ fontSize: classic.projectMetaFontSizePx }}
                        >
                          {project.startDate
                            ? formatDateRange(
                                project.startDate,
                                project.endDate,
                              )
                            : project.endDate}
                        </p>
                      ) : null}
                    </div>
                    {project.link ? (
                      <p
                        className="text-slate-600"
                        style={{
                          fontSize: classic.projectMetaFontSizePx,
                          marginTop: classic.projectMetaTopMarginPx,
                        }}
                      >
                        <a
                          href={toHref(project.link)}
                          className="hover:underline"
                        >
                          {project.link}
                        </a>
                      </p>
                    ) : null}
                    <ul className="mt-1.5 space-y-1.5">
                      {project.description.filter(Boolean).map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 leading-[1.34]"
                          style={{ fontSize: classic.paragraphFontSizePx }}
                        >
                          <span
                            className="mt-0.5"
                            style={{ color: theme.accent }}
                          >
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {project.technologies?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border"
                            style={{
                              borderColor: theme.border,
                              backgroundColor: theme.paper,
                              fontSize: classic.techChipFontSizePx,
                              paddingLeft: classic.techChipHorizontalPaddingPx,
                              paddingRight: classic.techChipHorizontalPaddingPx,
                              paddingTop: classic.techChipVerticalPaddingPx,
                              paddingBottom: classic.techChipVerticalPaddingPx,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {index < resume.projects!.length - 1 ? (
                      <div
                        className="my-4 border-t"
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
          paddingBottom: 18,
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
            className="mt-4 grid grid-cols-2 gap-y-1.5"
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
            className="mb-4 rounded-[10px] border px-4 py-4"
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
              className="mb-4 rounded-[10px] border px-4 py-4"
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
              <div className="mt-3 flex flex-wrap gap-2">
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
                className="mb-4 rounded-[10px] border px-4 py-4"
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
                <div className="mt-3 flex flex-wrap gap-2">
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
                className={cn(
                  "rounded-[10px] border px-4 py-4",
                  resume.certifications?.length && "mb-4",
                )}
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
                <div className="mt-3 space-y-4">
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

            {!!resume.certifications?.length ? (
              <section
                className="rounded-[10px] border px-4 py-4"
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
                  Certifications
                </h3>
                <div className="mt-3 space-y-3">
                  {resume.certifications.map((certification) => (
                    <div key={certification.id}>
                      <p
                        className="font-bold"
                        style={{
                          fontSize: modern.certificationTitleFontSizePx,
                        }}
                      >
                        {certification.name}
                      </p>
                      <p
                        className="text-slate-600"
                        style={{
                          fontSize: modern.certificationMetaFontSizePx,
                        }}
                      >
                        {certification.issuer}
                        {certification.date ? ` · ${certification.date}` : ""}
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
                className={cn(
                  "rounded-[10px] border px-4 py-4",
                  resume.projects?.length && "mb-4",
                )}
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
                <div className="mt-3 space-y-4">
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
                      <ul className="space-y-1.5">
                        {experience.description.filter(Boolean).map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 leading-[1.34]"
                            style={{ fontSize: modern.paragraphFontSizePx }}
                          >
                            <span
                              className="mt-0.5"
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
                          className="my-4 border-t"
                          style={{ borderTopColor: theme.border }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {!!resume.projects?.length ? (
              <section
                className="rounded-[10px] border px-4 py-4"
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
                  Projects
                </h3>
                <div className="mt-3 space-y-4">
                  {resume.projects.map((project, index) => (
                    <div key={project.id}>
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <h4
                          className="font-bold"
                          style={{ fontSize: modern.projectTitleFontSizePx }}
                        >
                          {project.name}
                        </h4>
                        {project.startDate || project.endDate ? (
                          <p
                            className="whitespace-pre-line text-right text-slate-600"
                            style={{ fontSize: modern.projectMetaFontSizePx }}
                          >
                            {project.startDate
                              ? formatDateRange(
                                  project.startDate,
                                  project.endDate,
                                )
                              : project.endDate}
                          </p>
                        ) : null}
                      </div>
                      {project.link ? (
                        <p
                          className="text-slate-600"
                          style={{
                            fontSize: modern.projectMetaFontSizePx,
                            marginTop: modern.projectMetaTopMarginPx,
                          }}
                        >
                          <a
                            href={toHref(project.link)}
                            className="hover:underline"
                          >
                            {project.link}
                          </a>
                        </p>
                      ) : null}
                      <ul className="mt-1.5 space-y-1.5">
                        {project.description.filter(Boolean).map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 leading-[1.34]"
                            style={{ fontSize: modern.paragraphFontSizePx }}
                          >
                            <span
                              className="mt-0.5"
                              style={{ color: theme.accent }}
                            >
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {project.technologies?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-md border"
                              style={{
                                borderColor: theme.border,
                                backgroundColor: theme.accentMuted,
                                fontSize: modern.techChipFontSizePx,
                                paddingLeft: modern.techChipHorizontalPaddingPx,
                                paddingRight:
                                  modern.techChipHorizontalPaddingPx,
                                paddingTop: modern.techChipVerticalPaddingPx,
                                paddingBottom: modern.techChipVerticalPaddingPx,
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {index < resume.projects!.length - 1 ? (
                        <div
                          className="my-4 border-t"
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
  onEmptyPointerDown,
}: {
  resume: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
  onEmptyPointerDown?: () => void;
}) {
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const hasFinePointer = useHasFinePointer();
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

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

  const isInsidePage = useCallback((x: number, y: number) => {
    const pageWidth = RESUME_A4_WIDTH_PX * scale;
    const pageHeight = RESUME_A4_HEIGHT_PX * scale;
    const pageLeft = (size.width - pageWidth) / 2;
    const pageTop = (size.height - pageHeight) / 2;
    const localX = x - pageLeft;
    const localY = y - pageTop;

    return (
      localX >= 0 && localY >= 0 && localX <= pageWidth && localY <= pageHeight
    );
  }, [scale, size.height, size.width]);

  const magnifiedScale = scale * PREVIEW_MAGNIFIER_SCALE;

  const updatePointer = useCallback((
    event: ReactPointerEvent<HTMLDivElement>,
    options?: { reset?: boolean },
  ) => {
    if (!hasFinePointer) return;

    if (options?.reset) {
      setPointer(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, [hasFinePointer]);

  const magnifier = useMemo<ReactNode>(() => {
    if (!hasFinePointer || !pointer) return null;

    const pageWidth = RESUME_A4_WIDTH_PX * scale;
    const pageHeight = RESUME_A4_HEIGHT_PX * scale;
    const pageLeft = (size.width - pageWidth) / 2;
    const pageTop = (size.height - pageHeight) / 2;
    const localX = pointer.x - pageLeft;
    const localY = pointer.y - pageTop;

    if (!isInsidePage(pointer.x, pointer.y)) return null;

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-10 rounded-full border border-white/75 bg-white/10 shadow-[0_18px_48px_rgba(15,23,42,0.24)] backdrop-blur-[2px]"
        style={{
          width: PREVIEW_MAGNIFIER_SIZE_PX,
          height: PREVIEW_MAGNIFIER_SIZE_PX,
          left: Math.min(
            Math.max(pointer.x + 24, 12),
            Math.max(size.width - PREVIEW_MAGNIFIER_SIZE_PX - 12, 12),
          ),
          top: Math.min(
            Math.max(pointer.y + 24, 12),
            Math.max(size.height - PREVIEW_MAGNIFIER_SIZE_PX - 12, 12),
          ),
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            style={{
              width: RESUME_A4_WIDTH_PX,
              height: RESUME_A4_HEIGHT_PX,
              transform: `translate(${
                PREVIEW_MAGNIFIER_SIZE_PX / 2 -
                localX * PREVIEW_MAGNIFIER_SCALE
              }px, ${
                PREVIEW_MAGNIFIER_SIZE_PX / 2 -
                localY * PREVIEW_MAGNIFIER_SCALE
              }px) scale(${magnifiedScale})`,
              transformOrigin: "top left",
            }}
          >
            <ResumePreviewPage
              resume={resume}
              template={template}
              theme={theme}
            />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full ring-1 ring-black/5" />
      </div>
    );
  }, [
    hasFinePointer,
    isInsidePage,
    magnifiedScale,
    pointer,
    resume,
    scale,
    size.height,
    size.width,
    template,
    theme,
  ]);

  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden"
      onPointerEnter={updatePointer}
      onPointerMove={updatePointer}
      onPointerDown={(event) => {
        if (!onEmptyPointerDown) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!isInsidePage(x, y)) {
          onEmptyPointerDown();
        }
      }}
      onPointerLeave={(event) => updatePointer(event, { reset: true })}
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
            <ResumePreviewPage
              resume={resume}
              template={template}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {magnifier}
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
  showFixedMobileActions,
}: {
  className?: string;
  resume: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
  isExporting?: boolean;
  onExport?: () => void;
  showFixedMobileActions?: boolean;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {showFixedMobileActions ? (
        <div className="fixed right-4 top-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 xl:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Open full screen preview"
                className="border-border/70 bg-background/95 shadow-lg backdrop-blur"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Full screen preview</TooltipContent>
          </Tooltip>
          {onExport ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="outline"
                  aria-label="Export PDF"
                  className="border-border/70 bg-background/95 shadow-lg backdrop-blur"
                  onClick={onExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Export PDF</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      ) : null}

      <Card
        className={cn(
          "flex h-full min-h-0 flex-col border-border/60 bg-card/75 shadow-sm backdrop-blur dark:from-slate-800/60 dark:to-slate-900/60",
          className,
        )}
      >
        <CardHeader className="flex w-full flex-row items-center justify-between border-b border-border/60 pb-4">
          <div className="flex min-w-0 flex-1">
            <CardTitle className="w-full text-base">PDF preview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="size-4" />
              Full screen
            </Button>
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
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          {resume ? (
            <PreviewSurface
              resume={resume}
              template={template}
              colorScheme={colorScheme}
            />
          ) : (
            <div className="flex min-h-[72vh] items-center justify-center bg-slate-100/70 p-6 text-sm text-muted-foreground dark:bg-slate-900/40">
              Rendering preview...
            </div>
          )}
        </CardContent>
      </Card>

      <DialogPrimitive.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogPortal>
          <DialogOverlay className="bg-card/75 backdrop-blur-sm" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none w-[min(90vw,794px)] h-[min(90dvh,1123px)]"
          >
            <DialogPrimitive.Title className="sr-only">
              PDF preview
            </DialogPrimitive.Title>
            <PreviewSurface
              resume={resume}
              template={template}
              colorScheme={colorScheme}
              onEmptyPointerDown={() => setIsFullscreen(false)}
            />
          </DialogPrimitive.Content>
        </DialogPortal>
      </DialogPrimitive.Root>
    </>
  );
}
