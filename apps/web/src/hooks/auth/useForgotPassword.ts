import { authControllerForgotPassword } from "@/api/generated";
import { ForgotPasswordDto } from "@/api/generated.schemas";
import { useMutation } from "@tanstack/react-query";

export const useForgotPassword = () => {
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: ForgotPasswordDto) => {
      const response = await authControllerForgotPassword(data);
      return response.data;
    },
  });
  return { mutate, mutateAsync, isPending, isError, isSuccess };
};
