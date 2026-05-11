"use client";

import { use } from "react";

import { Editor } from "@/components/blocks/editor-md/editor";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { useGetDocument } from "@/hooks/document/useGetDocument";

export const DocumentPage = ({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) => {
  const { documentId } = use(params);
  const { data: document } = useGetDocument(documentId);

  return (
    <div className="flex flex-col">
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
          <div className="min-h-[600px] p-4 text-sm text-muted-foreground">
            Loading document...
          </div>
        ) : document ? (
          <Editor initialMarkdown={document.content} />
        ) : (
          <div className="min-h-[600px] p-4 text-sm text-muted-foreground">
            Document could not be loaded.
          </div>
        )}
      </Container>
    </div>
  );
};

export default DocumentPage;
