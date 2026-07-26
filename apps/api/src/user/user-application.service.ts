import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogoutResponseDto } from 'src/auth/dto/logout-response.dto';
import { toEnrichedUserDto } from 'src/auth/mappers/enriched-user.mapper';
import { EnrichedUserDto } from './dto/enriched-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Injectable()
export class UserApplicationService {
  constructor(private readonly userService: UserService) {}

  updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = `/user/avatar/${userId}?v=${Date.now()}`;
    await this.userService.updateAvatar(
      userId,
      file.buffer,
      file.mimetype,
      avatarUrl,
    );
    return { avatarUrl };
  }

  async removeAvatar(userId: string): Promise<{ ok: true }> {
    await this.userService.deleteAvatar(userId);
    return { ok: true };
  }

  async getAvatar(
    currentUserId: string,
    userId: string,
  ): Promise<{ data: Buffer; mimeType: string }> {
    if (currentUserId !== userId) {
      throw new ForbiddenException('Cannot access another user avatar');
    }

    const avatar = await this.userService.getAvatarData(userId);
    if (!avatar) throw new NotFoundException('No avatar found');
    return avatar;
  }

  async deleteMe(
    userId: string,
    req: Request,
    res: Response,
  ): Promise<LogoutResponseDto> {
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
          } catch {
            reject(new InternalServerErrorException('Failed to delete user'));
          }
        });
      });
    });
  }

  async deleteUser(currentUserId: string, id: string) {
    if (currentUserId !== id) {
      throw new ForbiddenException('Cannot delete another user');
    }

    return this.userService.deleteUser(id);
  }

  async findUserById(
    currentUserId: string,
    id: string,
  ): Promise<EnrichedUserDto> {
    if (currentUserId !== id) {
      throw new ForbiddenException('Cannot access another user');
    }

    const user = await this.userService.findEnrichedUser(id);
    return toEnrichedUserDto(user);
  }
}
