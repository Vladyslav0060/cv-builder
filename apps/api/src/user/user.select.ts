import { Prisma } from 'generated/prisma/client';

export const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export const enrichedUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  achievements: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  education: true,
  experience: true,
  linkedIn: true,
  phone: true,
  skills: true,
  summary: true,
  portfolio: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type EnrichedUser = Prisma.UserGetPayload<{
  select: typeof enrichedUserSelect;
}>;
