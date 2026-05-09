import { z } from "zod";

import {
  CreateDocumentDtoCreationMode,
  DocumentType,
} from "@/api/generated.schemas";

import {
  scratchBackgroundStepSchema,
  scratchIdentityStepSchema,
} from "./wizard-applicant-info";

export const modeStepSchema = z.object({
  creationMode: z.enum([
    CreateDocumentDtoCreationMode.ACCOUNT,
    CreateDocumentDtoCreationMode.SCRATCH,
  ]),
});

export const accountPersonalStepSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Enter a phone number."),
  avatarUrl: z
    .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
    .optional(),
  linkedIn: z
    .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
    .optional(),
  portfolio: z
    .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
    .optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export const accountExperienceStepSchema = z.object({
  experience: z.string().trim().min(1, "Add your work experience."),
  summary: z.string().trim().optional(),
});

export const accountStrengthsStepSchema = z.object({
  education: z.string().trim().min(1, "Add your education."),
  skills: z.string().trim().min(1, "Add your skills."),
  achievements: z.string().trim().optional(),
});

export { scratchBackgroundStepSchema, scratchIdentityStepSchema };

export const documentBriefStepSchema = z.object({
  jobTitle: z.string().trim().min(1, "Enter the target job title."),
  company: z.string().trim().min(1, "Enter the target company."),
  description: z.string().trim().min(1, "Add the job description."),
  type: z.enum([DocumentType.COVER_LETTER, DocumentType.RESUME]),
});

export const wizardResolverSchema = z
  .object({
    creationMode: z.enum([
      CreateDocumentDtoCreationMode.ACCOUNT,
      CreateDocumentDtoCreationMode.SCRATCH,
    ]),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z
      .union([
        z.string().trim().email("Enter a valid email address."),
        z.literal(""),
      ])
      .optional(),
    phone: z.string().trim().optional(),
    avatarUrl: z
      .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
      .optional(),
    linkedIn: z
      .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
      .optional(),
    portfolio: z
      .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
      .optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip: z.string().trim().optional(),
    country: z.string().trim().optional(),
    experience: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    education: z.string().trim().optional(),
    skills: z.string().trim().optional(),
    achievements: z.string().trim().optional(),
    jobTitle: z.string().trim().optional(),
    company: z.string().trim().optional(),
    description: z.string().trim().optional(),
    type: z.enum([DocumentType.COVER_LETTER, DocumentType.RESUME]),
  })
  .superRefine((values, ctx) => {
    const requireField = (field: keyof typeof values, message: string) => {
      if (values[field]?.trim()) return;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [field],
      });
    };

    if (values.creationMode === CreateDocumentDtoCreationMode.ACCOUNT) {
      requireField("firstName", "Enter a first name.");
      requireField("lastName", "Enter a last name.");
      requireField("email", "Enter an email address.");
      requireField("phone", "Enter a phone number.");
      requireField("experience", "Add your work experience.");
      requireField("education", "Add your education.");
      requireField("skills", "Add your skills.");
      requireField("jobTitle", "Enter the target job title.");
      requireField("company", "Enter the target company.");
      requireField("description", "Add the job description.");
    }

    if (values.creationMode === CreateDocumentDtoCreationMode.SCRATCH) {
      requireField("firstName", "Enter a first name.");
      requireField("email", "Enter an email address.");
      requireField("experience", "Add your work experience.");
      requireField("skills", "Add your skills.");
      requireField("jobTitle", "Enter a document title.");
      requireField("company", "Enter a company name.");
      requireField("description", "Add the document brief.");
    }
  });

export type NewDocumentWizardValues = z.infer<typeof wizardResolverSchema>;

export const wizardDefaultValues = {
  address: "",
  achievements: "",
  avatarUrl: "",
  city: "",
  company: "",
  country: "",
  creationMode: CreateDocumentDtoCreationMode.ACCOUNT,
  description: "",
  education: "",
  email: "",
  experience: "",
  firstName: "",
  jobTitle: "",
  lastName: "",
  linkedIn: "",
  phone: "",
  portfolio: "",
  skills: "",
  state: "",
  summary: "",
  type: DocumentType.COVER_LETTER,
  zip: "",
} as const;
