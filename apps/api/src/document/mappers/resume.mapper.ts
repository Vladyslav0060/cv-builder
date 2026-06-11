import type { Resume } from 'generated/prisma/client';
import type {
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeExportPayload,
  ResumeProject,
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
      projects: (resume.projects as unknown as ResumeProject[] | null)?.length
        ? (resume.projects as unknown as ResumeProject[])
        : undefined,
      certifications: (resume.certifications as unknown as ResumeCertification[] | null)
        ?.length
        ? (resume.certifications as unknown as ResumeCertification[])
        : undefined,
    },
    template: (resume.template ?? undefined) as ResumeExportPayload['template'],
    colorScheme: (resume.colorScheme ?? undefined) as ResumeExportPayload['colorScheme'],
  };
};
