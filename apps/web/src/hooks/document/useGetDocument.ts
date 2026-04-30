/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { documentControllerGetUserDocument } from "@/api/generated";

export function useGetDocument(documentId: string) {
  return useQuery({
    queryKey: ["document", documentId],
    enabled: !!documentId,
    queryFn: async () => {
      try {
        const { data } = await documentControllerGetUserDocument(documentId);
        return data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return null; // not logged in
        throw err; // real error
      }
    },
    retry: true,
  });
}
