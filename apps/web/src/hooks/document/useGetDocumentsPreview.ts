import { documentControllerGetUserDocumentsPreview } from "@/api/generated";
import { useQuery } from "@tanstack/react-query";

export const useGetDocumentsPreview = () => {
  return useQuery({
    queryKey: ["documents", "preview"],
    queryFn: async () => {
      const res = await documentControllerGetUserDocumentsPreview();
      return res.data;
    },
  });
};
