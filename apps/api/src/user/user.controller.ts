import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  FileTypeValidator,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { LogoutResponseDto } from 'src/auth/dto/logout-response.dto';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SafeUser } from './user.select';
import { UserApplicationService } from './user-application.service';

const AVATAR_FILE_SIZE_LIMIT_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPE_PATTERN = /^image\/(jpeg|png|webp|gif)$/;

@Controller('user')
export class UserController {
  constructor(private userApplicationService: UserApplicationService) {}

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
    return this.userApplicationService.updateUser(
      currentUser.id,
      updateUserDto,
    );
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
      limits: { fileSize: AVATAR_FILE_SIZE_LIMIT_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!AVATAR_MIME_TYPE_PATTERN.test(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPEG, PNG, WebP, and GIF images are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() currentUser: SafeUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: AVATAR_FILE_SIZE_LIMIT_BYTES }),
          new FileTypeValidator({ fileType: AVATAR_MIME_TYPE_PATTERN }),
        ],
      }),
    )
    file: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    },
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.userApplicationService.uploadAvatar(currentUser.id, file);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove avatar' })
  @UseGuards(AuthenticatedGuard)
  async removeAvatar(@CurrentUser() currentUser: SafeUser) {
    return this.userApplicationService.removeAvatar(currentUser.id);
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
    const avatar = await this.userApplicationService.getAvatar(
      currentUser.id,
      userId,
    );
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
    return this.userApplicationService.deleteMe(currentUser.id, req, res);
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
    return this.userApplicationService.deleteUser(currentUser.id, id);
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
    return this.userApplicationService.findUserById(currentUser.id, id);
  }
}
