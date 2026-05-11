import React from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type ResumeProfile = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  linkedIn?: string | null;
  phone?: string | null;
  portfolio?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  summary?: string | null;
  skills?: string | null;
  experience?: string | null;
  education?: string | null;
  achievements?: string | null;
};

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "ordered-list"; items: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "paragraph"; lines: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "hr" };

type Section = {
  title?: string;
  blocks: MarkdownBlock[];
};

type ResumePdfDocumentProps = {
  markdown: string;
  profile?: ResumeProfile;
  title: string;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.38,
    padding: 0,
  },
  headerBand: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 18,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameBlock: {
    flexGrow: 1,
    paddingRight: 16,
  },
  fullName: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "bold",
    lineHeight: 1.05,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: 3,
    textTransform: "uppercase",
  },
  contact: {
    marginTop: 10,
    color: "#e2e8f0",
    fontSize: 8.4,
    lineHeight: 1.34,
  },
  contactLink: {
    color: "#e2e8f0",
    textDecoration: "none",
  },
  body: {
    paddingHorizontal: 30,
    paddingTop: 112,
    paddingBottom: 28,
  },
  introRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  introColumn: {
    flexGrow: 1,
    flexBasis: 0,
  },
  introSpacer: {
    width: 12,
  },
  introCard: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe2ea",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 11,
  },
  sectionTitle: {
    color: "#2563eb",
    fontSize: 9.5,
    fontWeight: "bold",
    letterSpacing: 1.35,
    paddingBottom: 4,
    marginBottom: 7,
    textTransform: "uppercase",
    borderBottomColor: "#dbe2ea",
    borderBottomWidth: 1,
  },
  sectionBody: {
    fontSize: 9.4,
    lineHeight: 1.36,
    color: "#111827",
  },
  paragraph: {
    fontSize: 9.4,
    lineHeight: 1.38,
    marginBottom: 5,
    color: "#111827",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 3.5,
  },
  bullet: {
    width: 10,
    color: "#111827",
    fontSize: 9.5,
    lineHeight: 1.34,
  },
  listText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 9.3,
    lineHeight: 1.34,
    color: "#111827",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginRight: -6,
    marginBottom: -6,
  },
  pill: {
    borderColor: "#dbe2ea",
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 8.2,
    lineHeight: 1.1,
    color: "#111827",
  },
  table: {
    borderColor: "#dbe2ea",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flexGrow: 1,
    flexBasis: 0,
    borderRightColor: "#dbe2ea",
    borderRightWidth: 1,
    borderBottomColor: "#dbe2ea",
    borderBottomWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 8.3,
    lineHeight: 1.26,
    color: "#111827",
  },
  tableHeaderCell: {
    backgroundColor: "#eef2ff",
    fontWeight: "bold",
  },
  hr: {
    borderTopColor: "#dbe2ea",
    borderTopWidth: 1,
    marginVertical: 6,
  },
});

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripInlineMarkdown(value: string) {
  return normalizeSpace(value)
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1");
}

function splitSkillItems(value: string) {
  return value
    .split(/[\n,;|]/)
    .map((item) => stripInlineMarkdown(item))
    .filter(Boolean);
}

function formatLocation(profile?: ResumeProfile) {
  return [profile?.city, profile?.state, profile?.country, profile?.zip]
    .filter(Boolean)
    .join(", ");
}

function formatFullName(profile?: ResumeProfile, fallback = "Resume") {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return normalizeSpace(name) || fallback;
}

function formatContactItems(profile?: ResumeProfile) {
  return [
    profile?.email,
    profile?.phone,
    profile?.address,
    formatLocation(profile),
    profile?.linkedIn,
    profile?.portfolio,
  ]
    .map((item) => (item ? stripInlineMarkdown(item) : ""))
    .filter(Boolean);
}

function parseTableRows(lines: string[], startIndex: number) {
  const header = lines[startIndex]
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => stripInlineMarkdown(cell.trim()));

  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && /^\|.*\|\s*$/.test(lines[index])) {
    rows.push(
      lines[index]
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => stripInlineMarkdown(cell.trim())),
    );
    index += 1;
  }

  return { rows: [header, ...rows], nextIndex: index };
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index]?.trimEnd() ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: stripInlineMarkdown(heading[2]),
      });
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (
      /^\|.*\|\s*$/.test(line) &&
      index + 1 < lines.length &&
      /^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[index + 1]?.trimEnd() ?? "")
    ) {
      const { rows, nextIndex } = parseTableRows(lines, index);
      blocks.push({ type: "table", rows });
      index = nextIndex;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trimStart())) {
        items.push(
          stripInlineMarkdown(lines[index].trimStart().replace(/^[-*+]\s+/, "")),
        );
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trimStart())) {
        items.push(
          stripInlineMarkdown(lines[index].trimStart().replace(/^\d+\.\s+/, "")),
        );
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index]?.trimEnd() ?? "";
      if (!current.trim()) break;
      if (
        paragraphLines.length > 0 &&
        (/^(#{1,6})\s+/.test(current) ||
          /^(-{3,}|\*{3,}|_{3,})$/.test(current.trim()) ||
          /^\|.*\|\s*$/.test(current) ||
          /^[-*+]\s+/.test(current) ||
          /^\d+\.\s+/.test(current))
      ) {
        break;
      }
      paragraphLines.push(stripInlineMarkdown(current));
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", lines: paragraphLines });
      continue;
    }

    index += 1;
  }

  return blocks;
}

function groupSections(blocks: MarkdownBlock[]) {
  const sections: Section[] = [];
  let current: Section = { blocks: [] };

  for (const block of blocks) {
    if (block.type === "heading") {
      if (current.blocks.length > 0 || current.title) {
        sections.push(current);
      }
      current = { blocks: [], title: block.text };
      continue;
    }

    current.blocks.push(block);
  }

  if (current.blocks.length > 0 || current.title) {
    sections.push(current);
  }

  return sections;
}

function normalizeSectionTitle(title: string) {
  return stripInlineMarkdown(title).toLowerCase();
}

function isHiddenSection(section: Section) {
  return normalizeSectionTitle(section.title ?? "").includes("contact");
}

function isSummarySection(section: Section) {
  const normalized = normalizeSectionTitle(section.title ?? "");
  return normalized.includes("summary") || normalized.includes("profile");
}

function isSkillsSection(section: Section) {
  const normalized = normalizeSectionTitle(section.title ?? "");
  return (
    normalized.includes("skill") ||
    normalized.includes("competenc") ||
    normalized.includes("strength")
  );
}

function buildSections(markdown: string, profile?: ResumeProfile) {
  const sections = groupSections(parseMarkdown(markdown));
  const normalizedTitles = new Set(
    sections.map((section) => normalizeSectionTitle(section.title ?? "")),
  );

  const output: Section[] = [];

  if (profile?.summary && !normalizedTitles.has("summary") && !normalizedTitles.has("profile")) {
    output.push({
      title: "Summary",
      blocks: [{ type: "paragraph", lines: [stripInlineMarkdown(profile.summary)] }],
    });
  }

  if (profile?.skills && !normalizedTitles.has("skills") && !normalizedTitles.has("strengths")) {
    output.push({
      title: "Skills",
      blocks: [{ type: "unordered-list", items: splitSkillItems(profile.skills) }],
    });
  }

  output.push(...sections);
  return output.filter((section) => !isHiddenSection(section));
}

function renderMarkdownBlock(block: MarkdownBlock, isSkillsSectionBlock: boolean) {
  if (block.type === "paragraph") {
    if (isSkillsSectionBlock) {
      return (
        <View style={styles.pillWrap}>
          {splitSkillItems(block.lines.join(" ")).map((item) => (
            <View key={item} style={styles.pill}>
              <Text style={styles.pillText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return <Text style={styles.paragraph}>{block.lines.join(" ")}</Text>;
  }

  if (block.type === "unordered-list") {
    if (isSkillsSectionBlock) {
      return (
        <View style={styles.pillWrap}>
          {block.items.map((item) => (
            <View key={item} style={styles.pill}>
              <Text style={styles.pillText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View>
        {block.items.map((item) => (
          <View key={item} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <View>
        {block.items.map((item, index) => (
          <View key={`${index}-${item}`} style={styles.listItem}>
            <Text style={styles.bullet}>{`${index + 1}.`}</Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === "table") {
    const columnCount = Math.max(...block.rows.map((row) => row.length));
    return (
      <View style={styles.table}>
        {block.rows.map((row, rowIndex) => (
          <View key={`${rowIndex}-${row.join("|")}`} style={styles.tableRow}>
            {Array.from({ length: columnCount }).map((_, columnIndex) => {
              const value = row[columnIndex] ?? "";
              const cellStyles: any[] = [styles.tableCell];

              if (rowIndex === 0) {
                cellStyles.push(styles.tableHeaderCell);
              }

              if (columnIndex === columnCount - 1) {
                cellStyles.push({ borderRightWidth: 0 });
              }

              if (rowIndex === block.rows.length - 1) {
                cellStyles.push({ borderBottomWidth: 0 });
              }

              return (
                <Text
                  key={`${rowIndex}-${columnIndex}-${value}`}
                  style={cellStyles}
                >
                  {value}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    );
  }

  if (block.type === "hr") {
    return <View style={styles.hr} />;
  }

  return null;
}

function renderSectionBody(section: Section) {
  const normalizedTitle = normalizeSectionTitle(section.title ?? "");
  const isSkills = isSkillsSection(section);
  const isSummary = isSummarySection(section);

  if (isSummary && section.blocks.length === 1 && section.blocks[0]?.type === "paragraph") {
    return (
      <Text style={styles.paragraph}>{section.blocks[0].lines.join(" ")}</Text>
    );
  }

  return (
    <View>
      {section.blocks.map((block, index) => (
        <View key={`${section.title ?? "section"}-${index}`} style={{ marginBottom: 4 }}>
          {renderMarkdownBlock(block, isSkills)}
        </View>
      ))}
    </View>
  );
}

function renderSection(section: Section) {
  if (!section.title) {
    return <View>{renderSectionBody(section)}</View>;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {renderSectionBody(section)}
    </View>
  );
}

export function ResumePdfDocument({
  markdown,
  profile,
  title,
}: ResumePdfDocumentProps) {
  const sections = buildSections(markdown, profile);
  const summarySection = sections.find(isSummarySection);
  const skillsSection = sections.find(isSkillsSection);
  const remainingSections = sections.filter(
    (section) => section !== summarySection && section !== skillsSection,
  );
  const fullName = formatFullName(profile, title || "Resume");
  const subtitle = title && title !== fullName ? stripInlineMarkdown(title) : "Professional resume";
  const contactItems = formatContactItems(profile);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.headerBand}>
          <View style={styles.headerTop}>
            <View style={styles.nameBlock}>
              <Text style={styles.fullName}>{fullName}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          {contactItems.length > 0 ? (
            <Text style={styles.contact}>
              {contactItems.map((item, index) => {
                const isLast = index === contactItems.length - 1;
                const isLink =
                  item.startsWith("http://") ||
                  item.startsWith("https://") ||
                  item.startsWith("mailto:") ||
                  item.startsWith("tel:");

                if (isLink) {
                  return (
                    <Link key={item} src={item} style={styles.contactLink}>
                      {item}
                      {!isLast ? "  •  " : ""}
                    </Link>
                  );
                }

                return (
                  <Text key={item}>
                    {item}
                    {!isLast ? "  •  " : ""}
                  </Text>
                );
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.body}>
          {summarySection || skillsSection ? (
            <View style={styles.introRow}>
              {summarySection ? (
                <View style={styles.introColumn}>
                  <View style={styles.introCard}>{renderSection(summarySection)}</View>
                </View>
              ) : null}

              {summarySection && skillsSection ? <View style={styles.introSpacer} /> : null}

              {skillsSection ? (
                <View style={styles.introColumn}>
                  <View style={styles.introCard}>{renderSection(skillsSection)}</View>
                </View>
              ) : null}
            </View>
          ) : null}

          {remainingSections.map((section) => (
            <View key={section.title ?? JSON.stringify(section.blocks)}>
              {renderSection(section)}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export type { ResumeProfile };
