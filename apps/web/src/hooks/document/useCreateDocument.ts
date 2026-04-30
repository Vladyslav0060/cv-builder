import { documentControllerCreateDocument } from "@/api/generated";
import { CreateDocumentDto } from "@/api/generated.schemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateDocument = () => {
  const router = useRouter();
  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: CreateDocumentDto) => {
      const response = await documentControllerCreateDocument(data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
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
