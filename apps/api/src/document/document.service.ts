import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { documentSelect } from './document.select';

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

  async createDocument(userId: string, createDocumentDto: CreateDocumentDto) {
    try {
      const { content, type, jobTitle } = createDocumentDto;
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
}
