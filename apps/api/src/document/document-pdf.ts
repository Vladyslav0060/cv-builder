import * as React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  ResumePdfDocument,
  type ResumeProfile,
} from "../shared/resume-pdf-document";

export async function createDocumentPdfBuffer(
  title: string,
  markdown: string,
  profile?: ResumeProfile,
) {
  return renderToBuffer(
    React.createElement(ResumePdfDocument, { markdown, profile, title }),
  );
}
