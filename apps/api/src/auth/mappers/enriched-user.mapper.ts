import { EnrichedUser } from 'src/user/user.select';
import { EnrichedUserDto } from 'src/user/dto/enriched-user.dto';

export function toEnrichedUserDto(user: EnrichedUser): EnrichedUserDto {
  const profileFields = [
    user.firstName,
    user.lastName,
    user.avatarUrl,
    user.address,
    user.city,
    user.state,
    user.zip,
    user.country,
    user.linkedIn,
    user.phone,
    user.skills,
    user.experience,
    user.education,
    user.achievements,
    user.summary,
    user.portfolio,
  ];

  const filledFields = profileFields.filter((field) => {
    if (typeof field !== 'string') {
      return false;
    }

    return field.trim().length > 0;
  }).length;

  const profileFilledPercentage = Math.round(
    (filledFields / profileFields.length) * 100,
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    avatarUrl: user.avatarUrl ?? '',
    role: user.role as any,
    address: user.address ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    zip: user.zip ?? '',
    country: user.country ?? '',
    linkedIn: user.linkedIn ?? '',
    phone: user.phone ?? '',
    skills: user.skills ?? '',
    experience: user.experience ?? '',
    education: user.education ?? '',
    achievements: user.achievements ?? '',
    summary: user.summary ?? '',
    portfolio: user.portfolio ?? '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profileFilledPercentage,
  };
}
