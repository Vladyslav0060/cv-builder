import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateDocumentContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100000)
  content: string;
}
