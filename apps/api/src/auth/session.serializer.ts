import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { PrismaService } from '../prisma/prisma.service';
import { safeUserSelect } from 'src/user/user.select';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  serializeUser(
    user: any,
    done: (err: Error | null, id?: string) => void,
  ): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user?: any) => void,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: safeUserSelect,
      });
      done(null, user ?? false);
    } catch (err) {
      done(err as Error);
    }
  }
}
