import { userControllerUpdateUser } from "@/api/generated";
import { UpdateUserDto } from "@/api/generated.schemas";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useUpdateUser = () => {
  const router = useRouter();
  const qc = useQueryClient();
  const currentUser = useCurrentUser();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: UpdateUserDto) => {
      const response = await userControllerUpdateUser(data);
      return response.data;
    },
    onSuccess: async (data) => {
      console.log(data);
      await qc.invalidateQueries({ queryKey: ["me"] });
      if (currentUser?.id) {
        await qc.invalidateQueries({ queryKey: ["user", currentUser.id] });
      }
      router.push("/");
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return {
    mutate,
    mutateAsync,
    isPending,
    isError,
    isSuccess,
    isLoading: isPending, //todo
  };
};
