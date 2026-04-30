/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { authControllerMe } from "@/api/generated";
import { EnrichedUserDto, MeDto } from "@/api/generated.schemas";
import { useCurrentUser } from "@/hooks/auth/current-user";

function toMeDto(
  user: EnrichedUserDto | null | undefined,
): MeDto | null | undefined {
  if (!user) return user;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function useMe() {
  const currentUser = useCurrentUser();
  const initialMe = toMeDto(currentUser);

  return useQuery<(MeDto & { isAuthenticated: boolean }) | null>({
    queryKey: ["me"],
    initialData:
      currentUser === undefined
        ? undefined
        : initialMe
          ? { ...initialMe, isAuthenticated: true }
          : null,
    staleTime: 0,
    queryFn: async () => {
      try {
        const { data } = await authControllerMe();
        const isAuthenticated = data && !!data.id;
        const result = { ...data, isAuthenticated };
        return result ?? null;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return null; // not logged in
        throw err; // real error
      }
    },
    retry: false,
  });
}
