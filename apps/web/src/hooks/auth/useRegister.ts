import { authControllerSignUp } from "@/api/generated";
import { CreateUserDto } from "@/api/generated.schemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useRegister = () => {
  const router = useRouter();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await authControllerSignUp(data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      router.push("/login");
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
  };
};
