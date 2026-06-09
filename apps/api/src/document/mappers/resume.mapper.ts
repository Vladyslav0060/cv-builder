import type { Resume } from 'generated/prisma/client';
import type {
  ResumeEducation,
  ResumeExperience,
  ResumeExportPayload,
} from '../../shared/resume-constructor-data';

export const toResumeExportPayload = (resume: Resume): ResumeExportPayload => {
  return {
    resume: {
      personalInfo: {
        fullName: resume.fullName,
        title: resume.title,
        email: resume.email,
        phone: resume.phone ?? undefined,
        location: resume.location ?? undefined,
        website: resume.website ?? undefined,
        linkedin: resume.linkedin ?? undefined,
        github: resume.github ?? undefined,
      },
      summary: resume.summary ?? undefined,
      experience: (resume.experience as unknown as ResumeExperience[]) ?? [],
      education: (resume.education as unknown as ResumeEducation[]) ?? [],
      skills: resume.skills ?? [],
      languages: resume.languages ?? undefined,
    },
    template: (resume.template ?? undefined) as ResumeExportPayload['template'],
    colorScheme: (resume.colorScheme ?? undefined) as ResumeExportPayload['colorScheme'],
  };
};
