"use client";

import { ResumeConstructor } from "@/components/feature/document/resume-constructor/ResumeConstructor";
import { Container } from "@/components/ui/container";

export default function Page() {
  return (
    <Container variant={"constrainedBreakpointPadded"} paddingY={"sm"}>
      <ResumeConstructor />
    </Container>
  );
}
