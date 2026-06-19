import { authControllerVerifyEmail } from "@/api/generated";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useVerifyEmail = () => {
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (token: string) => {
      const response = await authControllerVerifyEmail({ token });
      return response.data;
    },
    onSuccess: () => {
      toast("Email verified successfully!");
    },
  });
  return { mutate, mutateAsync, isPending, isError, isSuccess };
};
