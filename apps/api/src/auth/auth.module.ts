import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { UserModule } from 'src/user/user.module';
import { SessionSerializer } from './session.serializer';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    UserModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, SessionSerializer],
})
export class AuthModule {}
