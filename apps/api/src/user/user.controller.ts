import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { EnrichedUserDto } from './dto/enriched-user.dto';
import { toEnrichedUserDto } from 'src/auth/mappers/enriched-user.mapper';
import { LogoutResponseDto } from 'src/auth/dto/logout-response.dto';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SafeUser } from './user.select';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  @ApiOperation({ summary: 'Update user' })
  @UseGuards(AuthenticatedGuard)
  @ApiBody({
    description: 'Payload for updating a user',
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Example User',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  async updateUser(
    @CurrentUser() currentUser: SafeUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(currentUser.id, updateUserDto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload avatar image (stored in DB)' })
  @UseGuards(AuthenticatedGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() currentUser: SafeUser,
    @UploadedFile()
    file: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    },
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const userId: string = currentUser.id;
    const avatarUrl = `/user/avatar/${userId}?v=${Date.now()}`;
    await this.userService.updateAvatar(
      userId,
      file.buffer,
      file.mimetype,
      avatarUrl,
    );
    return { avatarUrl };
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove avatar' })
  @UseGuards(AuthenticatedGuard)
  async removeAvatar(@CurrentUser() currentUser: SafeUser) {
    await this.userService.deleteAvatar(currentUser.id);
    return { ok: true };
  }

  @Get('avatar/:userId')
  @ApiOperation({ summary: 'Serve avatar image' })
  @ApiParam({ name: 'userId', required: true })
  @UseGuards(AuthenticatedGuard)
  async getAvatar(
    @CurrentUser() currentUser: SafeUser,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    if (currentUser.id !== userId) {
      throw new ForbiddenException('Cannot access another user avatar');
    }

    const avatar = await this.userService.getAvatarData(userId);
    if (!avatar) throw new NotFoundException('No avatar found');
    (res as any).set('Content-Type', avatar.mimeType);
    (res as any).set('Cache-Control', 'private, max-age=31536000, immutable');
    (res as any).end(avatar.data);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete the currently authenticated user account' })
  @ApiOkResponse({
    description: 'Account deleted and session cleared',
    type: LogoutResponseDto,
  })
  @UseGuards(AuthenticatedGuard)
  deleteMe(
    @CurrentUser() currentUser: SafeUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const userId: string = currentUser.id;

    return new Promise<LogoutResponseDto>((resolve, reject) => {
      req.logout((err: any) => {
        if (err)
          return reject(new InternalServerErrorException('Logout failed'));

        req.session?.destroy(async (sessionErr: any) => {
          if (sessionErr) {
            return reject(
              new InternalServerErrorException('Session destroy failed'),
            );
          }

          res.clearCookie('sid');

          try {
            await this.userService.deleteUser(userId);
            resolve({ ok: true });
          } catch (deleteErr) {
            reject(new InternalServerErrorException('Failed to delete user'));
          }
        });
      });
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User has been deleted' })
  @ApiParam({ name: 'id', example: '1', required: true })
  @UseGuards(AuthenticatedGuard)
  async deleteUser(
    @CurrentUser() currentUser: SafeUser,
    @Param('id') id: string,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('Cannot delete another user');
    }

    return this.userService.deleteUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user data' })
  @ApiParam({ name: 'id', example: '1', required: true })
  @ApiOkResponse({
    description: 'User has been found',
    type: EnrichedUserDto,
  })
  @UseGuards(AuthenticatedGuard)
  async findUserById(
    @CurrentUser() currentUser: SafeUser,
    @Param('id') id: string,
  ): Promise<EnrichedUserDto> {
    if (currentUser.id !== id) {
      throw new ForbiddenException('Cannot access another user');
    }

    const res = await this.userService.findEnrichedUser(id);
    return toEnrichedUserDto(res);
  }
}
