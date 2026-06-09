"use client";

import { useQuery } from "@tanstack/react-query";

import { userControllerFindUserById } from "@/api/generated";
import type { EnrichedUserDto } from "@/api/generated.schemas";

import { useMe } from "./useMe";

export function useEnrichedMe() {
  const { data: me } = useMe();
  const userId = me?.id;

  return useQuery<EnrichedUserDto | null>({
    queryKey: ["user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await userControllerFindUserById(userId!);
      return (data as EnrichedUserDto) ?? null;
    },
    staleTime: 60_000,
  });
}
