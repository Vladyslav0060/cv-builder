"use client";

import { z } from "zod";

import {
  type DocumentApplicantInfoDto,
} from "@/api/generated.schemas";

import { trimOrUndefined } from "./wizard-schema";

export type WizardApplicantInfoValues = {
  address?: string;
  achievements?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  education?: string;
  email?: string;
  experience?: string;
  firstName?: string;
  lastName?: string;
  linkedIn?: string;
  phone?: string;
  portfolio?: string;
  skills?: string;
  state?: string;
  summary?: string;
  zip?: string;
};

export const applicantIdentityFields = [
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
] as const;

export const applicantBackgroundFields = [
  {
    name: "summary",
    label: "Professional summary",
    placeholder: "A short profile summary for the draft.",
    multiline: true,
  },
  {
    name: "experience",
    label: "Work experience",
    placeholder: "Summarize your recent roles, responsibilities, and impact.",
    multiline: true,
    description: "This can be concise or detailed. We’ll keep it readable.",
  },
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
] as const;

export const scratchIdentityStepSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address."),
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
});

export const scratchBackgroundStepSchema = z.object({
  summary: z.string().trim().optional(),
  experience: z.string().trim().min(1, "Add your work experience."),
  education: z.string().trim().optional(),
  skills: z.string().trim().min(1, "Add your skills."),
  achievements: z.string().trim().optional(),
});

export function buildApplicantInfoPayload(
  values: WizardApplicantInfoValues,
): DocumentApplicantInfoDto | undefined {
  const applicantInfo = {
    address: trimOrUndefined(values.address),
    achievements: trimOrUndefined(values.achievements),
    avatarUrl: trimOrUndefined(values.avatarUrl),
    city: trimOrUndefined(values.city),
    country: trimOrUndefined(values.country),
    education: trimOrUndefined(values.education),
    email: trimOrUndefined(values.email),
    experience: trimOrUndefined(values.experience),
    firstName: trimOrUndefined(values.firstName),
    lastName: trimOrUndefined(values.lastName),
    linkedIn: trimOrUndefined(values.linkedIn),
    phone: trimOrUndefined(values.phone),
    portfolio: trimOrUndefined(values.portfolio),
    skills: trimOrUndefined(values.skills),
    state: trimOrUndefined(values.state),
    summary: trimOrUndefined(values.summary),
    zip: trimOrUndefined(values.zip),
  };

  return Object.values(applicantInfo).some(Boolean) ? applicantInfo : undefined;
}
