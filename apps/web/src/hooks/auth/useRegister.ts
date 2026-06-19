import { authControllerSignUp } from "@/api/generated";
import { CreateUserDto } from "@/api/generated.schemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useRegister = () => {
  const router = useRouter();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await authControllerSignUp(data);
      return response.data;
    },
    onSuccess: () => {
      router.push("/verify-email");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("An account with this email already exists.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    },
  });
  return {
    mutate,
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
