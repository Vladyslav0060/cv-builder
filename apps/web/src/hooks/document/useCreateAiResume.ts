import { http } from "@/api/http";
import { GetDocumentDto } from "@/api/generated.schemas";
import { ROUTES } from "@/common/routes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type CreateAiResumeInput = {
  introduction: string;
  background: string;
  target?: string;
  file?: File | null;
};

export const useCreateAiResume = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: CreateAiResumeInput) => {
      const form = new FormData();
      form.append("introduction", data.introduction);
      form.append("background", data.background);

      if (data.target?.trim()) {
        form.append("target", data.target.trim());
      }

      if (data.file) {
        form.append("file", data.file);
      }

      const response = await http.post<GetDocumentDto>(
        "/document/resume/ai",
        form,
      );

      return response.data;
    },
    onSuccess: (document) => {
      router.push(`${ROUTES.RESUME}/${document.id}`);
    },
    onError: () => {
      toast.error(
        "Could not generate the resume. Add a little more detail and try again.",
      );
    },
  });

  return mutation;
};
