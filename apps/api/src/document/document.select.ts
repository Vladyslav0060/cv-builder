import { Prisma } from 'generated/prisma/client';

export const documentSelect = {
  content: true,
  createdAt: true,
  id: true,
  title: true,
  type: true,
  updatedAt: true,
  userId: true,
} satisfies Prisma.DocumentSelect;

export type DocumentSelectType = Prisma.UserGetPayload<{
  select: typeof documentSelect;
}>;
