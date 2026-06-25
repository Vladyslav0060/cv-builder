"use client";

import { useQuery } from "@tanstack/react-query";

import { http } from "@/api/http";

export type UsageBreakdown = {
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
};

export type GetUsageDto = {
  tier: "free" | "pro" | "max";
  create: UsageBreakdown;
  export: UsageBreakdown;
};

export function useGetUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const res = await http.request<GetUsageDto>({
        url: "/usage",
        method: "GET",
      });
      return res.data;
    },
  });
}
