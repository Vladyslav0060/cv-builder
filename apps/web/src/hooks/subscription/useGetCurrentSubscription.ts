"use client";

import { useQuery } from "@tanstack/react-query";

import { http } from "@/api/http";

export type CurrentSubscriptionDto = {
  tier: "free" | "pro" | "max";
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: { CREATE: number; EXPORT: number };
};

export function useGetCurrentSubscription() {
  return useQuery({
    queryKey: ["subscription", "current"],
    queryFn: async () => {
      const res = await http.request<CurrentSubscriptionDto>({
        url: "/subscription/current",
        method: "GET",
      });
      return res.data;
    },
  });
}
