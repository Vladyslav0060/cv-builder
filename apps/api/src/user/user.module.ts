import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserApplicationService } from './user-application.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, UserApplicationService],
  controllers: [UserController],
  exports: [UserService, UserApplicationService],
})
export class UserModule {}
