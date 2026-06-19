"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/api/http";
import { useCurrentUser } from "@/hooks/auth/current-user";

export function useUploadAvatar() {
  const qc = useQueryClient();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await http.post<{ avatarUrl: string }>("/user/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      if (currentUser?.id) {
        await qc.invalidateQueries({ queryKey: ["user", currentUser.id] });
      }
      toast.success("Avatar updated");
    },
    onError: () => {
      toast.error("Failed to upload avatar");
    },
  });
}

export function useRemoveAvatar() {
  const qc = useQueryClient();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: async () => {
      await http.delete("/user/avatar");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      if (currentUser?.id) {
        await qc.invalidateQueries({ queryKey: ["user", currentUser.id] });
      }
      toast.success("Avatar removed");
    },
    onError: () => {
      toast.error("Failed to remove avatar");
    },
  });
}
