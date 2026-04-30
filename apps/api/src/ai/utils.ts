import { EnrichedUser } from 'src/user/user.select';

export const buildApplicantInfo = (userProfile: EnrichedUser): string => {
  const applicantInfo = `
    Applicant Information:
    Name: ${[userProfile?.firstName, userProfile?.lastName]
      .filter(Boolean)
      .join(' ')}
Email: ${userProfile?.email ?? ''}
Phone: ${userProfile?.phone ?? ''}
Address: ${[userProfile?.address, userProfile?.city, userProfile?.zip]
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
