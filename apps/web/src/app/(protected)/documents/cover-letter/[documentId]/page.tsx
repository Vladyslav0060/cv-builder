"use client";

import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Editor } from "@/components/blocks/editor-md/editor";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
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
          <div className="min-h-150 rounded-xl border bg-card/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b p-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={index % 3 === 0 ? "h-8 w-20" : "h-8 w-8"}
                />
              ))}
            </div>
            <div className="space-y-4 p-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={index === 4 ? "h-4 w-3/5" : "h-4 w-full"}
                  />
                ))}
              </div>
            </div>
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
