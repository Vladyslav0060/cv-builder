"use client";

import { use } from "react";

import { ResumeConstructor } from "@/components/feature/document/resume-constructor/ResumeConstructor";

export default function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);

  return <ResumeConstructor documentId={documentId} />;
}
