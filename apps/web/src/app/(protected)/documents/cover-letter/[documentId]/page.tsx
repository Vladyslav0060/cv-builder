"use client";

import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Editor } from "@/components/blocks/editor-md/editor";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { Container } from "@/components/ui/container";
import { useGetDocument } from "@/hooks/document/useGetDocument";
import { useUpdateDocumentContent } from "@/hooks/document/useUpdateDocumentContent";

const SAVE_TOAST_ID = "cover-letter-unsaved-changes";

export const DocumentPage = ({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) => {
  const { documentId } = use(params);
  const { data: document } = useGetDocument(documentId);
  const { mutate: updateContent } = useUpdateDocumentContent(documentId);

  const [markdown, setMarkdown] = useState<string | null>(null);
  const markdownRef = useRef<string | null>(null);
  const savedMarkdownRef = useRef<string | null>(null);

  useEffect(() => {
    if (document === undefined || savedMarkdownRef.current !== null) return;
    savedMarkdownRef.current = document?.content ?? "";
  }, [document]);

  useEffect(() => {
    if (markdown === null || savedMarkdownRef.current === null) return;

    if (markdown !== savedMarkdownRef.current) {
      toast("Unsaved changes", {
        id: SAVE_TOAST_ID,
        duration: Infinity,
        action: {
          label: "Save",
          onClick: () => {
            const content = markdownRef.current ?? "";
            updateContent(content, {
              onSuccess: (saved) => {
                savedMarkdownRef.current = saved.content ?? "";
                toast.dismiss(SAVE_TOAST_ID);
                toast.success("Cover letter saved");
              },
            });
          },
        },
      });
    } else {
      toast.dismiss(SAVE_TOAST_ID);
    }
  }, [markdown, updateContent]);

  useEffect(() => {
    return () => {
      toast.dismiss(SAVE_TOAST_ID);
    };
  }, []);

  return (
    <div className="flex flex-col pb-14">
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.DOCUMENTS, title: "Documents" },
          {
            href: `${ROUTES.DOCUMENTS}/${documentId}`,
            title: document?.title ?? "Document",
          },
        ]}
      />
      <Container variant={"fullMobileConstrainedBreakpointPadded"}>
        {document === undefined ? (
          <div className="min-h-150 p-4 text-sm text-muted-foreground">
            Loading document...
          </div>
        ) : document ? (
          <Editor
            initialMarkdown={document.content ?? undefined}
            onMarkdownChange={(value) => {
              markdownRef.current = value;
              setMarkdown(value);
            }}
          />
        ) : (
          <div className="min-h-150 p-4 text-sm text-muted-foreground">
            Document could not be loaded.
          </div>
        )}
      </Container>
    </div>
  );
};

export default DocumentPage;
