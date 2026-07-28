import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { subscriptionControllerCreateCheckoutSession } from "@/api/generated";
import { CreateCheckoutSessionDto } from "@/api/generated.schemas";

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCheckoutSessionDto) => {
      const response = await subscriptionControllerCreateCheckoutSession(data);
      return response.data;
    },
    onSuccess: (session) => {
      if (session.url) window.location.href = session.url;
      else {
        queryClient.invalidateQueries({
          queryKey: ["subscription", "current"],
        });
        toast.success("Subscription updated.");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Couldn't start checkout. Please try again.");
    },
  });
}
