import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProvider, User } from 'generated/prisma/client';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import * as crypto from 'crypto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { safeUserSelect, SafeUser } from 'src/user/user.select';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userFields } = createUserDto;
    const passwordHash = await argon.hash(password);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        ...userFields,
        credential: {
          create: { passwordHash, verifyCode: code, verifyCodeExpiresAt: expiresAt },
        },
      },
    });

    this.mailService
      .sendVerificationEmail(user.email, code)
      .catch((err) =>
        this.logger.error('Failed to send verification email', err),
      );

    return user;
  }

  async login({ email, password }: LoginDto): Promise<User> {
    const user = await this.userService.findUserWithCredentials({
      email,
    });

    if (user && user.credential?.passwordHash) {
      const userPassword = await argon.verify(
        user.credential?.passwordHash,
        password,
      );

      if (!userPassword) throw new ForbiddenException('Invalid Credentials');
      const { credential, ...result } = user;
      return result;
    }

    throw new NotFoundException("User doesn't exist");
  }

  async logout(req: Request, res: Response): Promise<LogoutResponseDto> {
    return new Promise<LogoutResponseDto>((resolve, reject) => {
      req.logout((err: any) => {
        if (err) {
          return reject(new InternalServerErrorException('Logout failed'));
        }

        req.session?.destroy((sessionErr: any) => {
          if (sessionErr) {
            return reject(
              new InternalServerErrorException('Session destroy failed'),
            );
          }

          res.clearCookie('sid');
          resolve({ ok: true });
        });
      });
    });
  }

  async verifyEmail(userId: string, code: string): Promise<{ ok: boolean }> {
    const credential = await this.prisma.credential.findUnique({
      where: { userId },
    });

    if (!credential) {
      throw new BadRequestException('No pending verification found');
    }
    if (credential.emailVerified) {
      return { ok: true };
    }
    if (!credential.verifyCode || credential.verifyCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (
      !credential.verifyCodeExpiresAt ||
      credential.verifyCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.credential.update({
      where: { id: credential.id },
      data: {
        emailVerified: true,
        verifyCode: null,
        verifyCodeExpiresAt: null,
      },
    });

    return { ok: true };
  }

  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const credential = await this.prisma.credential.findUnique({
        where: { userId: user.id },
      });

      if (credential) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await this.prisma.credential.update({
          where: { id: credential.id },
          data: { resetToken: token, resetTokenExpiresAt: expiresAt },
        });

        this.mailService
          .sendPasswordResetEmail(email, token)
          .catch((err) =>
            this.logger.error('Failed to send password reset email', err),
          );
      }
    }

    return { ok: true };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ ok: boolean }> {
    const credential = await this.prisma.credential.findUnique({
      where: { resetToken: token },
    });

    if (!credential) {
      throw new BadRequestException('Invalid reset token');
    }
    if (
      !credential.resetTokenExpiresAt ||
      credential.resetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await argon.hash(newPassword);

    await this.prisma.credential.update({
      where: { id: credential.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { ok: true };
  }

  async resendVerification(userId: string): Promise<{ ok: boolean }> {
    const credential = await this.prisma.credential.findUnique({
      where: { userId },
    });

    if (!credential || credential.emailVerified) {
      return { ok: true };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.credential.update({
      where: { id: credential.id },
      data: { verifyCode: code, verifyCodeExpiresAt: expiresAt },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    this.mailService
      .sendVerificationEmail(user.email, code)
      .catch((err) =>
        this.logger.error('Failed to resend verification email', err),
      );

    return { ok: true };
  }

  createTransferToken(userId: string): string {
    const exp = Date.now() + 30_000;
    const payload = Buffer.from(JSON.stringify({ userId, exp })).toString('base64url');
    const sig = crypto
      .createHmac('sha256', process.env.APP_SECRET!)
      .update(payload)
      .digest('base64url');
    return `${payload}.${sig}`;
  }

  verifyTransferToken(token: string): string | null {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx < 0) return null;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = crypto
      .createHmac('sha256', process.env.APP_SECRET!)
      .update(payload)
      .digest('base64url');
    if (sig !== expected) return null;
    try {
      const parsed = JSON.parse(
        Buffer.from(payload, 'base64url').toString(),
      ) as { userId: string; exp: number };
      if (Date.now() > parsed.exp) return null;
      return parsed.userId;
    } catch {
      return null;
    }
  }

  async getUserForSession(userId: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
  }

  async loginWithGoogle(profile: {
    id: string;
    emails?: Array<{ value: string }>;
    name?: { givenName?: string; familyName?: string };
    photos?: Array<{ value: string }>;
  }): Promise<SafeUser> {
    const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();
    if (!email) {
      throw new UnauthorizedException(
        'Google account does not provide an email',
      );
    }

    const providerAccountId = profile.id;
    const firstName = profile.name?.givenName?.trim() || null;
    const lastName = profile.name?.familyName?.trim() || null;
    const avatarUrl = profile.photos?.[0]?.value?.trim() || null;

    return this.prisma.$transaction(async (tx) => {
      const existingOAuth = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: AuthProvider.google,
            providerAccountId,
          },
        },
        include: { user: { select: safeUserSelect } },
      });

      if (existingOAuth?.user) {
        return existingOAuth.user;
      }

      const existingUser = await tx.user.findUnique({
        where: { email },
        select: safeUserSelect,
      });

      if (existingUser) {
        await tx.oAuthAccount.create({
          data: {
            provider: AuthProvider.google,
            providerAccountId,
            email,
            userId: existingUser.id,
          },
        });

        return existingUser;
      }

      return tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatarUrl,
          oauth: {
            create: {
              provider: AuthProvider.google,
              providerAccountId,
              email,
            },
          },
        },
        select: safeUserSelect,
      });
    });
  }
}
