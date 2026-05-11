"use client";

import { use, useState } from "react";

import { Editor } from "@/components/blocks/editor-md/editor";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { useDownloadDocumentPdf } from "@/hooks/document/useDownloadDocumentPdf";
import { useGetDocument } from "@/hooks/document/useGetDocument";
import { ResumePdfPreview } from "@/components/feature/document/ResumePdfPreview";

export const DocumentPage = ({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) => {
  const { documentId } = use(params);
  const { data: document } = useGetDocument(documentId);
  const currentUser = useCurrentUser();
  const [previewMarkdown, setPreviewMarkdown] = useState("");
  const { mutate: downloadPdf, isPending: isExportingPdf } =
    useDownloadDocumentPdf(documentId, document?.title ?? "resume");

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
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <section className="min-w-0">
            {document === undefined ? (
              <div className="min-h-[600px] rounded-xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground shadow-sm">
                Loading document...
              </div>
            ) : document ? (
              <Editor
                initialMarkdown={document.content}
                onMarkdownChange={setPreviewMarkdown}
              />
            ) : (
              <div className="min-h-[600px] rounded-xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground shadow-sm">
                Document could not be loaded.
              </div>
            )}
          </section>

          <section className="min-w-0">
            {document ? (
              <ResumePdfPreview
                className="sticky top-0.5"
                isExporting={isExportingPdf}
                onExport={() => downloadPdf()}
                markdown={previewMarkdown || document.content}
                profile={currentUser ?? undefined}
                title={document.title}
              />
            ) : (
              <Card className="sticky top-4 border-border/60 bg-card/80 shadow-sm backdrop-blur">
                <CardContent className="flex min-h-[600px] items-center justify-center p-6 text-sm text-muted-foreground">
                  PDF preview will appear here once the document loads.
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
};

export default DocumentPage;
