import { Injectable } from '@nestjs/common';
import { AiResumeResult } from 'src/ai/ai.service';
import { EnrichedUser } from 'src/user/user.select';
import { ResumeExportPayload } from '../shared/resume-constructor-data';
import { DocumentApplicantInfoDto } from './dto/create-document.dto';

type ResumeApplicantSource = DocumentApplicantInfoDto | EnrichedUser;

@Injectable()
export class ResumeMappingService {
  fromApplicantInfo(
    applicantSource: ResumeApplicantSource,
    jobTitle: string,
    aiResumeData: AiResumeResult | null,
  ): ResumeExportPayload {
    const fullName = [applicantSource.firstName, applicantSource.lastName]
      .filter(Boolean)
      .join(' ');
    const location = [
      applicantSource.city,
      applicantSource.state,
      applicantSource.country,
    ]
      .filter(Boolean)
      .join(', ');
    const fallbackSkills = applicantSource.skills
      ? applicantSource.skills
          .split(/[,\n]+/)
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    return {
      resume: {
        personalInfo: {
          fullName,
          title: aiResumeData?.title ?? jobTitle,
          email: applicantSource.email ?? '',
          ...(applicantSource.phone && { phone: applicantSource.phone }),
          ...(location && { location }),
          ...(applicantSource.portfolio && {
            website: applicantSource.portfolio,
          }),
          ...(applicantSource.linkedIn && {
            linkedin: applicantSource.linkedIn,
          }),
        },
        summary: aiResumeData?.summary ?? applicantSource.summary ?? undefined,
        experience: (aiResumeData?.experience ?? []).map((experience) => ({
          ...experience,
          endDate: experience.endDate ?? undefined,
        })),
        education: (aiResumeData?.education ?? []).map((education) => ({
          ...education,
          endDate: education.endDate ?? undefined,
        })),
        skills: aiResumeData?.skills ?? fallbackSkills,
        languages: aiResumeData?.languages ?? [],
        projects: (aiResumeData?.projects ?? []).map((project) => ({
          ...project,
          endDate: project.endDate ?? undefined,
        })),
        certifications: aiResumeData?.certifications ?? [],
      },
    };
  }
}
