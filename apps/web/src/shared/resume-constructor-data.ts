export type ResumePersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
};

export type ResumeExperience = {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string[];
};

export type ResumeEducation = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
};

export type ResumeData = {
  personalInfo: ResumePersonalInfo;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  languages?: string[];
};

export type ResumeExportPayload = {
  resume: ResumeData;
  template?: ResumeTemplateId;
  colorScheme?: ResumeColorSchemeId;
};

export type ResumeTemplateId = "classic" | "modern";
export type ResumeColorSchemeId = "slate" | "forest" | "wine";

export type ResumeColorScheme = {
  id: ResumeColorSchemeId;
  label: string;
  accent: string;
  accentSoft: string;
  accentMuted: string;
  ink: string;
  paper: string;
  border: string;
};

export type ResumeTemplateOption = {
  id: ResumeTemplateId;
  label: string;
  description: string;
};

export const resumeTemplates: ResumeTemplateOption[] = [
  {
    id: "classic",
    label: "Classic sidebar",
    description:
      "Formal two-column CV with a strong left rail for profile details.",
  },
  {
    id: "modern",
    label: "Modern editorial",
    description:
      "Airier layout with framed sections and a stronger visual hierarchy.",
  },
];

export const resumeColorSchemes: ResumeColorScheme[] = [
  {
    id: "slate",
    label: "Slate blue",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    accentMuted: "#eff6ff",
    ink: "#0f172a",
    paper: "#ffffff",
    border: "#dbe2ea",
  },
  {
    id: "forest",
    label: "Forest green",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    accentMuted: "#f0fdfa",
    ink: "#042f2e",
    paper: "#ffffff",
    border: "#cae8e4",
  },
  {
    id: "wine",
    label: "Wine red",
    accent: "#9f1239",
    accentSoft: "#fce7f3",
    accentMuted: "#fff1f6",
    ink: "#4c0519",
    paper: "#ffffff",
    border: "#f3c9d9",
  },
];

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "Alex Johnson",
    title: "Product Designer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 014-2291",
    location: "Berlin, Germany",
    website: "alexjohnson.design",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
  },
  summary:
    "Product designer with 8+ years of experience shaping end-to-end digital products, design systems, and customer-facing experiences for B2B and consumer platforms.",
  experience: [
    {
      id: "exp-1",
      company: "Northstar Labs",
      position: "Senior Product Designer",
      location: "Remote",
      startDate: "2022",
      endDate: "Present",
      isCurrent: true,
      description: [
        "Led the redesign of the core dashboard and reduced task completion time by 24%.",
        "Defined component patterns across web and mobile to improve consistency for three product squads.",
        "Partnered with product and engineering to ship experimentation-ready flows for onboarding and retention.",
      ],
    },
    {
      id: "exp-2",
      company: "Acme Studio",
      position: "Product Designer",
      location: "London, UK",
      startDate: "2018",
      endDate: "2022",
      description: [
        "Translated research findings into interaction models, prototypes, and final UI for SaaS and marketplace products.",
        "Built a scalable design system that shortened delivery cycles and improved visual consistency.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Amsterdam",
      degree: "MSc",
      field: "Human-Computer Interaction",
      startDate: "2016",
      endDate: "2018",
    },
    {
      id: "edu-2",
      school: "University of Warsaw",
      degree: "BA",
      field: "Graphic Design",
      startDate: "2012",
      endDate: "2016",
    },
  ],
  skills: [
    "Product strategy",
    "Design systems",
    "Interaction design",
    "Prototyping",
    "User research",
    "Figma",
  ],
  languages: ["English", "German", "Polish"],
};
