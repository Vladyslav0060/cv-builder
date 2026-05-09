import { z } from "zod";

import { CreateDocumentDtoCreationMode } from "@/api/generated.schemas";

import {
  NewDocumentWizardValues,
  accountExperienceStepSchema,
  accountPersonalStepSchema,
  accountStrengthsStepSchema,
  documentBriefStepSchema,
  modeStepSchema,
  scratchBackgroundStepSchema,
  scratchIdentityStepSchema,
} from "./wizard-step-schemas";
import {
  applicantBackgroundFields,
  applicantIdentityFields,
} from "./wizard-applicant-info";

export type WizardFieldConfig = {
  name: Extract<keyof NewDocumentWizardValues, string>;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  description?: string;
};

export type WizardFormStep = {
  kind: "form";
  id: string;
  title: string;
  description: string;
  fields: WizardFieldConfig[];
  submitLabel?: string;
  schema: z.ZodTypeAny;
};

export type WizardMessageStep = {
  kind: "message";
  id: string;
  title: string;
  description: string;
  continueLabel: string;
};

export type WizardStep = WizardFormStep | WizardMessageStep;

export const personalInfoFields: WizardFieldConfig[] = [
  { name: "firstName", label: "First name", placeholder: "John" },
  { name: "lastName", label: "Last name", placeholder: "Doe" },
  { name: "email", label: "Email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
  { name: "avatarUrl", label: "Avatar URL", placeholder: "https://..." },
  {
    name: "linkedIn",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/...",
  },
  { name: "portfolio", label: "Portfolio", placeholder: "https://..." },
  { name: "address", label: "Address", placeholder: "Street address" },
  { name: "city", label: "City", placeholder: "City" },
  { name: "state", label: "State", placeholder: "State" },
  { name: "zip", label: "ZIP", placeholder: "ZIP code" },
  { name: "country", label: "Country", placeholder: "Country" },
];

export const workExperienceFields: WizardFieldConfig[] = [
  {
    name: "experience",
    label: "Work experience",
    placeholder: "Summarize your recent roles, responsibilities, and impact.",
    multiline: true,
    description: "This can be concise or detailed. We’ll keep it readable.",
  },
  {
    name: "summary",
    label: "Professional summary",
    placeholder: "A short profile summary for your CV or cover letter.",
    multiline: true,
  },
];

export const educationAndStrengthFields: WizardFieldConfig[] = [
  {
    name: "education",
    label: "Education",
    placeholder: "Degrees, certifications, and institutions.",
    multiline: true,
  },
  {
    name: "skills",
    label: "Skills",
    placeholder: "Technical and soft skills separated by commas or lines.",
    multiline: true,
  },
  {
    name: "achievements",
    label: "Achievements",
    placeholder: "Awards, promotions, published work, measurable results.",
    multiline: true,
  },
];

export const documentBriefFields: WizardFieldConfig[] = [
  {
    name: "jobTitle",
    label: "Job title",
    placeholder: "Senior Product Designer",
  },
  { name: "company", label: "Company", placeholder: "Acme Inc." },
  {
    name: "description",
    label: "Job description",
    placeholder: "Paste the job description or brief here.",
    multiline: true,
  },
];

const accountSteps: WizardStep[] = [
  {
    kind: "form",
    id: "account-personal",
    title: "Personal and contact information",
    description:
      "Start with the basics. We’ll use these details to strengthen your generated document.",
    fields: personalInfoFields,
    schema: accountPersonalStepSchema,
  },
  {
    kind: "message",
    id: "account-personal-message",
    title:
      "Great job with your personal information! Now, let's add your work experience.",
    description:
      "A few clear lines about your recent roles will make the generator much more useful.",
    continueLabel: "Continue to work experience",
  },
  {
    kind: "form",
    id: "account-experience",
    title: "Work experience",
    description:
      "Summarize your most relevant roles, responsibilities, and outcomes.",
    fields: workExperienceFields,
    schema: accountExperienceStepSchema,
  },
  {
    kind: "message",
    id: "account-strengths-message",
    title:
      "Nice progress. Now, let's capture your education and strongest skills.",
    description:
      "These details help the generator shape a sharper, more credible draft.",
    continueLabel: "Continue to education and skills",
  },
  {
    kind: "form",
    id: "account-strengths",
    title: "Education and strengths",
    description: "Add formal education, standout skills, and key achievements.",
    fields: educationAndStrengthFields,
    schema: accountStrengthsStepSchema,
  },
  {
    kind: "message",
    id: "account-brief-message",
    title: "Perfect. Now, let's set up the document you want to generate.",
    description:
      "We’re at the final brief. Once this is filled in, the draft can be created.",
    continueLabel: "Continue to document brief",
  },
  {
    kind: "form",
    id: "account-brief",
    title: "Document brief",
    description:
      "Tell us what role this document is targeting and what job description it should match.",
    fields: documentBriefFields,
    submitLabel: "Generate document",
    schema: documentBriefStepSchema,
  },
];

const scratchSteps: WizardStep[] = [
  {
    kind: "message",
    id: "scratch-intro-message",
    title: "Great setup. Let's capture the details the AI should reference.",
    description:
      "We’ll use this information to shape a fresh draft without pulling from your saved account profile.",
    continueLabel: "Continue to your details",
  },
  {
    kind: "form",
    id: "scratch-identity",
    title: "About you",
    description:
      "Add the core identity and contact details you want reflected in the draft.",
    fields: [...applicantIdentityFields],
    schema: scratchIdentityStepSchema,
  },
  {
    kind: "message",
    id: "scratch-background-message",
    title: "Nice. Now, let's capture your background and strengths.",
    description:
      "These details help the draft feel grounded and specific, even without an account profile.",
    continueLabel: "Continue to background",
  },
  {
    kind: "form",
    id: "scratch-background",
    title: "Background and strengths",
    description:
      "Share the experience, skills, and supporting details the AI should weave into the draft.",
    fields: [...applicantBackgroundFields],
    schema: scratchBackgroundStepSchema,
  },
  {
    kind: "message",
    id: "scratch-brief-message",
    title: "Perfect. Finish with the document brief.",
    description:
      "Once we know the role and target company, the AI can generate a stronger first version.",
    continueLabel: "Continue to document brief",
  },
  {
    kind: "form",
    id: "scratch-brief",
    title: "Document brief",
    description:
      "Describe the document you want to write from scratch. The AI will turn the brief into a polished draft.",
    fields: [...documentBriefFields],
    submitLabel: "Generate document",
    schema: documentBriefStepSchema,
  },
];

export const modeStep: WizardFormStep = {
  kind: "form",
  id: "mode",
  title: "Start with the basics",
  description:
    "Pick the document type and choose whether we should generate from your saved account data or write everything from scratch.",
  fields: [
    {
      name: "type",
      label: "Document type",
      placeholder: "Select a document type",
    },
    {
      name: "creationMode",
      label: "Starting mode",
      placeholder: "Select a starting mode",
    },
  ],
  submitLabel: "Continue",
  schema: modeStepSchema,
};

export function buildWizardSteps(
  creationMode?: NewDocumentWizardValues["creationMode"],
): WizardStep[] {
  return [
    modeStep,
    ...(creationMode === CreateDocumentDtoCreationMode.SCRATCH
      ? scratchSteps
      : accountSteps),
  ];
}
