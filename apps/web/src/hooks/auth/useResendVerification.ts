import { authControllerResendVerification } from "@/api/generated";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useResendVerification = () => {
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async () => {
      const response = await authControllerResendVerification();
      return response.data;
    },
    onSuccess: () => {
      toast("Verification email sent – check your inbox");
    },
  });
  return { mutate, mutateAsync, isPending, isError, isSuccess };
};
