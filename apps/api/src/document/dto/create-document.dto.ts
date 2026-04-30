import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma/enums';

export class CreateDocumentDto {
  @ApiProperty({ required: true })
  @IsString()
  jobTitle: string;

  @ApiProperty({ required: true })
  @IsString()
  company: string;

  @ApiProperty({ required: true })
  @IsString()
  description: string;

  @ApiProperty({
    required: true,
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ required: true })
  @IsString()
  content: string;
}
