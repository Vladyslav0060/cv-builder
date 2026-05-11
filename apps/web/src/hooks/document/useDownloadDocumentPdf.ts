"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { http } from "@/api/http";

function sanitizeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[^\w.-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "resume"
  );
}

export function useDownloadDocumentPdf(documentId: string, title: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await http.request<Blob>({
        method: "GET",
        responseType: "blob",
        url: `/document/${documentId}/pdf`,
      });

      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${sanitizeFilename(title)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
    },
    onError: () => {
      toast.error("Failed to export PDF");
    },
  });
}
