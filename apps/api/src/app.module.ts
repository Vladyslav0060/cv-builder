import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsageModule } from './usage/usage.module';
import {
  aiConfig,
  appConfig,
  authConfig,
  databaseConfig,
  mailConfig,
  stripeConfig,
  webConfig,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        mailConfig,
        aiConfig,
        stripeConfig,
        webConfig,
      ],
    }),
    AuthModule,
    DocumentModule,
    SubscriptionModule,
    UsageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
