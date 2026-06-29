import { useQuery } from "@tanstack/react-query";

import { subscriptionControllerGetPlans } from "@/api/generated";

export function usePlans() {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: async () => {
      const response = await subscriptionControllerGetPlans();
      return response.data;
    },
    staleTime: 60_000,
  });
}
