/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";

import { documentControllerGetResumeData } from "@/api/generated";
import type { ResumeExportPayload } from "@/shared/resume-constructor-data";

export function useGetResume(documentId: string) {
  return useQuery({
    queryKey: ["resume", documentId],
    enabled: !!documentId,
    queryFn: async (): Promise<ResumeExportPayload | null> => {
      try {
        const { data } = await documentControllerGetResumeData(documentId);
        const payload = data as unknown;
        if (!payload || typeof payload !== "object" || !("resume" in payload)) {
          return null;
        }
        return payload as ResumeExportPayload;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403 || status === 404) return null;
        throw err;
      }
    },
    retry: true,
  });
}
