/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { userControllerFindUserById } from "@/api/generated";
import { EnrichedUserDto } from "@/api/generated.schemas";

export function useEnrichedUser(id: any) {
  return useQuery<EnrichedUserDto | null>({
    queryKey: ["user", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        if (!id) return null;
        const { data } = await userControllerFindUserById(id);
        return data ?? null;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return null; // not logged in
        throw err; // real error
      }
    },
    retry: false,
  });
}
