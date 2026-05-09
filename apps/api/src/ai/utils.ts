import { EnrichedUser } from 'src/user/user.select';
import { DocumentApplicantInfoDto } from 'src/document/dto/create-document.dto';

type ApplicantInfoLike = Pick<
  EnrichedUser | DocumentApplicantInfoDto,
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'avatarUrl'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'linkedIn'
  | 'portfolio'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'achievements'
>;

export const buildApplicantInfo = (userProfile: ApplicantInfoLike): string => {
  const applicantInfo = `
    Applicant Information:
    Name: ${[userProfile?.firstName, userProfile?.lastName]
      .filter(Boolean)
      .join(' ')}
Email: ${userProfile?.email ?? ''}
Phone: ${userProfile?.phone ?? ''}
Address: ${[userProfile?.address, userProfile?.city, userProfile?.state, userProfile?.zip, userProfile?.country]
    .filter(Boolean)
    .join(', ')}
LinkedIn: ${userProfile?.linkedIn ?? ''}
Portfolio: ${userProfile?.portfolio ?? ''}

Summary:
${userProfile?.summary ?? ''}

Skills:
${userProfile?.skills ?? ''}

Experience:
${userProfile?.experience ?? ''}

Education:
${userProfile?.education ?? ''}

Achievements:
${userProfile?.achievements ?? ''}
`.trim();
  return applicantInfo;
};
