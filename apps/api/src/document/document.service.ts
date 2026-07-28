import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { DocumentType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { documentSelect } from './document.select';
import { type ResumeExportPayload } from '../shared/resume-constructor-data';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async getUserDocumentById(
    userId: string,
    documentId: string,
  ): Promise<GetDocumentDto> {
    return this.prisma.forUser(userId, (tx) =>
      tx.document.findUniqueOrThrow({
        where: { id: documentId, AND: { userId } },
        select: documentSelect,
      }),
    );
  }

  async getUserDocumentsPreview(
    userId: string,
  ): Promise<GetDocumentsPreviewDto[]> {
    return this.prisma.forUser(userId, (tx) =>
      tx.document.findMany({
        where: { userId },
        select: {
          title: true,
          type: true,
          id: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async createDocument(
    userId: string,
    createDocumentDto: CreateDocumentDto,
    content: string | null,
  ) {
    const { type, jobTitle } = createDocumentDto;
    return this.prisma.forUser(userId, (tx) =>
      tx.document.create({
        data: {
          userId,
          content,
          title: jobTitle,
          type,
        },
      }),
    );
  }

  async createResumeDocument(userId: string, title: string) {
    return this.prisma.forUser(userId, (tx) =>
      tx.document.create({
        data: {
          userId,
          content: null,
          title,
          type: DocumentType.RESUME,
        },
      }),
    );
  }

  async createCoverLetterDocument(
    userId: string,
    title: string,
    content: string,
  ) {
    return this.prisma.forUser(userId, (tx) =>
      tx.document.create({
        data: {
          userId,
          content,
          title,
          type: DocumentType.COVER_LETTER,
        },
      }),
    );
  }

  async updateDocumentContent(
    userId: string,
    documentId: string,
    content: string,
  ): Promise<GetDocumentDto> {
    return this.prisma.forUser(userId, (tx) =>
      tx.document.update({
        where: { id: documentId, AND: { userId } },
        data: { content },
        select: documentSelect,
      }),
    );
  }

  async getResumeByDocumentId(userId: string, documentId: string) {
    return this.prisma.forUser(userId, async (tx) => {
      await tx.document.findUniqueOrThrow({
        where: { id: documentId, AND: { userId } },
        select: { id: true },
      });

      return tx.resume.findUnique({ where: { documentId } });
    });
  }

  async upsertResume(
    userId: string,
    documentId: string,
    payload: ResumeExportPayload,
  ) {
    const { resume, template, colorScheme } = payload;
    const data = {
      fullName: resume.personalInfo.fullName,
      title: resume.personalInfo.title,
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      website: resume.personalInfo.website,
      linkedin: resume.personalInfo.linkedin,
      github: resume.personalInfo.github,
      upwork: resume.personalInfo.upwork,
      summary: resume.summary,
      skills: resume.skills,
      languages: resume.languages ?? [],
      experience: resume.experience as unknown as Prisma.InputJsonValue,
      education: resume.education as unknown as Prisma.InputJsonValue,
      projects: (resume.projects ?? []) as unknown as Prisma.InputJsonValue,
      certifications: (resume.certifications ??
        []) as unknown as Prisma.InputJsonValue,
      template,
      colorScheme,
    };

    return this.prisma.forUser(userId, async (tx) => {
      await tx.document.findUniqueOrThrow({
        where: { id: documentId, AND: { userId } },
        select: { id: true },
      });

      return tx.resume.upsert({
        where: { documentId },
        create: { documentId, ...data },
        update: data,
      });
    });
  }
}
