import { http } from "@/api/http";
import { GetDocumentDto } from "@/api/generated.schemas";
import { ROUTES } from "@/common/routes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type CreateAiCoverLetterInput = {
  applicant: string;
  proposal: string;
  proof: string;
  preferences?: string;
};

export const useCreateAiCoverLetter = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateAiCoverLetterInput) => {
      const response = await http.post<GetDocumentDto>(
        "/document/cover-letter/ai",
        data,
      );

      return response.data;
    },
    onSuccess: (document) => {
      router.push(`${ROUTES.COVER_LETTER}/${document.id}`);
    },
    onError: () => {
      toast.error(
        "Could not generate the cover letter. Add a little more detail and try again.",
      );
    },
  });
};
