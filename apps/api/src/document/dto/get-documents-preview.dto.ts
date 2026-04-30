import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma/enums';

export class GetDocumentsPreviewDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  updatedAt: Date;
}
