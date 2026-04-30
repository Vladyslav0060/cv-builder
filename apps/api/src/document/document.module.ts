import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { UserModule } from 'src/user/user.module';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';
import { AiService } from 'src/ai/ai.service';

@Module({
  imports: [PrismaModule],
  providers: [DocumentService, UserService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
