"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { documentControllerUpdateDocumentContent } from "@/api/generated";

export function useUpdateDocumentContent(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await documentControllerUpdateDocumentContent(
        documentId,
        { content },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["document", documentId], data);
    },
    onError: () => {
      toast.error("Failed to save document");
    },
  });
}
