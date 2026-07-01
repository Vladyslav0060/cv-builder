import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequireTier } from '../decorators/require-tier.decorator';
import { ACTIVE_STATUSES, TIER_RANK } from 'src/subscription/utils';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    const requiredTier = this.reflector.get(RequireTier, ctx.getHandler());

    if (!requiredTier) return true;

    const user = await this.prisma.forUser(req.user.id, (tx) =>
      tx.user.findUnique({
        where: { id: req.user.id },
        select: { subscription: { select: { tier: true, status: true } } },
      }),
    );

    if (!user) throw new UnauthorizedException('User not found');
    if (!user?.subscription?.tier || !user.subscription?.status) return false;
    const userTier = user?.subscription?.tier;
    const userStatus = user.subscription?.status;

    const response =
      TIER_RANK[userTier] >= TIER_RANK[requiredTier] &&
      ACTIVE_STATUSES.includes(userStatus);

    return response;
  }
}
