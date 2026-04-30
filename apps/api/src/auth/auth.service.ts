import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProvider, User } from 'generated/prisma/client';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { safeUserSelect, SafeUser } from 'src/user/user.select';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(createUserDto);
    const { credential, ...result } = user;
    return result;
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
