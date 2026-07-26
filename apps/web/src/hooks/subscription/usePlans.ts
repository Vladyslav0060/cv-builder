import { useQuery } from "@tanstack/react-query";

import { subscriptionControllerGetPlans } from "@/api/generated";
import type { PlanDto } from "@/api/generated.schemas";

export function usePlans(initialData?: PlanDto[]) {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: async () => {
      const response = await subscriptionControllerGetPlans();
      return response.data;
    },
    initialData,
    staleTime: 60_000,
  });
}
