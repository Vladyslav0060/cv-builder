import type {
  ResumeColorSchemeId,
  ResumeData,
  ResumeTemplateId,
} from "../shared/resume-constructor-data";
import { resumeColorSchemes } from "../shared/resume-constructor-data";
import {
  RESUME_A4_HEIGHT_PX,
  RESUME_A4_WIDTH_PX,
  resumeConstructorLayout,
} from "../shared/resume-constructor-layout";

type RenderResumeConstructorHtmlParams = {
  resume: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
};

type Theme = (typeof resumeColorSchemes)[number];

function getTheme(colorScheme: ResumeColorSchemeId): Theme {
  return (
    resumeColorSchemes.find((scheme) => scheme.id === colorScheme) ??
    resumeColorSchemes[0]
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function renderContacts(resume: ResumeData) {
  const contacts = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.website,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
  ].filter(Boolean) as string[];

  return contacts
    .map((item) => {
      const href = escapeHtml(toHref(item));
      const safe = escapeHtml(item);
      return `<a class="contact-link" href="${href}">${safe}</a>`;
    })
    .join("");
}

function renderSkillChips(skills: string[], theme: Theme) {
  return skills
    .filter(Boolean)
    .map(
      (skill) =>
        `<span class="chip chip--light" style="border-color:${theme.border};background:${theme.accentMuted};">${escapeHtml(skill)}</span>`,
    )
    .join("");
}

function renderModernSkillChips(skills: string[], theme: Theme) {
  return skills
    .filter(Boolean)
    .map(
      (skill) =>
        `<span class="chip chip--modern" style="border-color:${theme.border};background:${theme.accentMuted};">${escapeHtml(skill)}</span>`,
    )
    .join("");
}

function renderLanguages(resume: ResumeData) {
  return (resume.languages ?? [])
    .filter(Boolean)
    .map((language) => `<span class="language">${escapeHtml(language)}</span>`)
    .join("");
}

function renderEducation(resume: ResumeData) {
  return resume.education
    .map(
      (education) => `
        <div class="education-item">
          <div class="education-title">${escapeHtml(education.school)}</div>
          <div class="education-meta">${escapeHtml(
            education.degree,
          )}${education.field ? `, ${escapeHtml(education.field)}` : ""}</div>
          <div class="education-meta">${escapeHtml(
            formatDateRange(education.startDate, education.endDate),
          )}</div>
        </div>
      `,
    )
    .join("");
}

function renderExperience(resume: ResumeData, theme: Theme) {
  return resume.experience
    .map(
      (experience, index) => `
        <div class="experience-item${index < resume.experience.length - 1 ? " experience-item--spaced" : ""}">
          <div class="role-row">
            <div class="role-heading">
              <div class="role-title">${escapeHtml(experience.position)}</div>
              <div class="company">${escapeHtml(experience.company)}</div>
            </div>
            <div class="role-meta">
              ${escapeHtml(
                formatDateRange(
                  experience.startDate,
                  experience.endDate,
                  experience.isCurrent,
                ),
              )}${experience.location ? `<br />${escapeHtml(experience.location)}` : ""}
            </div>
          </div>
          <ul class="bullets">
            ${experience.description
              .filter(Boolean)
              .map(
                (item) => `
                  <li class="bullet-row">
                    <span class="bullet" style="color:${theme.accent}">•</span>
                    <span class="bullet-text">${escapeHtml(item)}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </div>
      `,
    )
    .join("");
}

function buildBaseStyles(theme: Theme) {
  const modern = resumeConstructorLayout.modern;

  return `
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: ${RESUME_A4_WIDTH_PX}px;
      min-height: ${RESUME_A4_HEIGHT_PX}px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-family: Arial, Helvetica, sans-serif;
      color: ${theme.ink};
      background: ${theme.paper};
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page {
      width: ${RESUME_A4_WIDTH_PX}px;
      min-height: ${RESUME_A4_HEIGHT_PX}px;
      overflow: hidden;
      background: ${theme.paper};
      color: ${theme.ink};
    }

    .page--modern {
      background: #f6f7fb;
    }

    .page--classic {
      display: flex;
    }

    .page--modern .page-inner {
      padding: ${modern.bodyVerticalPaddingPx}px ${modern.bodyHorizontalPaddingPx}px;
    }

    .page-inner {
      width: 100%;
      min-height: ${RESUME_A4_HEIGHT_PX}px;
    }

    .border-line {
      border-color: ${theme.border};
    }

    .section-title {
      margin: 0 0 8px 0;
      color: ${theme.accent};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.15px;
      font-size: 9px;
    }

    .name {
      margin: 0;
      color: ${theme.ink};
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.4px;
    }

    .title {
      margin: 4px 0 0 0;
      color: ${theme.accent};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-size: 9.5px;
    }

    .contact-list {
      margin-top: 14px;
      font-size: 8.2px;
      line-height: 1.35;
    }

    .contact-link {
      display: block;
      overflow-wrap: anywhere;
    }

    .chip {
      display: inline-block;
      border: 1px solid ${theme.border};
      border-radius: 999px;
      padding: 4px 8px;
      margin: 0 6px 6px 0;
      font-size: 8.1px;
      line-height: 1.2;
    }

    .chip--modern {
      border-radius: 8px;
      font-size: 8.1px;
    }

    .language {
      display: block;
      font-size: 9.2px;
      line-height: 1.35;
      margin-bottom: 2px;
    }

    .education-item {
      margin-bottom: 10px;
    }

    .education-title {
      font-size: 9.6px;
      font-weight: 700;
      line-height: 1.25;
    }

    .education-meta {
      margin-top: 2px;
      font-size: 8.15px;
      line-height: 1.35;
      opacity: 0.82;
    }

    .experience-item {
      page-break-inside: avoid;
    }

    .experience-item--spaced {
      margin-bottom: 12px;
    }

    .role-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 3px;
    }

    .role-heading {
      min-width: 0;
      flex: 1 1 auto;
    }

    .role-title {
      font-size: 11.1px;
      font-weight: 700;
      line-height: 1.2;
    }

    .company {
      margin-top: 2px;
      color: ${theme.accent};
      font-size: 9.2px;
      font-weight: 700;
      line-height: 1.2;
    }

    .role-meta {
      flex: 0 0 auto;
      white-space: pre-line;
      text-align: right;
      color: rgba(15, 23, 42, 0.72);
      font-size: 8.2px;
      line-height: 1.35;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .bullets {
      list-style: none;
      margin: 5px 0 0 0;
      padding: 0;
    }

    .bullet-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 4px;
      line-height: 1.34;
      font-size: 9.3px;
    }

    .bullet {
      display: inline-block;
      width: 9px;
      flex: 0 0 9px;
      line-height: 1.3;
      margin-top: 2px;
    }

    .bullet-text {
      flex: 1 1 auto;
      min-width: 0;
    }

    .classic-sidebar {
      width: 176px;
      flex: 0 0 176px;
      background: ${theme.accentMuted};
      border-right: 1px solid ${theme.border};
      padding: 24px 20px;
    }

    .classic-name-block {
      margin-bottom: 24px;
    }

    .classic-content {
      flex: 1 1 auto;
      min-width: 0;
      padding: 24px;
    }

    .classic-divider {
      border-top: 1px solid ${theme.border};
      margin: 10px 0;
    }

    .modern-header {
      background: ${theme.accentMuted};
      border-bottom: 1px solid ${theme.border};
      padding: 24px 24px 16px;
    }

    .modern-header-top {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .modern-contact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 12px;
      margin-top: 12px;
      font-size: 8.2px;
      line-height: 1.35;
    }

    .modern-body {
      display: flex;
      gap: 0;
      align-items: flex-start;
    }

    .modern-summary {
      margin-bottom: 12px;
      background: #fff;
      border: 1px solid ${theme.border};
      border-radius: 10px;
      padding: 12px;
    }

    .modern-summary p,
    .classic-summary p {
      margin: 0;
      font-size: 9.3px;
      line-height: 1.42;
    }

    .modern-left-col {
      width: ${modern.leftColumnWidthPercent}%;
      min-width: 0;
      padding-right: 12px;
    }

    .modern-right-col {
      width: ${modern.rightColumnWidthPercent}%;
      min-width: 0;
      padding-left: 12px;
    }

    .modern-card,
    .classic-card {
      border: 1px solid ${theme.border};
      background: #fff;
      border-radius: 10px;
      padding: 12px;
    }

    .modern-section {
      margin-bottom: 16px;
    }

    .modern-section:last-child,
    .classic-section:last-child {
      margin-bottom: 0;
    }

    .classic-section {
      margin-bottom: 16px;
    }
  `;
}

function renderClassicPage(resume: ResumeData, theme: Theme) {
  const classic = resumeConstructorLayout.classic;
  return `
    <div class="page page--classic">
      <aside class="classic-sidebar" style="background:${theme.accentMuted};border-right:1px solid ${theme.border};">
        <div class="classic-name-block">
          <h1 class="name" style="font-size:${classic.nameFontSizePx}px;">${escapeHtml(
            resume.personalInfo.fullName,
          )}</h1>
          <div class="title" style="font-size:${classic.titleFontSizePx}px;letter-spacing:${classic.titleLetterSpacingPx}px;">${escapeHtml(
            resume.personalInfo.title,
          )}</div>
        </div>

        <section class="classic-section">
          <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Contact</h2>
          <div class="contact-list">${renderContacts(resume)}</div>
        </section>

        ${resume.skills.length ? `
          <section class="classic-section">
            <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Skills</h2>
            <div>${renderSkillChips(resume.skills, theme)}</div>
          </section>
        ` : ""}

        ${resume.languages?.length ? `
          <section class="classic-section">
            <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Languages</h2>
            <div>
              ${renderLanguages(resume)}
            </div>
          </section>
        ` : ""}

        <section class="classic-section">
          <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Education</h2>
          ${renderEducation(resume)}
        </section>
      </aside>

      <main class="classic-content">
        ${resume.summary ? `
          <section class="classic-section classic-summary">
            <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Profile</h2>
            <p style="font-size:${classic.paragraphFontSizePx}px;line-height:1.42;">${escapeHtml(
              resume.summary,
            )}</p>
          </section>
          <div class="classic-divider"></div>
        ` : ""}

        <section class="classic-section">
          <h2 class="section-title" style="font-size:${classic.sectionTitleFontSizePx}px;letter-spacing:${classic.sectionTitleLetterSpacingPx}px;">Experience</h2>
          ${renderExperience(resume, theme)}
        </section>
      </main>
    </div>
  `;
}

function renderModernPage(resume: ResumeData, theme: Theme) {
  const modern = resumeConstructorLayout.modern;
  return `
    <div class="page page--modern">
      <header class="modern-header">
        <div class="modern-header-top">
          <div>
            <h1 class="name" style="font-size:${modern.titleFontSizePx}px;letter-spacing:${modern.titleLetterSpacingPx}px;color:${theme.ink};">${escapeHtml(
              resume.personalInfo.fullName,
            )}</h1>
            <div class="title" style="font-size:${modern.subtitleFontSizePx}px;letter-spacing:${modern.subtitleLetterSpacingPx}px;color:${theme.accent};">${escapeHtml(
              resume.personalInfo.title,
            )}</div>
          </div>
          <div class="modern-contact-grid">${renderContacts(resume)}</div>
        </div>
      </header>

      <div class="page-inner modern-body" style="padding-top:${modern.bodyVerticalPaddingPx}px;padding-bottom:${modern.bodyVerticalPaddingPx}px;padding-left:${modern.bodyHorizontalPaddingPx}px;padding-right:${modern.bodyHorizontalPaddingPx}px;">
        <div class="modern-left-col">
          ${resume.summary ? `
            <section class="modern-summary">
              <h2 class="section-title">Profile</h2>
              <p>${escapeHtml(resume.summary)}</p>
            </section>
          ` : ""}

          <section class="modern-section modern-card">
            <h2 class="section-title">Skills</h2>
            <div>${renderModernSkillChips(resume.skills, theme)}</div>
          </section>

          ${resume.languages?.length ? `
            <section class="modern-section modern-card">
              <h2 class="section-title">Languages</h2>
              <div>${renderLanguages(resume)}</div>
            </section>
          ` : ""}

          <section class="modern-section modern-card">
            <h2 class="section-title">Education</h2>
            ${renderEducation(resume)}
          </section>
        </div>

        <div class="modern-right-col">
          <section class="modern-section modern-card">
            <h2 class="section-title">Experience</h2>
            ${renderExperience(resume, theme)}
          </section>
        </div>
      </div>
    </div>
  `;
}

export function renderResumeConstructorHtml({
  resume,
  template,
  colorScheme,
}: RenderResumeConstructorHtmlParams) {
  const theme = getTheme(colorScheme);
  const body =
    template === "classic"
      ? renderClassicPage(resume, theme)
      : renderModernPage(resume, theme);

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>${buildBaseStyles(theme)}</style>
    </head>
    <body>${body}</body>
  </html>`;
}
