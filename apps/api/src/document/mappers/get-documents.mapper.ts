import { DocumentType } from 'generated/prisma/enums';
import { GetDocumentsPreviewDto } from '../dto/get-documents-preview.dto';

export const toGetDocumentsPreviewDto = (
  document: any,
): GetDocumentsPreviewDto => {
  return {
    id: document?.id || '',
    title: document?.title || '',
    type: document?.type || DocumentType.COVER_LETTER,
    updatedAt: document?.updatedAt || new Date(),
  };
};
