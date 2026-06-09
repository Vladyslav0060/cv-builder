"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { documentControllerSaveResumeData } from "@/api/generated";
import type { ResumeExportPayload } from "@/shared/resume-constructor-data";
import type { ResumeExportPayloadDto } from "@/api/generated.schemas";

export function useSaveResume(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ResumeExportPayload) => {
      const { data } = await documentControllerSaveResumeData(
        documentId,
        payload as ResumeExportPayloadDto,
      );
      return data as ResumeExportPayload;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["resume", documentId], data);
    },
    onError: () => {
      toast.error("Failed to save resume");
    },
  });
}
