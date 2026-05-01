/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";

import { http } from "@/api/http";

export type AiUsageDto = {
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
};

export function useGetAiUsage() {
  return useQuery({
    queryKey: ["ai", "usage"],
    queryFn: async () => {
      try {
        const res = await http.request<AiUsageDto>({
          url: "/ai/usage",
          method: "GET",
        });

        return res.data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return null;
        throw err;
      }
    },
    retry: false,
  });
}
