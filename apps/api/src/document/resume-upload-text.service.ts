import { BadRequestException, Injectable } from '@nestjs/common';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export type ResumeUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const MAX_EXTRACTED_TEXT_LENGTH = 24000;

const JOINED_TERM_REPAIRS: Array<[RegExp, string]> = [
  [/\bJava Script\b/g, 'JavaScript'],
  [/\bType Script\b/g, 'TypeScript'],
  [/\bGit Hub\b/g, 'GitHub'],
  [/\bGit Lab\b/g, 'GitLab'],
  [/\bLinked In\b/g, 'LinkedIn'],
  [/\bUp Work\b/g, 'Upwork'],
  [/\bPostgre SQL\b/g, 'PostgreSQL'],
  [/\bMy SQL\b/g, 'MySQL'],
  [/\bMongo DB\b/g, 'MongoDB'],
  [/\bGraph QL\b/g, 'GraphQL'],
  [/\bTan Stack\b/g, 'TanStack'],
  [/\bCloud Flare\b/g, 'Cloudflare'],
  [/\bFire Base\b/g, 'Firebase'],
  [/\bSup Base\b/g, 'Supabase'],
  [/\bREST API s\b/g, 'REST APIs'],
  [/\bAPI s\b/g, 'APIs'],
  [/\bUI UX\b/g, 'UI/UX'],
  [/\bi OS\b/g, 'iOS'],
  [/\bmac OS\b/g, 'macOS'],
  [/\bAWS S 3\b/g, 'AWS S3'],
];

function repairMissingSpaces(text: string) {
  let repaired = text
    .split(String.fromCharCode(0))
    .join(' ')
    .replace(/\u00a0/g, ' ')
    .replace(/(https?:\/\/[^\s]+?)(?=https?:\/\/)/gi, '$1 ')
    .replace(
      /\b(Email|Phone|Location|Website|Portfolio|LinkedIn|GitHub|Github|Upwork):?(?=\S)/g,
      '$1: ',
    )
    .replace(
      /(Summary|Profile|Experience|Employment|Education|Skills|Projects|Certifications?|Languages)(?=[A-Z0-9])/g,
      '\n$1\n',
    )
    .replace(
      /([a-z])(?=(?:Email|Phone|Location|Website|Portfolio|LinkedIn|GitHub|Github|Upwork|Summary|Profile|Experience|Employment|Education|Skills|Projects|Certifications?|Languages)(?:[A-Z0-9:]|\b))/g,
      '$1\n',
    )
    .replace(/([,;:])(?=\S)/g, '$1 ')
    .replace(/\b(https?):\s+\/\//gi, '$1://')
    .replace(/([.!?])(?=[A-Z][a-z])/g, '$1 ')
    .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2');

  for (const [pattern, replacement] of JOINED_TERM_REPAIRS) {
    repaired = repaired.replace(pattern, replacement);
  }

  return repaired;
}

function normalizeExtractedText(text: string) {
  return repairMissingSpaces(text)
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EXTRACTED_TEXT_LENGTH);
}

@Injectable()
export class ResumeUploadTextService {
  async extractText(file?: ResumeUploadFile): Promise<string> {
    if (!file) return '';

    if (file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: file.buffer });

      try {
        const result = await parser.getText();
        return normalizeExtractedText(result.text);
      } catch {
        throw new BadRequestException(
          'We could not read text from that PDF. Try uploading a text-based PDF or paste the CV details into the form.',
        );
      } finally {
        await parser.destroy();
      }
    }

    if (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'text/markdown' ||
      file.originalname.toLowerCase().endsWith('.txt') ||
      file.originalname.toLowerCase().endsWith('.md')
    ) {
      return normalizeExtractedText(file.buffer.toString('utf8'));
    }

    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return normalizeExtractedText(result.value);
      } catch {
        throw new BadRequestException(
          'We could not read text from that DOCX file. Try uploading a PDF or paste the CV details into the form.',
        );
      }
    }

    throw new BadRequestException('Upload a PDF, DOCX, TXT, or Markdown CV.');
  }
}
