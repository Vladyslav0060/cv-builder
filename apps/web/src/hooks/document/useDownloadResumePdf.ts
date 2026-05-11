"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { http } from "@/api/http";
import type { ResumeExportPayload } from "@/shared/resume-constructor-data";

function sanitizeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[^\w.-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "resume"
  );
}

export function useDownloadResumePdf(payload: ResumeExportPayload) {
  return useMutation({
    mutationFn: async () => {
      const response = await http.request<Blob>({
        method: "POST",
        responseType: "blob",
        url: "/document/resume/pdf",
        data: payload,
      });

      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${sanitizeFilename(payload.resume.personalInfo.fullName)}.pdf`;
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
