import {
  CreateDocumentDtoCreationMode,
  DocumentType,
} from "@/api/generated.schemas";

export function trimOrUndefined(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : undefined;
}

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
