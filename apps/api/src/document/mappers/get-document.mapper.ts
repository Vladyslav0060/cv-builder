import { GetDocumentDto } from '../dto/get-document.dto';

export const toGetDocumentDto = (document: any): GetDocumentDto => {
  return {
    id: document?.id || '',
    content: document?.content || '',
    title: document?.title || '',
    type: document?.type || '',
    updatedAt: document?.updatedAt || new Date(),
    createdAt: document?.createdAt || new Date(),
  };
};
