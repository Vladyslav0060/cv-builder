import puppeteer from "puppeteer";

import type {
  ResumeColorSchemeId,
  ResumeData,
  ResumeTemplateId,
} from "../shared/resume-constructor-data";
import { renderResumeConstructorHtml } from "./resume-constructor-html";

let browserPromise: Promise<Awaited<ReturnType<typeof puppeteer.launch>>> | null =
  null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return browserPromise;
}

export async function createResumeConstructorPdfBuffer(
  resume: ResumeData,
  template: ResumeTemplateId = "classic",
  colorScheme: ResumeColorSchemeId = "slate",
) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = renderResumeConstructorHtml({
      resume,
      template,
      colorScheme,
    });

    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
