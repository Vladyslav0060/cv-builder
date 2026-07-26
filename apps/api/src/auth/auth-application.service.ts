import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SafeUser } from 'src/user/user.select';
import { AuthService } from './auth.service';
import { TransferSessionDto } from './dto/transfer-session.dto';
import { toMeDto } from './mappers/me.mapper';

type SessionRequest = {
  logIn(user: unknown, callback: (err?: unknown) => void): void;
};

@Injectable()
export class AuthApplicationService {
  constructor(private readonly authService: AuthService) {}

  async registerAndCreateSession(req: SessionRequest, dto: CreateUserDto) {
    const user = await this.authService.register(dto);
    await this.logIn(req, user);
    return user;
  }

  async transferSession(req: SessionRequest, dto: TransferSessionDto) {
    const userId = this.authService.verifyTransferToken(dto.token);
    if (!userId) throw new UnauthorizedException('Invalid or expired token');

    const user = await this.authService.getUserForSession(userId);
    if (!user) throw new UnauthorizedException('User not found');

    await this.logIn(req, user);
    return toMeDto(user);
  }

  createGoogleTransferToken(user: SafeUser): string {
    return this.authService.createTransferToken(user.id);
  }

  private logIn(req: SessionRequest, user: unknown): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      req.logIn(user, (err?: unknown) => (err ? reject(err) : resolve())),
    );
  }
}
