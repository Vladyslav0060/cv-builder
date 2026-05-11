import React from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/stylesheet";

import {
  defaultResumeData,
  resumeColorSchemes,
  type ResumeColorScheme,
  type ResumeColorSchemeId,
  type ResumeData,
  type ResumeTemplateId,
} from "./resume-constructor-data";

type ResumePdfDocumentProps = {
  resume?: ResumeData;
  template: ResumeTemplateId;
  colorScheme: ResumeColorSchemeId;
};

type StyleTheme = ResumeColorScheme;
type PdfStyle = Style;

type ClassicStyles = {
  page: PdfStyle;
  layout: PdfStyle;
  sidebar: PdfStyle;
  content: PdfStyle;
  name: PdfStyle;
  title: PdfStyle;
  contact: PdfStyle;
  contactLink: PdfStyle;
  sidebarSection: PdfStyle;
  sectionTitle: PdfStyle;
  paragraph: PdfStyle;
  bulletList: PdfStyle;
  bulletRow: PdfStyle;
  bullet: PdfStyle;
  bulletText: PdfStyle;
  skillChipWrap: PdfStyle;
  skillChip: PdfStyle;
  skillChipText: PdfStyle;
  section: PdfStyle;
  experienceItem: PdfStyle;
  roleRow: PdfStyle;
  roleTitle: PdfStyle;
  company: PdfStyle;
  roleMeta: PdfStyle;
  educationItem: PdfStyle;
  educationTitle: PdfStyle;
  educationMeta: PdfStyle;
  divider: PdfStyle;
};

type ModernStyles = {
  page: PdfStyle;
  header: PdfStyle;
  headerTop: PdfStyle;
  nameBlock: PdfStyle;
  name: PdfStyle;
  title: PdfStyle;
  contactGrid: PdfStyle;
  contactItem: PdfStyle;
  contactText: PdfStyle;
  contactLink: PdfStyle;
  body: PdfStyle;
  introCard: PdfStyle;
  sectionTitle: PdfStyle;
  paragraph: PdfStyle;
  chipWrap: PdfStyle;
  chip: PdfStyle;
  chipText: PdfStyle;
  twoCol: PdfStyle;
  leftCol: PdfStyle;
  rightCol: PdfStyle;
  section: PdfStyle;
  block: PdfStyle;
  roleRow: PdfStyle;
  roleTitle: PdfStyle;
  roleMeta: PdfStyle;
  company: PdfStyle;
  bulletList: PdfStyle;
  bulletRow: PdfStyle;
  bullet: PdfStyle;
  bulletText: PdfStyle;
  educationItem: PdfStyle;
  educationTitle: PdfStyle;
  educationMeta: PdfStyle;
};

function getTheme(colorScheme: ResumeColorSchemeId) {
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
  if (!startDate && !endDate) {
    return "";
  }

  if (isCurrent) {
    return `${startDate} - Present`;
  }

  if (!endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function formatContacts(resume: ResumeData) {
  const { personalInfo } = resume;

  return [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean) as string[];
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

function sanitizeText(value?: string) {
  return value?.trim() ?? "";
}

function createClassicStyles(theme: StyleTheme) {
  return StyleSheet.create<ClassicStyles>({
    page: {
      backgroundColor: theme.paper,
      color: theme.ink,
      fontFamily: "Helvetica",
      fontSize: 9.2,
      lineHeight: 1.35,
      padding: 0,
    },
    layout: {
      flexDirection: "row",
      minHeight: "100%",
    },
    sidebar: {
      width: 176,
      backgroundColor: theme.accentMuted,
      paddingHorizontal: 18,
      paddingVertical: 20,
      borderRightColor: theme.border,
      borderRightWidth: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 22,
    },
    name: {
      color: theme.ink,
      fontSize: 20,
      fontWeight: "bold",
      lineHeight: 1.05,
      letterSpacing: -0.4,
    },
    title: {
      color: theme.accent,
      fontSize: 9.5,
      fontWeight: "bold",
      letterSpacing: 1.2,
      marginTop: 4,
      textTransform: "uppercase",
    },
    contact: {
      marginTop: 14,
      fontSize: 8.2,
      lineHeight: 1.35,
      color: theme.ink,
    },
    contactLink: {
      color: theme.ink,
      textDecoration: "none",
    },
    sidebarSection: {
      marginTop: 16,
    },
    sectionTitle: {
      color: theme.accent,
      fontSize: 9,
      fontWeight: "bold",
      letterSpacing: 1.1,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    paragraph: {
      fontSize: 9.2,
      lineHeight: 1.42,
      color: theme.ink,
    },
    bulletList: {
      marginTop: 2,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    bullet: {
      width: 9,
      color: theme.accent,
      fontSize: 9,
      lineHeight: 1.3,
      paddingTop: 0.5,
    },
    bulletText: {
      flexGrow: 1,
      flexShrink: 1,
      fontSize: 9.2,
      lineHeight: 1.34,
      color: theme.ink,
    },
    skillChipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 2,
    },
    skillChip: {
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: theme.paper,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 4,
      marginRight: 5,
      marginBottom: 5,
    },
    skillChipText: {
      fontSize: 8.1,
      color: theme.ink,
    },
    section: {
      marginBottom: 15,
    },
    experienceItem: {
      marginBottom: 12,
    },
    roleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    roleTitle: {
      fontSize: 10.3,
      fontWeight: "bold",
      color: theme.ink,
    },
    company: {
      marginTop: 1,
      fontSize: 9.4,
      color: theme.accent,
      fontWeight: "bold",
    },
    roleMeta: {
      fontSize: 8.6,
      color: "#4b5563",
      textAlign: "right",
    },
    educationItem: {
      marginBottom: 10,
    },
    educationTitle: {
      fontSize: 9.6,
      fontWeight: "bold",
      color: theme.ink,
    },
    educationMeta: {
      fontSize: 8.5,
      color: "#4b5563",
      marginTop: 1,
    },
    divider: {
      borderTopColor: theme.border,
      borderTopWidth: 1,
      marginVertical: 10,
    },
  });
}

function createModernStyles(theme: StyleTheme) {
  return StyleSheet.create<ModernStyles>({
    page: {
      backgroundColor: theme.paper,
      color: theme.ink,
      fontFamily: "Helvetica",
      fontSize: 9.2,
      lineHeight: 1.38,
      padding: 0,
    },
    header: {
      backgroundColor: theme.accentMuted,
      paddingHorizontal: 26,
      paddingTop: 24,
      paddingBottom: 18,
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    nameBlock: {
      flexGrow: 1,
      flexBasis: 0,
    },
    name: {
      color: theme.ink,
      fontSize: 22,
      fontWeight: "bold",
      lineHeight: 1.02,
      letterSpacing: -0.5,
    },
    title: {
      color: theme.accent,
      fontSize: 9.8,
      fontWeight: "bold",
      letterSpacing: 1.5,
      marginTop: 3,
      textTransform: "uppercase",
    },
    contactGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
    },
    contactItem: {
      width: "50%",
      paddingRight: 8,
      marginBottom: 4,
    },
    contactText: {
      fontSize: 8.2,
      color: theme.ink,
    },
    contactLink: {
      color: theme.ink,
      textDecoration: "none",
    },
    body: {
      paddingHorizontal: 26,
      paddingVertical: 20,
    },
    introCard: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
      backgroundColor: theme.paper,
    },
    sectionTitle: {
      color: theme.accent,
      fontSize: 9.2,
      fontWeight: "bold",
      letterSpacing: 1.15,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    paragraph: {
      fontSize: 9.2,
      lineHeight: 1.42,
      color: theme.ink,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 2,
    },
    chip: {
      backgroundColor: theme.accentMuted,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      marginRight: 5,
      marginBottom: 5,
    },
    chipText: {
      fontSize: 8.1,
      color: theme.ink,
    },
    twoCol: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    leftCol: {
      width: "33%",
      paddingRight: 7,
    },
    rightCol: {
      width: "67%",
      paddingLeft: 7,
    },
    section: {
      marginBottom: 13,
    },
    block: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 12,
      backgroundColor: theme.paper,
    },
    roleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    roleTitle: {
      fontSize: 10.3,
      fontWeight: "bold",
      color: theme.ink,
    },
    roleMeta: {
      fontSize: 8.6,
      color: "#4b5563",
      textAlign: "right",
    },
    company: {
      marginTop: 1,
      fontSize: 9.4,
      color: theme.accent,
      fontWeight: "bold",
    },
    bulletList: {
      marginTop: 4,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    bullet: {
      width: 9,
      color: theme.accent,
      fontSize: 9,
      lineHeight: 1.3,
      paddingTop: 0.5,
    },
    bulletText: {
      flexGrow: 1,
      flexShrink: 1,
      fontSize: 9.2,
      lineHeight: 1.34,
      color: theme.ink,
    },
    educationItem: {
      marginBottom: 10,
    },
    educationTitle: {
      fontSize: 9.6,
      fontWeight: "bold",
      color: theme.ink,
    },
    educationMeta: {
      fontSize: 8.5,
      color: "#4b5563",
      marginTop: 1,
    },
  });
}

function renderContacts(styles: ClassicStyles, resume: ResumeData) {
  const contacts = formatContacts(resume);

  return (
    <Text style={styles.contact}>
      {contacts.map((item, index) => {
        const isLast = index === contacts.length - 1;
        return (
          <Text key={item}>
            <Link src={toHref(item)} style={styles.contactLink}>
              {item}
            </Link>
            {!isLast ? "  •  " : ""}
          </Text>
        );
      })}
    </Text>
  );
}

function renderBulletPoints(
  styles: {
    bulletList: PdfStyle;
    bulletRow: PdfStyle;
    bullet: PdfStyle;
    bulletText: PdfStyle;
  },
  items: string[],
) {
  return (
    <View style={styles.bulletList}>
      {items.filter(Boolean).map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function renderSkills(
  styles: {
    chipWrap?: PdfStyle;
    chip?: PdfStyle;
    chipText?: PdfStyle;
    skillChipWrap?: PdfStyle;
    skillChip?: PdfStyle;
    skillChipText?: PdfStyle;
  },
  skills: string[],
  variant: "chips" | "pills",
) {
  const wrapStyle = (
    variant === "chips" ? styles.chipWrap : styles.skillChipWrap
  ) as PdfStyle;
  const chipStyle = (
    variant === "chips" ? styles.chip : styles.skillChip
  ) as PdfStyle;
  const textStyle = (
    variant === "chips" ? styles.chipText : styles.skillChipText
  ) as PdfStyle;

  return (
    <View style={wrapStyle}>
      {skills.filter(Boolean).map((skill) => (
        <View key={skill} style={chipStyle}>
          <Text style={textStyle}>{skill}</Text>
        </View>
      ))}
    </View>
  );
}

function ClassicTemplate({
  resume,
  theme,
}: {
  resume: ResumeData;
  theme: StyleTheme;
}) {
  const styles = createClassicStyles(theme);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{resume.personalInfo.fullName}</Text>
          <Text style={styles.title}>{resume.personalInfo.title}</Text>

          <View>
            <Text style={styles.sectionTitle}>Contact</Text>
            {renderContacts(styles, resume)}
          </View>

          {resume.summary ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.paragraph}>
                {sanitizeText(resume.summary)}
              </Text>
            </View>
          ) : null}

          <View style={styles.sidebarSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {renderSkills(styles, resume.skills, "pills")}
          </View>

          {resume.languages?.length ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sectionTitle}>Languages</Text>
              {renderSkills(styles, resume.languages, "pills")}
            </View>
          ) : null}

          {!!resume.education.length ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sectionTitle}>Education</Text>
              {resume.education.map((education) => (
                <View key={education.id} style={styles.educationItem}>
                  <Text style={styles.educationTitle}>{education.school}</Text>
                  <Text style={styles.educationMeta}>
                    {education.degree}
                    {education.field ? `, ${education.field}` : ""}
                  </Text>
                  <Text style={styles.educationMeta}>
                    {formatDateRange(education.startDate, education.endDate)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          {!!resume.experience.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {resume.experience.map((experience, index) => (
                <View key={experience.id} style={styles.experienceItem}>
                  <View style={styles.roleRow}>
                    <View style={{ flexGrow: 1, flexShrink: 1 }}>
                      <Text style={styles.roleTitle}>
                        {experience.position}
                      </Text>
                      <Text style={styles.company}>{experience.company}</Text>
                    </View>
                    <Text style={styles.roleMeta}>
                      {formatDateRange(
                        experience.startDate,
                        experience.endDate,
                        experience.isCurrent,
                      )}
                      {experience.location ? `\n${experience.location}` : ""}
                    </Text>
                  </View>
                  {renderBulletPoints(styles, experience.description)}
                  {index < resume.experience.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Page>
  );
}

function ModernTemplate({
  resume,
  theme,
}: {
  resume: ResumeData;
  theme: StyleTheme;
}) {
  const styles = createModernStyles(theme);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{resume.personalInfo.fullName}</Text>
            <Text style={styles.title}>{resume.personalInfo.title}</Text>
          </View>
        </View>

        <View style={styles.contactGrid}>
          {formatContacts(resume).map((item) => (
            <View key={item} style={styles.contactItem}>
              <Link src={toHref(item)} style={styles.contactLink}>
                <Text style={styles.contactText}>{item}</Text>
              </Link>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.twoCol}>
          <View style={styles.leftCol}>
            {resume.summary ? (
              <View style={styles.introCard}>
                <Text style={styles.sectionTitle}>Profile</Text>
                <Text style={styles.paragraph}>
                  {sanitizeText(resume.summary)}
                </Text>
              </View>
            ) : null}

            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {renderSkills(styles, resume.skills, "chips")}
            </View>

            {resume.languages?.length ? (
              <View style={styles.block}>
                <Text style={styles.sectionTitle}>Languages</Text>
                {renderSkills(styles, resume.languages, "chips")}
              </View>
            ) : null}

            {!!resume.education.length ? (
              <View style={styles.block}>
                <Text style={styles.sectionTitle}>Education</Text>
                {resume.education.map((education) => (
                  <View key={education.id} style={styles.educationItem}>
                    <Text style={styles.educationTitle}>
                      {education.school}
                    </Text>
                    <Text style={styles.educationMeta}>
                      {education.degree}
                      {education.field ? `, ${education.field}` : ""}
                    </Text>
                    <Text style={styles.educationMeta}>
                      {formatDateRange(education.startDate, education.endDate)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.rightCol}>
            {!!resume.experience.length ? (
              <View style={styles.block}>
                <Text style={styles.sectionTitle}>Experience</Text>
                {resume.experience.map((experience, index) => (
                  <View key={experience.id} style={{ marginBottom: 11 }}>
                    <View style={styles.roleRow}>
                      <View style={{ flexGrow: 1, flexShrink: 1 }}>
                        <Text style={styles.roleTitle}>
                          {experience.position}
                        </Text>
                        <Text style={styles.company}>{experience.company}</Text>
                      </View>
                      <Text style={styles.roleMeta}>
                        {formatDateRange(
                          experience.startDate,
                          experience.endDate,
                          experience.isCurrent,
                        )}
                        {experience.location ? `\n${experience.location}` : ""}
                      </Text>
                    </View>
                    {renderBulletPoints(styles, experience.description)}
                    {index < resume.experience.length - 1 ? (
                      <View
                        style={{
                          borderTopColor: theme.border,
                          borderTopWidth: 1,
                          marginVertical: 10,
                        }}
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Page>
  );
}

export function ResumePdfDocument({
  resume = defaultResumeData,
  template,
  colorScheme,
}: ResumePdfDocumentProps) {
  const theme = getTheme(colorScheme);

  return (
    <Document>
      {template === "classic" ? (
        <ClassicTemplate resume={resume} theme={theme} />
      ) : (
        <ModernTemplate resume={resume} theme={theme} />
      )}
    </Document>
  );
}
