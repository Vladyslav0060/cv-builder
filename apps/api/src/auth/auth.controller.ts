import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { User } from 'generated/prisma/client';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Request, Response } from 'express';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { MeDto } from './dto/me.dto';
import { toMeDto } from './mappers/me.mapper';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { SafeUser } from 'src/user/user.select';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Local Strategy Login' })
  @ApiBody({
    description: 'Payload for logging in',
    type: LoginDto,
    examples: {
      default: {
        summary: 'Example User',
        value: {
          email: 'john.doe@example.com',
          password: '123',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  login(@Body() loginDto: LoginDto): Promise<User> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Payload for creating a user',
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Example User',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: '',
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Req() req: any,
    @Body() createUserDto: CreateUserDto,
  ): Promise<any> {
    const user = await this.authService.register(createUserDto);
    await new Promise<void>((resolve, reject) =>
      req.logIn(user, (err: any) => (err ? reject(err) : resolve())),
    );
    return user;
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address with 6-digit code' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  verifyEmail(
    @CurrentUser() currentUser: SafeUser,
    @Body() dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(currentUser.id, dto.code);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token from email' })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  resendVerification(@CurrentUser() currentUser: SafeUser) {
    return this.authService.resendVerification(currentUser.id);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: Request & { user?: any; session?: any },
    @Res({ passthrough: true }) res: Response,
  ): MeDto | void {
    if (!req.user) throw new UnauthorizedException();

    const redirectUrl = process.env.AUTH_SUCCESS_REDIRECT_URL;
    if (redirectUrl) {
      const transferToken = this.authService.createTransferToken(req.user.id);
      // Destroy session now; a new one is created via POST /auth/transfer-session
      // through the frontend proxy so the cookie lands on the frontend domain.
      req.session?.destroy(() => {});
      const url = new URL(redirectUrl);
      url.searchParams.set('transfer_token', transferToken);
      res.redirect(url.toString());
      return;
    }
    return toMeDto(req.user);
  }

  @Post('transfer-session')
  @ApiOperation({
    summary: 'Exchange a Google OAuth transfer token for a session',
  })
  @HttpCode(HttpStatus.OK)
  async transferSession(
    @Req() req: any,
    @Body('token') token: string,
  ): Promise<MeDto> {
    const userId = this.authService.verifyTransferToken(token);
    if (!userId) throw new UnauthorizedException('Invalid or expired token');
    const user = await this.authService.getUserForSession(userId);
    if (!user) throw new UnauthorizedException('User not found');
    await new Promise<void>((resolve, reject) =>
      req.logIn(user, (err: any) => (err ? reject(err) : resolve())),
    );
    return toMeDto(user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiOkResponse({
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    return this.authService.logout(req, res);
  }

  @Get('me')
  @ApiOkResponse({ type: MeDto })
  @UseGuards(AuthenticatedGuard)
  me(@CurrentUser() currentUser: SafeUser): MeDto {
    return toMeDto(currentUser);
  }
}
