import puppeteer from 'puppeteer';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type {
  ResumeColorSchemeId,
  ResumeData,
  ResumeTemplateId,
} from '../shared/resume-constructor-data';
import { renderResumeConstructorHtml } from './resume-constructor-html';

let browserPromise: Promise<
  Awaited<ReturnType<typeof puppeteer.launch>>
> | null = null;

function findChromeExecutable(cacheDir: string) {
  const chromeRoot = join(cacheDir, 'chrome');

  if (!existsSync(chromeRoot)) {
    return null;
  }

  for (const entry of readdirSync(chromeRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const binaryPath = join(
      chromeRoot,
      entry.name,
      'chrome-linux64',
      'chrome',
    );

    if (existsSync(binaryPath)) {
      return binaryPath;
    }
  }

  return null;
}

function resolveChromeExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const cacheDirs = [
    process.env.PUPPETEER_CACHE_DIR,
    resolve(process.cwd(), '.cache', 'puppeteer'),
    resolve(process.cwd(), 'apps', 'api', '.cache', 'puppeteer'),
    '/opt/render/.cache/puppeteer',
    '/opt/render/project/src/.cache/puppeteer',
  ].filter((cacheDir): cacheDir is string => !!cacheDir);

  for (const cacheDir of cacheDirs) {
    const executablePath = findChromeExecutable(cacheDir);

    if (executablePath) {
      return executablePath;
    }
  }

  throw new Error(
    [
      'Could not find an installed Chrome binary for Puppeteer.',
      'Checked PUPPETEER_EXECUTABLE_PATH, PUPPETEER_CACHE_DIR, and common Render cache locations.',
      'Install Chrome into the app cache directory during build, or set PUPPETEER_EXECUTABLE_PATH explicitly at runtime.',
    ].join(' '),
  );
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: resolveChromeExecutablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }

  return browserPromise;
}

export async function createResumeConstructorPdfBuffer(
  resume: ResumeData,
  template: ResumeTemplateId = 'classic',
  colorScheme: ResumeColorSchemeId = 'slate',
) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = renderResumeConstructorHtml({
      resume,
      template,
      colorScheme,
    });

    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
