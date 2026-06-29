"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { http } from "@/api/http";

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await http.request({ url: "/subscription/cancel", method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
      toast.success("Your subscription will be canceled at the end of the billing period.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Couldn't cancel your subscription. Please try again.");
    },
  });
}
