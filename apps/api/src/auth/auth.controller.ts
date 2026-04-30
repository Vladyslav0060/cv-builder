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
import { CreateUserDto, UserRole } from 'src/user/dto/create-user.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { User } from 'generated/prisma/client';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { Roles } from './decorators/roles.decorator';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { RolesGuard } from './guards/roles.guard';
import { MeDto } from './dto/me.dto';
import { toMeDto } from './mappers/me.mapper';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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
  signUp(@Body() createUserDto: CreateUserDto): any {
    return this.authService.register(createUserDto);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: Request & { user?: any },
    @Res({ passthrough: true }) res: Response,
  ): MeDto | void {
    if (!req.user) throw new UnauthorizedException();

    const redirectUrl = process.env.AUTH_SUCCESS_REDIRECT_URL;
    if (redirectUrl) {
      const url = new URL(redirectUrl);
      url.searchParams.set('auth', 'google');
      res.redirect(url.toString());
      return;
    }
    return toMeDto(req.user);
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
  @Roles(UserRole.USER, UserRole.ADMIN)
  @UseGuards(AuthenticatedGuard, RolesGuard)
  me(@Req() req: any): MeDto {
    console.log('req?.user: ', req?.user);
    if (!req.user) throw new UnauthorizedException();
    return toMeDto(req.user);
  }
}
