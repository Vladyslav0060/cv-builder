import { toast } from "sonner";

import { userControllerUpdateUser } from "@/api/generated";
import { UpdateUserDto } from "@/api/generated.schemas";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const currentUser = useCurrentUser();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: UpdateUserDto) => {
      const response = await userControllerUpdateUser(data);
      return response.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      if (currentUser?.id) {
        await qc.invalidateQueries({ queryKey: ["user", currentUser.id] });
      }
      toast.success("Profile saved");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to save profile");
    },
  });
  return {
    mutate,
    mutateAsync,
    isPending,
    isError,
    isSuccess,
    isLoading: isPending,
  };
};
