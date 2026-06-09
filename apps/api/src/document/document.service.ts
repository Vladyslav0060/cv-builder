import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
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
    return this.prisma.document.findUniqueOrThrow({
      where: { id: documentId, AND: { userId } },
      select: documentSelect,
    });
  }

  async getUserDocumentsPreview(
    userId: string,
  ): Promise<GetDocumentsPreviewDto[]> {
    return this.prisma.document.findMany({
      where: { userId },
      select: {
        title: true,
        type: true,
        id: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDocument(
    userId: string,
    createDocumentDto: CreateDocumentDto,
    content: string | null,
  ) {
    try {
      const { type, jobTitle } = createDocumentDto;
      return this.prisma.document.create({
        data: {
          userId,
          content,
          title: jobTitle,
          type,
        },
      });
    } catch (error) {}
  }

  async getResumeByDocumentId(userId: string, documentId: string) {
    await this.prisma.document.findUniqueOrThrow({
      where: { id: documentId, AND: { userId } },
      select: { id: true },
    });

    return this.prisma.resume.findUnique({ where: { documentId } });
  }

  async upsertResume(
    userId: string,
    documentId: string,
    payload: ResumeExportPayload,
  ) {
    await this.prisma.document.findUniqueOrThrow({
      where: { id: documentId, AND: { userId } },
      select: { id: true },
    });

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
      summary: resume.summary,
      skills: resume.skills,
      languages: resume.languages ?? [],
      experience: resume.experience as unknown as Prisma.InputJsonValue,
      education: resume.education as unknown as Prisma.InputJsonValue,
      template,
      colorScheme,
    };

    return this.prisma.resume.upsert({
      where: { documentId },
      create: { documentId, ...data },
      update: data,
    });
  }
}
