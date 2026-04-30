import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { PostgresSessionStore } from './auth/postgres-session.store';

const PORT = process.env.PORT ?? 5050;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const authRedirectUrl = process.env.AUTH_SUCCESS_REDIRECT_URL;
  const frontendOrigin = authRedirectUrl
    ? new URL(authRedirectUrl).origin
    : undefined;
  const isCrossSiteDeployment =
    !!frontendOrigin && !frontendOrigin.includes('localhost');

  const config = new DocumentBuilder()
    .setTitle('CV Assistant')
    .setVersion('1.0')
    .addTag('cv_assistant')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  app.use(cookieParser(process.env.APP_SECRET));
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL or DIRECT_URL is not set. Provide one for the session store.',
    );
  }

  const sessionStore = new PostgresSessionStore(connectionString);
  await sessionStore.init();

  app.use(
    session({
      secret: process.env.APP_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      name: 'sid',
      rolling: true,
      proxy: true,
      cookie: {
        httpOnly: true,
        sameSite: isCrossSiteDeployment ? 'none' : 'lax',
        secure: isCrossSiteDeployment ? 'auto' : false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    origin: frontendOrigin ? [frontendOrigin] : false,
    credentials: true,
    exposedHeaders: ['Authorization'],
  });

  await app.listen(PORT).then(() => console.log(`Started on ${PORT}`));
}
bootstrap();
