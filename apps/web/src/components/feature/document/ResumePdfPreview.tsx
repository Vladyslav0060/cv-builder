"use client";

import { BlobProvider } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  ResumePdfDocument,
  type ResumeProfile,
} from "../../../shared/resume-pdf-document";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PREVIEW_PADDING = 24;

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function PdfBlobPreview({ blobUrl }: { blobUrl: string | undefined }) {
  const { ref, size } = useElementSize<HTMLDivElement>();

  const scale = useMemo(() => {
    if (!size.width || !size.height) {
      return 1;
    }

    const availableWidth = Math.max(size.width - PREVIEW_PADDING * 2, 1);
    const availableHeight = Math.max(size.height - PREVIEW_PADDING * 2, 1);

    return Math.min(
      1,
      availableWidth / A4_WIDTH_PX,
      availableHeight / A4_HEIGHT_PX,
    );
  }, [size.height, size.width]);

  return (
    <div
      ref={ref}
      className="relative min-h-[72vh] flex-1 overflow-hidden bg-slate-100/70"
    >
      <div
        className="absolute top-0 size-full"
        style={{
          minWidth: A4_WIDTH_PX,
          minHeight: A4_HEIGHT_PX,
          height: "100%",
          overflowY: "visible",
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {blobUrl ? (
          <iframe
            title="Resume PDF preview"
            src={blobUrl}
            className="block h-full w-full border-0 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.14)]"
          />
        ) : null}
      </div>
    </div>
  );
}

export function ResumePdfPreview({
  className,
  markdown,
  isExporting,
  onExport,
  profile,
  title,
}: {
  className?: string;
  isExporting?: boolean;
  markdown: string;
  onExport?: () => void;
  profile?: ResumeProfile;
  title: string;
}) {
  const document = useMemo(
    () => (
      <ResumePdfDocument markdown={markdown} profile={profile} title={title} />
    ),
    [markdown, profile, title],
  );

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-col border-border/60 bg-card/80 shadow-sm backdrop-blur",
        className,
      )}
    >
      <CardHeader className="flex-row items-center justify-between border-b border-border/60 pb-4">
        <CardTitle className="text-base">PDF preview</CardTitle>
        {onExport ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            disabled={isExporting}
          >
            <Download className="size-4" />
            Export PDF
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <BlobProvider document={document}>
          {({ url, loading, error }) => {
            if (error) {
              return (
                <div className="flex min-h-[72vh] items-center justify-center bg-slate-100/70 p-6 text-sm text-muted-foreground">
                  PDF preview unavailable
                </div>
              );
            }

            if (loading || !url) {
              return (
                <div className="flex min-h-[72vh] items-center justify-center bg-slate-100/70 p-6 text-sm text-muted-foreground">
                  Rendering preview...
                </div>
              );
            }

            return <PdfBlobPreview blobUrl={url} />;
          }}
        </BlobProvider>
      </CardContent>
    </Card>
  );
}
