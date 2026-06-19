import { authControllerResetPassword } from "@/api/generated";
import { ResetPasswordDto } from "@/api/generated.schemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/common/routes";

export const useResetPassword = () => {
  const router = useRouter();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const response = await authControllerResetPassword(data);
      return response.data;
    },
    onSuccess: () => {
      toast("Password updated successfully");
      router.push(ROUTES.LOGIN);
    },
  });
  return { mutate, mutateAsync, isPending, isError, isSuccess };
};
