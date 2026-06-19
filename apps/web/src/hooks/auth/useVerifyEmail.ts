import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/api/http";

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: async (code: string) => {
      const response = await http.post<{ ok: boolean }>("/auth/verify-email", {
        code,
      });
      return response.data;
    },
    onSuccess: () => {
      toast("Email verified successfully!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  return { mutate, mutateAsync, isPending, isError, isSuccess, error };
};
