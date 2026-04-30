import { authControllerLogin } from "@/api/generated";
import { LoginDto } from "@/api/generated.schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogin = () => {
  const router = useRouter();
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await authControllerLogin(data);
      return response.data;
    },
    onSuccess: async (data) => {
      console.log(data);
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast("Logged in successfully");
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
  };
};
