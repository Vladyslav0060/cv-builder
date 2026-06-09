import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma/enums';

export class GetDocumentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ nullable: true, type: String })
  @IsString()
  content: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
